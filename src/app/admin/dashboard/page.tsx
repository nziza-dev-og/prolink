
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Users, FileText, BarChart2, ListChecks, Newspaper, CalendarDays, ThumbsUp, Eye, ShieldAlert, LogOut as LogOutIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getTotalUsersCount } from '@/lib/user-service';
import { getTotalPostsCount } from '@/lib/post-service';
import { getTotalArticlesCount } from '@/lib/article-service';
import { getTotalEventsCount } from '@/lib/event-service';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';


export default function AdminDashboardPage() {
  const { toast } = useToast();
  const { loadingAuth } = useAuth(); // currentUser might not be needed here directly if layout handles auth
  const router = useRouter();

  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [totalPosts, setTotalPosts] = useState<number | null>(null);
  const [totalArticles, setTotalArticles] = useState<number | null>(null);
  const [totalEvents, setTotalEvents] = useState<number | null>(null);
  const [totalEngagement, setTotalEngagement] = useState<number | null>(null); 
  const [activeUsersToday, setActiveUsersToday] = useState<number | null>(null);

  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    async function fetchAdminData() {
      setIsLoadingStats(true);
      try {
        const usersCount = await getTotalUsersCount();
        const postsCount = await getTotalPostsCount();
        const articlesCount = await getTotalArticlesCount();
        const eventsCount = await getTotalEventsCount();

        setTotalUsers(usersCount);
        setTotalPosts(postsCount);
        setTotalArticles(articlesCount);
        setTotalEvents(eventsCount);
        setTotalEngagement(12345); // Placeholder
        setActiveUsersToday(150); // Placeholder
        
      } catch (error) {
        console.error("Failed to fetch admin data:", error);
        toast({ title: "Error fetching data", description: "Could not load site data.", variant: "destructive" });
      } finally {
        setIsLoadingStats(false);
      }
    }
    if (!loadingAuth) {
        fetchAdminData();
    }
  }, [toast, loadingAuth]);
  
  const handleAdminLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isAdmin');
    }
    // Potentially sign out from Firebase if admin uses a specific Firebase account
    // await signOut(auth); 
    router.push('/'); 
  };


  if (loadingAuth && isLoadingStats) { // Show loader until auth and initial stats are ready
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-12rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Admin Dashboard</CardTitle>
          <CardDescription>Welcome to the ProLink Admin Panel. Site overview and quick stats.</CardDescription>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
                  <Newspaper className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{totalArticles ?? 'N/A'}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                  <CalendarDays className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{totalEvents ?? 'N/A'}</p>
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

      {/* Quick Links or Summary Cards */}
      <Card>
        <CardHeader>
            <CardTitle className="text-xl">Quick Management</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="hover:shadow-md transition-shadow">
                <CardHeader><CardTitle className="text-base">User Management</CardTitle></CardHeader>
                <CardContent><CardDescription>View, edit, and manage user accounts.</CardDescription></CardContent>
                <CardContent><Button asChild><Link href="/admin/users">Go to Users</Link></Button></CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
                <CardHeader><CardTitle className="text-base">Content Overview</CardTitle></CardHeader>
                <CardContent><CardDescription>Moderate posts, articles, and other content.</CardDescription></CardContent>
                <CardContent><Button asChild><Link href="/admin/content">Go to Content</Link></Button></CardContent>
            </Card>
             <Card className="hover:shadow-md transition-shadow">
                <CardHeader><CardTitle className="text-base">Site Analytics</CardTitle></CardHeader>
                <CardContent><CardDescription>View detailed site usage and engagement metrics.</CardDescription></CardContent>
                <CardContent><Button asChild><Link href="/admin/analytics">Go to Analytics</Link></Button></CardContent>
            </Card>
        </CardContent>
      </Card>
      
      {/* Activity Log (Placeholder) */}
      <Card>
        <CardHeader>
            <CardTitle className="text-xl flex items-center"><ListChecks className="mr-2 h-5 w-5"/> Activity Log</CardTitle>
            <CardDescription>Recent administrative actions and important system events. (Placeholder)</CardDescription>
        </CardHeader>
        <CardContent className="h-40 flex items-center justify-center text-muted-foreground">
            Activity Log Entries Placeholder
        </CardContent>
      </Card>

       <div className="mt-8">
        <Button variant="destructive" onClick={handleAdminLogout}>
          <LogOutIcon className="mr-2 h-4 w-4" /> Exit Admin Panel
        </Button>
      </div>
    </div>
  );
}
