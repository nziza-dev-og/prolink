
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getAllUserNotifications, createUserSpecificNotification } from "@/lib/notification-service"; 
import type { Notification } from "@/types"; 
import { BellRing, Briefcase, Loader2, MessageSquare, Settings, UserCheck, Users, Megaphone, FileText } from "lucide-react"; // Added FileText for job application
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';


function NotificationIcon({ type }: { type: Notification["type"] }) {
  switch (type) {
    case "connection_request":
      return <UserCheck className="h-5 w-5 text-green-500" />;
    case "message":
      return <MessageSquare className="h-5 w-5 text-blue-500" />;
    case "job_alert":
      return <Briefcase className="h-5 w-5 text-purple-500" />;
    case "profile_view":
      return <Users className="h-5 w-5 text-orange-500" />;
    case "post_like":
    case "post_comment":
    case "connection_accepted":
      return <BellRing className="h-5 w-5 text-yellow-500" />;
    case "admin_broadcast":
      return <Megaphone className="h-5 w-5 text-destructive" />;
    case "job_application_received":
      return <FileText className="h-5 w-5 text-indigo-500" />; // New icon for job applications
    default:
      return <BellRing className="h-5 w-5 text-muted-foreground" />;
  }
}

function NotificationItem({ notification }: { notification: Notification }) {
  const actor = notification.user; 
  const avatarHint = notification.type === 'admin_broadcast' || !actor ? "system icon" : "user avatar small";
  const fallbackName = actor?.name || (notification.type === 'admin_broadcast' ? 'A' : 'U');
  
  return (
    <Link href={notification.link || '#'} className={`block p-4 hover:bg-accent/50 ${!notification.isRead ? 'bg-primary/5' : ''}`}>
      <div className="flex items-start space-x-3">
        {actor?.avatarUrl ? (
          <Avatar className="h-10 w-10">
            <AvatarImage src={actor.avatarUrl} alt={actor.name} data-ai-hint={avatarHint}/>
            <AvatarFallback>{fallbackName.charAt(0)}</AvatarFallback>
          </Avatar>
        ) : (
          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-muted">
            <NotificationIcon type={notification.type} />
          </div>
        )}
        <div className="flex-grow">
          <p className="text-sm">{notification.content}</p>
          <p className="text-xs text-muted-foreground">
            {notification.timestamp.toLocaleDateString()} {notification.timestamp.toLocaleTimeString()}
          </p>
        </div>
        {!notification.isRead && <div className="h-2.5 w-2.5 bg-primary rounded-full self-center"></div>}
      </div>
    </Link>
  );
}

export default function NotificationsPage() {
  const { currentUser, loadingAuth } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);

  useEffect(() => {
    if (!loadingAuth && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, loadingAuth, router]);

  useEffect(() => {
     async function fetchNotifications() {
        if (currentUser) { 
            setIsLoadingNotifications(true);
            try {
                const userNotifications = await getAllUserNotifications(currentUser.uid);
                setNotifications(userNotifications);
            } catch (error) {
                console.error("Error fetching notifications:", error);
                toast({ title: "Error", description: "Could not load notifications.", variant: "destructive" });
            } finally {
                setIsLoadingNotifications(false);
            }
        }
     }
    if (!loadingAuth && currentUser) {
     fetchNotifications();
    }
  }, [currentUser, loadingAuth, toast]);

  if (loadingAuth || (!currentUser && !loadingAuth)) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-12rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  if (!currentUser) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="text-xl">Notifications</CardTitle>
          <Button variant="ghost" size="sm" disabled>
            <Settings className="mr-2 h-4 w-4" /> View settings
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {isLoadingNotifications ? (
            <div className="p-6 text-center"><Loader2 className="h-8 w-8 animate-spin text-primary mx-auto"/></div>
          ) : notifications.length === 0 ? (
            <p className="p-6 text-center text-muted-foreground">You have no new notifications.</p>
          ) : (
            notifications.map((notification, index) => (
              <div key={notification.id}>
                <NotificationItem notification={notification} />
                {index < notifications.length - 1 && <Separator />}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
