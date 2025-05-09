'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { generateMockNotifications } from "@/lib/mock-data"; // Updated import
import type { Notification } from "@/types"; // Updated import
import { BellRing, Briefcase, Loader2, MessageSquare, Settings, UserCheck, Users } from "lucide-react";
import { useAuth } from '@/context/auth-context';


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
      return <BellRing className="h-5 w-5 text-yellow-500" />;
    default:
      return <BellRing className="h-5 w-5 text-muted-foreground" />;
  }
}

function NotificationItem({ notification }: { notification: Notification }) {
  return (
    <Link href={notification.link || '#'} className={`block p-4 hover:bg-accent/50 ${!notification.isRead ? 'bg-primary/5' : ''}`}>
      <div className="flex items-start space-x-3">
        {notification.user?.avatarUrl ? (
          <Avatar className="h-10 w-10">
            <AvatarImage src={notification.user.avatarUrl} alt={notification.user.name} data-ai-hint="user avatar small"/>
            <AvatarFallback>{notification.user.name.charAt(0)}</AvatarFallback>
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);

  useEffect(() => {
    if (!loadingAuth && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, loadingAuth, router]);

  useEffect(() => {
     if (currentUser) { 
        setIsLoadingNotifications(true);
        setTimeout(() => {
            setNotifications(generateMockNotifications(currentUser.uid)); // Pass current user ID
            setIsLoadingNotifications(false);
        }, 500);
     }
  }, [currentUser]);


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
          <Button variant="ghost" size="sm">
            <Settings className="mr-2 h-4 w-4" /> View settings
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {isLoadingNotifications ? (
            <div className="p-6 text-center"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>
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
