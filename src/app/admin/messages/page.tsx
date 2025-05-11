
'use client';

import { useState, type FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Bell, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createAdminBroadcast } from '@/lib/notification-service';

export default function AdminMessagesPage() {
  const { toast } = useToast();
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const handleBroadcastNotification = async (event: FormEvent) => {
    event.preventDefault();
    if (!broadcastMessage.trim()) {
      toast({ title: "Invalid Message", description: "Broadcast message cannot be empty.", variant: "destructive" });
      return;
    }
    setIsBroadcasting(true);
    try {
      await createAdminBroadcast(broadcastMessage);
      toast({ title: "Broadcast Sent", description: "Notification has been sent to all users." });
      setBroadcastMessage('');
    } catch (error) {
      console.error("Error sending broadcast:", error);
      toast({ title: "Broadcast Failed", description: "Could not send notification.", variant: "destructive" });
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center"><MessageSquare className="mr-2 h-6 w-6" /> Admin Messaging</CardTitle>
          <CardDescription>Manage platform messages and send broadcasts.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><Bell className="mr-2 h-5 w-5" /> Broadcast Notification</CardTitle>
          <CardDescription>Send important announcements to all users on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleBroadcastNotification} className="space-y-4 max-w-lg">
            <div>
              <Label htmlFor="broadcastMessage">Message for All Users</Label>
              <Textarea
                id="broadcastMessage"
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Enter notification message..."
                disabled={isBroadcasting}
                rows={4}
                className="mt-1"
              />
            </div>
            <Button type="submit" disabled={isBroadcasting || !broadcastMessage.trim()}>
              {isBroadcasting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Broadcast
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle className="text-xl">Inbox / Reported Messages</CardTitle>
            <CardDescription>Review user-reported messages or system alerts. (Placeholder)</CardDescription>
        </CardHeader>
        <CardContent className="h-40 flex items-center justify-center text-muted-foreground">
            Message Inbox Placeholder
        </CardContent>
      </Card>
    </div>
  );
}
