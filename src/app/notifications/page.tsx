import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { mockUserProfiles } from "@/lib/mock-data";
import { BellRing, Briefcase, MessageSquare, Settings, UserCheck, Users } from "lucide-react";
import Link from "next/link";

interface Notification {
  id: string;
  type: "connection_request" | "message" | "job_alert" | "profile_view" | "post_like" | "post_comment";
  user?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  content: string;
  timestamp: Date;
  isRead: boolean;
  link?: string;
}

const mockNotifications: Notification[] = [
  {
    id: "n1",
    type: "profile_view",
    user: { id: mockUserProfiles[1].id, name: `${mockUserProfiles[1].firstName} ${mockUserProfiles[1].lastName}`, avatarUrl: mockUserProfiles[1].profilePictureUrl },
    content: `${mockUserProfiles[1].firstName} ${mockUserProfiles[1].lastName} viewed your profile.`,
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    isRead: false,
    link: `/profile/${mockUserProfiles[1].id}`
  },
  {
    id: "n2",
    type: "post_like",
    user: { id: mockUserProfiles[2].id, name: `${mockUserProfiles[2].firstName} ${mockUserProfiles[2].lastName}`, avatarUrl: mockUserProfiles[2].profilePictureUrl },
    content: `${mockUserProfiles[2].firstName} ${mockUserProfiles[2].lastName} liked your post: "Excited to share..."`,
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    isRead: true,
    link: `/posts/p1` // Example post link
  },
  {
    id: "n3",
    type: "job_alert",
    content: "New job alert: Software Engineer at Tech Innovations Inc.",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    isRead: false,
    link: `/jobs/j-tech-innovations` // Example job link
  },
   {
    id: "n4",
    type: "connection_request",
    user: { id: mockUserProfiles[2].id, name: `${mockUserProfiles[2].firstName} ${mockUserProfiles[2].lastName}`, avatarUrl: mockUserProfiles[2].profilePictureUrl },
    content: `You have a new connection request from ${mockUserProfiles[2].firstName} ${mockUserProfiles[2].lastName}.`,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    isRead: true,
    link: `/network`
  },
];

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
            <AvatarImage src={notification.user.avatarUrl} alt={notification.user.name} data-ai-hint="user avatar small" />
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
          {mockNotifications.length === 0 && (
            <p className="p-6 text-center text-muted-foreground">You have no new notifications.</p>
          )}
          {mockNotifications.map((notification, index) => (
            <div key={notification.id}>
              <NotificationItem notification={notification} />
              {index < mockNotifications.length - 1 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
