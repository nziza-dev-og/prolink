import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { mockUserProfiles, getMessagesWithUser, getCurrentUser } from "@/lib/mock-data";
import type { Message, UserProfile } from "@/types";
import { Archive, Edit, Filter, Paperclip, Search, Send, Smile, Phone, Video } from "lucide-react";
import Link from "next/link";

// For now, let's assume we are chatting with Bob (mockUserProfiles[1])
const CHATTING_WITH_USER_ID = '2';

async function ChatMessage({ message, isCurrentUser }: { message: Message, isCurrentUser: boolean }) {
  const sender = mockUserProfiles.find(p => p.id === message.senderId);
  if (!sender) return null;

  return (
    <div className={`flex items-end space-x-2 mb-4 ${isCurrentUser ? 'justify-end' : ''}`}>
      {!isCurrentUser && (
        <Link href={`/profile/${sender.id}`}>
          <Avatar className="h-8 w-8">
            <AvatarImage src={sender.profilePictureUrl} alt={sender.firstName} data-ai-hint="user avatar small"/>
            <AvatarFallback>{sender.firstName.charAt(0)}</AvatarFallback>
          </Avatar>
        </Link>
      )}
      <div className={`p-3 rounded-lg max-w-xs lg:max-w-md ${isCurrentUser ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none'}`}>
        <p className="text-sm">{message.content}</p>
        <p className={`text-xs mt-1 ${isCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      {isCurrentUser && (
         <Link href={`/profile/${sender.id}`}>
          <Avatar className="h-8 w-8">
            <AvatarImage src={sender.profilePictureUrl} alt={sender.firstName} data-ai-hint="user avatar small"/>
            <AvatarFallback>{sender.firstName.charAt(0)}</AvatarFallback>
          </Avatar>
        </Link>
      )}
    </div>
  );
}

export default async function MessagingPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) return <p>Loading...</p>; // Or redirect to login

  const conversations = mockUserProfiles.filter(p => p.id !== currentUser.id); // Simplistic conversation list
  const activeChatPartner = mockUserProfiles.find(p => p.id === CHATTING_WITH_USER_ID);
  const messages = await getMessagesWithUser(CHATTING_WITH_USER_ID);

  if (!activeChatPartner) {
    return <p className="text-center py-10">Select a conversation to start messaging.</p>;
  }
  

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
          {conversations.map(user => (
            <Link href={`/messaging?chatWith=${user.id}`} key={user.id} className={`block p-3 hover:bg-accent/50 border-b ${user.id === CHATTING_WITH_USER_ID ? 'bg-accent/60' : ''}`}>
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={user.profilePictureUrl} alt={user.firstName} data-ai-hint="user avatar"/>
                  <AvatarFallback>{user.firstName.charAt(0)}{user.lastName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{user.firstName} {user.lastName}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {/* Mock last message */}
                    {messages.length > 0 && user.id === CHATTING_WITH_USER_ID ? messages[messages.length - 1].content : `Last message with ${user.firstName}...`}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground ml-auto">
                  {/* Mock time */}
                  {new Date(Date.now() - Math.random() * 100000000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </Link>
          ))}
        </ScrollArea>
      </aside>

      {/* Chat Area */}
      <section className="flex-grow flex flex-col bg-background">
        {activeChatPartner && (
          <>
            <header className="p-4 border-b flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={activeChatPartner.profilePictureUrl} alt={activeChatPartner.firstName} data-ai-hint="user avatar"/>
                  <AvatarFallback>{activeChatPartner.firstName.charAt(0)}{activeChatPartner.lastName.charAt(0)}</AvatarFallback>
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
              {messages.map(msg => (
                <ChatMessage key={msg.id} message={msg} isCurrentUser={msg.senderId === currentUser.id} />
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
        )}
        {!activeChatPartner && (
            <div className="flex-grow flex items-center justify-center">
                <p className="text-muted-foreground">Select a conversation to start messaging.</p>
            </div>
        )}
      </section>
    </div>
  );
}
