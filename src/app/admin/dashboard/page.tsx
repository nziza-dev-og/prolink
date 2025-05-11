
'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users, FileText, BarChart2, Bell, Settings as SettingsIcon, LogOut, Eye, Trash2, LineChart, ListChecks, ThumbsUp, MessageCircle } from 'lucide-react';
import { getTotalUsersCount } from '@/lib/user-service';
import { getTotalPostsCount } from '@/lib/post-service';
import { createAdminBroadcast } from '@/lib/notification-service';
import { Separator } from '@/components/ui/separator';


export default function AdminDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isAdminVerified, setIsAdminVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);

  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [totalPosts, setTotalPosts] = useState<number | null>(null);
  // Placeholder stats
  const [totalEngagement, setTotalEngagement] = useState<number | null>(null); 
  const [activeUsersToday, setActiveUsersToday] = useState<number | null>(null);

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
          // Mock data for new stats - replace with actual service calls later
          setTotalEngagement(12345); // Placeholder
          setActiveUsersToday(150); // Placeholder
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
    <div className="container mx-auto py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Admin Dashboard</CardTitle>
          <CardDescription>Welcome to the ProLink Admin Panel. Manage users, content, and site settings.</CardDescription>
        </CardHeader>
      </Card>

      {/* Dashboard Overview (Site Statistics) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><BarChart2 className="mr-2 h-5 w-5" /> Site Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingStats ? (
            <div className="flex justify-center items-center py-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{totalUsers ?? 'N/A'}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{totalPosts ?? 'N/A'}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Engagement</CardTitle>
                  <ThumbsUp className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{totalEngagement ?? 'N/A'}</p>
                  <p className="text-xs text-muted-foreground">(Likes & Comments - Placeholder)</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active Users Today</CardTitle>
                   <Eye className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{activeUsersToday ?? 'N/A'}</p>
                  <p className="text-xs text-muted-foreground">(Placeholder)</p>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analytics Overview */}
       <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><LineChart className="mr-2 h-5 w-5" /> Analytics Overview</CardTitle>
          <CardDescription>Visual trends of key metrics. (Placeholders)</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
                <CardHeader><CardTitle className="text-base">User Growth Trend</CardTitle></CardHeader>
                <CardContent className="h-40 flex items-center justify-center text-muted-foreground">Graph Placeholder</CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle className="text-base">Post Engagement Trend</CardTitle></CardHeader>
                <CardContent className="h-40 flex items-center justify-center text-muted-foreground">Graph Placeholder</CardContent>
            </Card>
            <Card className="md:col-span-2">
                <CardHeader><CardTitle className="text-base">Top Performing Content</CardTitle></CardHeader>
                <CardContent className="h-32 flex items-center justify-center text-muted-foreground">Content List Placeholder</CardContent>
            </Card>
        </CardContent>
      </Card>

      {/* Content Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><FileText className="mr-2 h-5 w-5" /> Content Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Recent Posts Activity</CardTitle></CardHeader>
            <CardContent className="h-32 flex items-center justify-center text-muted-foreground">Recent Posts List Placeholder</CardContent>
          </Card>
          <Button variant="outline" disabled>Moderate Content (Coming Soon)</Button>
          <p className="text-sm text-muted-foreground">Reported Issues: 0 (Placeholder)</p>
        </CardContent>
      </Card>

      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><Users className="mr-2 h-5 w-5" /> User Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
           <Card>
            <CardHeader><CardTitle className="text-base">User Overview</CardTitle></CardHeader>
            <CardContent className="h-32 flex items-center justify-center text-muted-foreground">User List / Search Placeholder</CardContent>
          </Card>
          <Button variant="outline" disabled>Manage All Users (Coming Soon)</Button>
        </CardContent>
      </Card>

      {/* Messaging - Broadcast */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><Bell className="mr-2 h-5 w-5" /> Broadcast Notification</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
      
      {/* Activity Log (Placeholder) */}
      <Card>
        <CardHeader>
            <CardTitle className="text-xl flex items-center"><ListChecks className="mr-2 h-5 w-5"/> Activity Log</CardTitle>
            <CardDescription>Recent administrative actions. (Placeholder)</CardDescription>
        </CardHeader>
        <CardContent className="h-40 flex items-center justify-center text-muted-foreground">
            Activity Log Entries Placeholder
        </CardContent>
      </Card>

      {/* Admin Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><SettingsIcon className="mr-2 h-5 w-5" /> Admin Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
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
          <Separator />
          <div>
             <h4 className="font-medium mb-2">Site Configuration</h4>
             <Button variant="outline" disabled>General Site Settings (Coming Soon)</Button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8">
        <Button variant="destructive" onClick={handleAdminLogout}>
          <LogOut className="mr-2 h-4 w-4" /> Exit Admin Panel
        </Button>
      </div>
    </div>
  );
}

