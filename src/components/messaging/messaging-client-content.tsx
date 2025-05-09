
'use client';

import { useEffect, useState, useMemo, useRef } from 'react'; 
import { useRouter, useSearchParams } from 'next/navigation'; 
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Message, UserProfile } from "@/types";
import { Archive, Edit, Filter, Loader2, Paperclip, Phone, Search, Send, Smile, Video } from "lucide-react";
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';
import { createMessage, getMessagesBetweenUsers } from '@/lib/message-service';
import { getUserProfile } from '@/lib/user-service';
import { useToast } from '@/hooks/use-toast';

function ChatMessage({ message, isCurrentUserSender, senderProfile, receiverProfile }: { message: Message, isCurrentUserSender: boolean, senderProfile?: UserProfile | null, receiverProfile?: UserProfile | null }) {
  const displayProfile = isCurrentUserSender ? senderProfile : senderProfile; 
  
  if (!displayProfile) return null;


  return (
    <div className={`flex items-end space-x-2 mb-4 ${isCurrentUserSender ? 'justify-end' : ''}`}>
      {!isCurrentUserSender && (
        <Link href={`/profile/${displayProfile.uid}`}>
          <Avatar className="h-8 w-8">
            <AvatarImage src={displayProfile.profilePictureUrl} alt={displayProfile.firstName} data-ai-hint="user avatar small"/>
            <AvatarFallback>{displayProfile.firstName?.charAt(0)}</AvatarFallback>
          </Avatar>
        </Link>
      )}
      <div className={`p-3 rounded-lg max-w-xs lg:max-w-md ${isCurrentUserSender ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none'}`}>
        <p className="text-sm">{message.content}</p>
        <p className={`text-xs mt-1 ${isCurrentUserSender ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
       {isCurrentUserSender && senderProfile && ( 
         <Link href={`/profile/${senderProfile?.uid}`}>
           <Avatar className="h-8 w-8">
            <AvatarImage src={senderProfile?.profilePictureUrl} alt={senderProfile?.firstName} data-ai-hint="user avatar small"/>
            <AvatarFallback>{senderProfile?.firstName?.charAt(0)}</AvatarFallback>
          </Avatar>
        </Link>
      )}
    </div>
  );
}

export default function MessagingClientContent() {
  const { currentUser, loadingAuth } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatWithUserId = searchParams.get('chatWith');
  const { toast } = useToast();

  const [conversations, setConversations] = useState<UserProfile[]>([]);
  const [activeChatPartner, setActiveChatPartner] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [newMessageContent, setNewMessageContent] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const userProfilesCache = useRef<Map<string, UserProfile>>(new Map());

  const getCachedUserProfile = async (userId: string): Promise<UserProfile | null> => {
    if (userProfilesCache.current.has(userId)) {
      return userProfilesCache.current.get(userId)!;
    }
    const profile = await getUserProfile(userId);
    if (profile) {
      userProfilesCache.current.set(userId, profile);
    }
    return profile;
  };


  useEffect(() => {
    if (!loadingAuth && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, loadingAuth, router]);

  useEffect(() => {
    async function loadInitialData() {
      if (currentUser) {
        setIsLoadingData(true);
        userProfilesCache.current.set(currentUser.uid, currentUser);
        
        const connectedUserUIDs = currentUser.connections || [];
        const convosProfiles: UserProfile[] = [];
        for (const uid of connectedUserUIDs) {
          const profile = await getCachedUserProfile(uid);
          if (profile) convosProfiles.push(profile);
        }
        setConversations(convosProfiles);

        let targetUserId = chatWithUserId;
         // If chatWithUserId is present, ensure they are a connection
        if (targetUserId && !connectedUserUIDs.includes(targetUserId)) {
            targetUserId = null; 
            router.replace('/messaging'); // Remove invalid chatWith param
        }
        
        if (!targetUserId && convosProfiles.length > 0) {
            targetUserId = convosProfiles[0].uid; 
        }

        if (targetUserId) {
          const partner = await getCachedUserProfile(targetUserId);
          setActiveChatPartner(partner || null);
          if (partner) {
            const msgs = await getMessagesBetweenUsers(currentUser.uid, partner.uid); 
            setMessages(msgs);
          } else {
            setMessages([]);
          }
        } else {
            setActiveChatPartner(null);
            setMessages([]);
        }
        setIsLoadingData(false);
      }
    }

    if (!loadingAuth && currentUser) {
      loadInitialData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, loadingAuth, chatWithUserId, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessageContent.trim() || !currentUser || !activeChatPartner) return;
    setIsSendingMessage(true);
    try {
      const messageId = await createMessage(currentUser.uid, activeChatPartner.uid, newMessageContent);
      const newMessage: Message = {
        id: messageId,
        senderId: currentUser.uid,
        receiverId: activeChatPartner.uid,
        content: newMessageContent,
        timestamp: new Date().toISOString(),
        isRead: false,
      };
      setMessages(prev => [...prev, newMessage]);
      setNewMessageContent('');
    } catch (error) {
      console.error("Error sending message:", error);
      toast({ title: "Error", description: "Could not send message.", variant: "destructive" });
    } finally {
      setIsSendingMessage(false);
    }
  };


  if (loadingAuth || (!currentUser && !loadingAuth && !isLoadingData)) { // Added !isLoadingData to prevent flash of loader if data is already loaded
    return (
      <div className="flex justify-center items-center h-[calc(100vh-10rem)] border rounded-lg">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  if (!currentUser) return null; // Should be handled by redirect above, but good failsafe

  return (
    <div className="flex h-[calc(100vh-10rem)] border rounded-lg overflow-hidden">
      <aside className="w-1/3 border-r bg-muted/50">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">Messaging</h2>
            <div className="space-x-1">
                <Button variant="ghost" size="icon" disabled><Edit className="h-5 w-5" /></Button>
                <Button variant="ghost" size="icon" disabled><Filter className="h-5 w-5" /></Button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search messages" className="pl-8 bg-background" disabled/>
          </div>
        </div>
        <ScrollArea className="h-[calc(100%-8rem)]">
          {isLoadingData && conversations.length === 0 ? ( // Show loader only if conversations are empty and loading
             <div className="p-4 text-center"><Loader2 className="h-6 w-6 animate-spin text-primary mx-auto"/></div>
          ) : conversations.length === 0 ? (
            <p className="p-4 text-center text-muted-foreground">No connections to message. Connect with people to start chatting.</p>
          )
          : conversations.map(user => (
            <Link href={`/messaging?chatWith=${user.uid}`} key={user.uid} className={`block p-3 hover:bg-accent/50 border-b ${user.uid === activeChatPartner?.uid ? 'bg-accent/60' : ''}`}>
              <div className="flex items-center space-x-3">
                <div className="relative">
                    <Avatar>
                    <AvatarImage src={user.profilePictureUrl} alt={user.firstName} data-ai-hint="user avatar"/>
                    <AvatarFallback>{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className={cn(
                        "absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-background",
                        user.isActive ? "bg-green-500" : "bg-gray-400"
                    )} />
                </div>
                <div>
                  <h3 className="font-medium">{user.firstName} {user.lastName}</h3>
                  <p className="text-sm text-muted-foreground truncate max-w-[150px] sm:max-w-[200px]">
                    Start a conversation...
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </ScrollArea>
      </aside>

      <section className="flex-grow flex flex-col bg-background">
        {isLoadingData && !activeChatPartner ? ( // Show loader if loading and no active chat partner
             <div className="flex-grow flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary"/></div>
        ) : activeChatPartner ? (
          <>
            <header className="p-4 border-b flex justify-between items-center">
              <div className="flex items-center space-x-3">
                 <div className="relative">
                    <Avatar>
                    <AvatarImage src={activeChatPartner.profilePictureUrl} alt={activeChatPartner.firstName} data-ai-hint="user avatar"/>
                    <AvatarFallback>{activeChatPartner.firstName?.charAt(0)}{activeChatPartner.lastName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className={cn(
                        "absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-background",
                        activeChatPartner.isActive ? "bg-green-500" : "bg-gray-400"
                    )} />
                </div>
                <div>
                  <h3 className="font-semibold">{activeChatPartner.firstName} {activeChatPartner.lastName}</h3>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <p className="mr-2">{activeChatPartner.headline}</p>
                    <span>•</span>
                    <p className="ml-2">{activeChatPartner.isActive ? "Active now" : "Offline"}</p>
                  </div>
                </div>
              </div>
               <div className="flex space-x-2">
                <Button variant="ghost" size="icon" disabled><Phone className="h-5 w-5" /></Button>
                <Button variant="ghost" size="icon" disabled><Video className="h-5 w-5" /></Button>
                <Button variant="ghost" size="icon" disabled><Archive className="h-5 w-5" /></Button>
              </div>
            </header>
            
            <ScrollArea className="flex-grow p-4 space-y-4">
              {isLoadingData && messages.length === 0 ? ( // Show loader for messages only if empty and loading
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                </div>
              ) : messages.map(msg => (
                <ChatMessage 
                  key={msg.id} 
                  message={msg} 
                  isCurrentUserSender={msg.senderId === currentUser.uid} 
                  senderProfile={msg.senderId === currentUser.uid ? currentUser : activeChatPartner}
                  receiverProfile={msg.receiverId === currentUser.uid ? currentUser : activeChatPartner}
                />
              ))}
              <div ref={messagesEndRef} />
            </ScrollArea>

            <footer className="p-4 border-t">
              <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-center space-x-2">
                <Input 
                    placeholder="Write a message..." 
                    className="flex-grow" 
                    value={newMessageContent}
                    onChange={(e) => setNewMessageContent(e.target.value)}
                    disabled={isSendingMessage}
                />
                <Button variant="ghost" size="icon" disabled><Smile className="h-5 w-5" /></Button>
                <Button variant="ghost" size="icon" disabled><Paperclip className="h-5 w-5" /></Button>
                <Button type="submit" disabled={isSendingMessage || !newMessageContent.trim()}>
                    {isSendingMessage ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="h-5 w-5 mr-2" />}
                    Send
                </Button>
              </form>
            </footer>
          </>
        ) : (
            <div className="flex-grow flex items-center justify-center">
                <p className="text-muted-foreground">
                    {conversations.length > 0 ? "Select a connection to start messaging." : "Connect with people to start messaging."}
                </p>
            </div>
        )}
      </section>
    </div>
  );
}

