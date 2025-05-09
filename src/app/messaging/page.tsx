'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // useSearchParams for query param
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mockUserProfiles, getMessagesWithUser as fetchMessagesWithUser } from "@/lib/mock-data"; // getCurrentUser removed
import type { Message, UserProfile } from "@/types";
import { Archive, Edit, Filter, Loader2, Paperclip, Phone, Search, Send, Smile, Video } from "lucide-react";
import { useAuth } from '@/context/auth-context';

// For now, let's get active chat partner from query param or default
// const DEFAULT_CHATTING_WITH_USER_ID = '2';


async function ChatMessage({ message, isCurrentUserSender, allUsers }: { message: Message, isCurrentUserSender: boolean, allUsers: UserProfile[] }) {
  // The sender for this message. If it's the current user, their profile is in `currentUserFromAuth`.
  // If not, find from `allUsers`.
  const sender = allUsers.find(p => p.uid === message.senderId);
  if (!sender) return null;


  return (
    <div className={`flex items-end space-x-2 mb-4 ${isCurrentUserSender ? 'justify-end' : ''}`}>
      {!isCurrentUserSender && (
        <Link href={`/profile/${sender.uid}`}>
          <Avatar className="h-8 w-8">
            <AvatarImage src={sender.profilePictureUrl} alt={sender.firstName} data-ai-hint="user avatar small"/>
            <AvatarFallback>{sender.firstName?.charAt(0)}</AvatarFallback>
          </Avatar>
        </Link>
      )}
      <div className={`p-3 rounded-lg max-w-xs lg:max-w-md ${isCurrentUserSender ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none'}`}>
        <p className="text-sm">{message.content}</p>
        <p className={`text-xs mt-1 ${isCurrentUserSender ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
       {isCurrentUserSender && ( // Current user's avatar on the right
         <Link href={`/profile/${sender.uid}`}>
           <Avatar className="h-8 w-8">
            <AvatarImage src={sender.profilePictureUrl} alt={sender.firstName} data-ai-hint="user avatar small"/>
            <AvatarFallback>{sender.firstName?.charAt(0)}</AvatarFallback>
          </Avatar>
        </Link>
      )}
    </div>
  );
}

export default function MessagingPage() {
  const { currentUser, loadingAuth } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatWithUserId = searchParams.get('chatWith');

  const [conversations, setConversations] = useState<UserProfile[]>([]);
  const [activeChatPartner, setActiveChatPartner] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // All user profiles (mock for now, needed for avatars etc.)
  const allMockProfiles = mockUserProfiles.map(p => ({...p, uid: p.id, email: `${p.firstName.toLowerCase()}@example.com`, createdAt: new Date().toISOString()}));


  useEffect(() => {
    if (!loadingAuth && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, loadingAuth, router]);

  useEffect(() => {
    async function loadInitialData() {
      if (currentUser) {
        setIsLoadingData(true);
        // Simplistic conversation list (all users except current user)
        const convos = allMockProfiles.filter(p => p.uid !== currentUser.uid);
        setConversations(convos);

        const targetUserId = chatWithUserId || (convos.length > 0 ? convos[0].uid : null);

        if (targetUserId) {
          const partner = allMockProfiles.find(p => p.uid === targetUserId);
          setActiveChatPartner(partner || null);
          if (partner) {
            const msgs = await fetchMessagesWithUser(partner.uid); // This mock fn uses 'id', adapt if needed
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
  }, [currentUser, loadingAuth, chatWithUserId]);


  if (loadingAuth || (!currentUser && !loadingAuth)) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-12rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  if (!currentUser) return null;


  return (
    <div className="flex h-[calc(100vh-10rem)] border rounded-lg overflow-hidden"> {/* Adjust height as needed */}
      {/* Conversation List Sidebar */}
      <aside className="w-1/3 border-r bg-muted/50">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">Messaging</h2>
            <div className="space-x-1">
                <Button variant="ghost" size="icon"><Edit className="h-5 w-5" /></Button>
                <Button variant="ghost" size="icon"><Filter className="h-5 w-5" /></Button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search messages" className="pl-8 bg-background" />
          </div>
        </div>
        <ScrollArea className="h-[calc(100%-8rem)]"> {/* Adjust height */}
          {isLoadingData ? (
             <div className="p-4 text-center"><Loader2 className="h-6 w-6 animate-spin text-primary mx-auto"/></div>
          ) : conversations.map(user => (
            <Link href={`/messaging?chatWith=${user.uid}`} key={user.uid} className={`block p-3 hover:bg-accent/50 border-b ${user.uid === activeChatPartner?.uid ? 'bg-accent/60' : ''}`}>
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={user.profilePictureUrl} alt={user.firstName} data-ai-hint="user avatar"/>
                  <AvatarFallback>{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{user.firstName} {user.lastName}</h3>
                  <p className="text-sm text-muted-foreground truncate max-w-[150px] sm:max-w-[200px]">
                    {/* Mock last message */}
                    {messages.length > 0 && user.uid === activeChatPartner?.uid ? messages[messages.length - 1].content : `Start a conversation...`}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </ScrollArea>
      </aside>

      {/* Chat Area */}
      <section className="flex-grow flex flex-col bg-background">
        {isLoadingData && !activeChatPartner ? (
             <div className="flex-grow flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary"/></div>
        ) : activeChatPartner ? (
          <>
            <header className="p-4 border-b flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={activeChatPartner.profilePictureUrl} alt={activeChatPartner.firstName} data-ai-hint="user avatar"/>
                  <AvatarFallback>{activeChatPartner.firstName?.charAt(0)}{activeChatPartner.lastName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{activeChatPartner.firstName} {activeChatPartner.lastName}</h3>
                  <p className="text-xs text-muted-foreground">{activeChatPartner.headline}</p>
                </div>
              </div>
               <div className="flex space-x-2">
                <Button variant="ghost" size="icon"><Phone className="h-5 w-5" /></Button>
                <Button variant="ghost" size="icon"><Video className="h-5 w-5" /></Button>
                <Button variant="ghost" size="icon"><Archive className="h-5 w-5" /></Button>
              </div>
            </header>
            
            <ScrollArea className="flex-grow p-4 space-y-4">
              {isLoadingData ? (
                <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>
              ) : messages.map(msg => (
                <ChatMessage key={msg.id} message={msg} isCurrentUserSender={msg.senderId === currentUser.uid} allUsers={allMockProfiles} />
              ))}
            </ScrollArea>

            <footer className="p-4 border-t">
              <div className="flex items-center space-x-2">
                <Input placeholder="Write a message..." className="flex-grow" />
                <Button variant="ghost" size="icon"><Smile className="h-5 w-5" /></Button>
                <Button variant="ghost" size="icon"><Paperclip className="h-5 w-5" /></Button>
                <Button><Send className="h-5 w-5 mr-2" />Send</Button>
              </div>
            </footer>
          </>
        ) : (
            <div className="flex-grow flex items-center justify-center">
                <p className="text-muted-foreground">Select a conversation to start messaging.</p>
            </div>
        )}
      </section>
    </div>
  );
}
