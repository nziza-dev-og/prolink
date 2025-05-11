
'use client';

import { useState, type FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Bell, MessageSquare, Inbox, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createAdminBroadcast } from '@/lib/notification-service';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Admin Messaging</h1>
      </div>
      <CardDescription>Manage platform messages and send broadcasts to all users.</CardDescription>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><Bell className="mr-2 h-5 w-5" /> Broadcast Notification</CardTitle>
          <CardDescription>Send important announcements to all users on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="default" className="mb-4 bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700">
            <AlertCircle className="h-4 w-4 !text-blue-600 dark:!text-blue-400" />
            <AlertTitle className="text-blue-700 dark:text-blue-300">Important</AlertTitle>
            <AlertDescription className="text-blue-600 dark:text-blue-400">
              This message will be sent as a notification to all registered users. Use with caution.
            </AlertDescription>
          </Alert>
          <form onSubmit={handleBroadcastNotification} className="space-y-4 max-w-lg">
            <div>
              <Label htmlFor="broadcastMessage" className="font-medium">Message for All Users</Label>
              <Textarea
                id="broadcastMessage"
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Enter notification message..."
                disabled={isBroadcasting}
                rows={4}
                className="mt-1 text-sm"
              />
            </div>
            <Button type="submit" disabled={isBroadcasting || !broadcastMessage.trim()}>
              {isBroadcasting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Broadcast
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
            <CardTitle className="text-xl flex items-center"><Inbox className="mr-2 h-5 w-5"/> Inbox / Reported Messages</CardTitle>
            <CardDescription>Review user-reported messages or system alerts. (This section is a placeholder)</CardDescription>
        </CardHeader>
        <CardContent className="h-48 flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-md">
            Message Inbox Placeholder
        </CardContent>
      </Card>
    </div>
  );
}
