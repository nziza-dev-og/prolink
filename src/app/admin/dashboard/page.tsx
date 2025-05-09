
'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { getTotalUsersCount } from '@/lib/user-service';
import { getTotalPostsCount } from '@/lib/post-service';
import { createAdminBroadcast } from '@/lib/notification-service';


export default function AdminDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isAdminVerified, setIsAdminVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);

  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [totalPosts, setTotalPosts] = useState<number | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const [newSecretCode, setNewSecretCode] = useState('');
  const [isSavingSecret, setIsSavingSecret] = useState(false);

  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAdmin = localStorage.getItem('isAdmin');
      if (isAdmin === 'true') {
        setIsAdminVerified(true);
      } else {
        router.push('/admin/login');
      }
    } else {
      router.push('/admin/login');
    }
    setIsVerifying(false);
  }, [router]);

  useEffect(() => {
    async function fetchStats() {
      if (isAdminVerified) {
        setIsLoadingStats(true);
        try {
          const usersCount = await getTotalUsersCount();
          const postsCount = await getTotalPostsCount();
          setTotalUsers(usersCount);
          setTotalPosts(postsCount);
        } catch (error) {
          console.error("Failed to fetch admin stats:", error);
          toast({ title: "Error fetching stats", description: "Could not load site statistics.", variant: "destructive" });
        } finally {
          setIsLoadingStats(false);
        }
      }
    }
    fetchStats();
  }, [isAdminVerified, toast]);

  const handleAdminLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isAdmin');
    }
    router.push('/'); 
  };

  const handleSaveSecretCode = (event: FormEvent) => {
    event.preventDefault();
    if (!newSecretCode.trim()) {
      toast({ title: "Invalid Code", description: "Secret code cannot be empty.", variant: "destructive" });
      return;
    }
    setIsSavingSecret(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminSecret', newSecretCode);
      toast({ title: "Secret Code Updated", description: "Admin secret code has been changed." });
      setNewSecretCode(''); 
    } else {
      toast({ title: "Error", description: "Could not save secret code.", variant: "destructive" });
    }
    setIsSavingSecret(false);
  };

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

  if (isVerifying) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-12rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdminVerified) {
    return null; 
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Admin Dashboard</CardTitle>
          <CardDescription>Welcome to the ProLink Admin Panel.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <section>
            <h3 className="text-xl font-semibold mb-2">Site Statistics</h3>
            {isLoadingStats ? (
              <div className="flex justify-center items-center py-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Total Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{totalUsers ?? 'N/A'}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Total Posts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{totalPosts ?? 'N/A'}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Reported Issues</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">0</p> 
                  </CardContent>
                </Card>
              </div>
            )}
          </section>

           <section>
            <h3 className="text-xl font-semibold mb-3">Broadcast Notification</h3>
            <form onSubmit={handleBroadcastNotification} className="space-y-4 max-w-md">
              <div>
                <Label htmlFor="broadcastMessage">Message for All Users</Label>
                <Textarea
                  id="broadcastMessage"
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Enter notification message..."
                  disabled={isBroadcasting}
                  rows={3}
                  className="mt-1"
                />
              </div>
              <Button type="submit" disabled={isBroadcasting || !broadcastMessage.trim()}>
                {isBroadcasting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Broadcast
              </Button>
            </form>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-2">Management Tools</h3>
            <div className="space-x-2">
              <Button variant="outline" disabled>Manage Users</Button>
              <Button variant="outline" disabled>Content Moderation</Button>
              <Button variant="outline" disabled>Site Settings</Button>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">Admin Settings</h3>
            <form onSubmit={handleSaveSecretCode} className="space-y-4 max-w-sm">
              <div>
                <Label htmlFor="newSecretCode">Change Admin Secret Code</Label>
                <Input
                  id="newSecretCode"
                  type="password"
                  value={newSecretCode}
                  onChange={(e) => setNewSecretCode(e.target.value)}
                  placeholder="Enter new secret code"
                  disabled={isSavingSecret}
                  className="mt-1"
                />
              </div>
              <Button type="submit" disabled={isSavingSecret}>
                {isSavingSecret && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save New Secret Code
              </Button>
            </form>
          </section>

          <Button variant="destructive" onClick={handleAdminLogout}>
            Exit Admin Panel
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
