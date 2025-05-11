
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Users, FileText, BarChart2, ListChecks, Newspaper, CalendarDays, ThumbsUp, Eye, ShieldAlert, Settings, MessageSquare, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getTotalUsersCount } from '@/lib/user-service';
import { getTotalPostsCount } from '@/lib/post-service';
import { getTotalArticlesCount } from '@/lib/article-service';
import { getTotalEventsCount } from '@/lib/event-service';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Line, LineChart as ReLineChart, CartesianGrid, XAxis, YAxis, Tooltip as ReTooltip, ResponsiveContainer } from "recharts";

const chartConfig = {
  users: {
    label: "Users",
    color: "hsl(var(--primary))",
  },
  posts: {
    label: "Posts",
    color: "hsl(var(--accent))",
  },
} satisfies ChartConfig;

// Mock data for the chart - replace with actual data fetching for analytics
const mockMonthlyData = [
  { month: "Jan", users: 120, posts: 30 },
  { month: "Feb", users: 150, posts: 45 },
  { month: "Mar", users: 180, posts: 60 },
  { month: "Apr", users: 220, posts: 70 },
  { month: "May", users: 250, posts: 85 },
  { month: "Jun", users: 300, posts: 100 },
];


interface StatCardProps {
  title: string;
  value: string | number | null;
  icon: React.ElementType;
  description?: string;
  isLoading: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, description, isLoading }) => (
  <Card className="shadow-md hover:shadow-lg transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-5 w-5 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      ) : (
        <div className="text-2xl font-bold">{value ?? 'N/A'}</div>
      )}
      {description && !isLoading && <p className="text-xs text-muted-foreground">{description}</p>}
    </CardContent>
  </Card>
);

export default function AdminDashboardPage() {
  const { toast } = useToast();
  const { loadingAuth } = useAuth(); 
  const [stats, setStats] = useState({
    totalUsers: null as number | null,
    totalPosts: null as number | null,
    totalArticles: null as number | null,
    totalEvents: null as number | null,
    totalEngagement: 12345 as number | null, // Placeholder
    activeUsersToday: 150 as number | null, // Placeholder
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    async function fetchAdminData() {
      setIsLoadingStats(true);
      try {
        const [usersCount, postsCount, articlesCount, eventsCount] = await Promise.all([
          getTotalUsersCount(),
          getTotalPostsCount(),
          getTotalArticlesCount(),
          getTotalEventsCount(),
        ]);
        setStats(prev => ({
          ...prev,
          totalUsers: usersCount,
          totalPosts: postsCount,
          totalArticles: articlesCount,
          totalEvents: eventsCount,
        }));
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

  if (loadingAuth && isLoadingStats) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
      </div>
      <CardDescription>Welcome to the ProLink Admin Panel. Site overview and quick stats.</CardDescription>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <StatCard title="Total Users" value={stats.totalUsers} icon={Users} isLoading={isLoadingStats} />
        <StatCard title="Total Posts" value={stats.totalPosts} icon={FileText} isLoading={isLoadingStats} />
        <StatCard title="Total Articles" value={stats.totalArticles} icon={Newspaper} isLoading={isLoadingStats} />
        <StatCard title="Total Events" value={stats.totalEvents} icon={CalendarDays} isLoading={isLoadingStats} />
        <StatCard title="Engagement (Placeholder)" value={stats.totalEngagement} icon={ThumbsUp} isLoading={false} description="Likes, Comments" />
        <StatCard title="Active Users Today (Placeholder)" value={stats.activeUsersToday} icon={Eye} isLoading={false} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center"><BarChart2 className="mr-2 h-5 w-5" /> Platform Growth (Example)</CardTitle>
            <CardDescription>Monthly trend of users and posts.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] -ml-4">
            <ChartContainer config={chartConfig} className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <ReLineChart data={mockMonthlyData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                  <ReTooltip content={<ChartTooltipContent indicator="dot" hideLabel />} />
                  <Line dataKey="users" type="monotone" stroke="var(--color-users)" strokeWidth={2} dot={true} />
                  <Line dataKey="posts" type="monotone" stroke="var(--color-posts)" strokeWidth={2} dot={true} />
                </ReLineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="text-xl flex items-center"><Activity className="mr-2 h-5 w-5"/> Quick Management</CardTitle>
                 <CardDescription>Navigate to key admin sections.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                    { title: "User Management", description: "View and manage user accounts.", href: "/admin/users", icon: Users },
                    { title: "Content Overview", description: "Moderate posts and articles.", href: "/admin/content", icon: FileText },
                    { title: "Site Analytics", description: "View usage metrics.", href: "/admin/analytics", icon: BarChart2 },
                    { title: "Platform Settings", description: "Configure site parameters.", href: "/admin/settings", icon: Settings },
                    { title: "Admin Messages", description: "Send broadcasts to users.", href: "/admin/messages", icon: MessageSquare },
                ].map(item => (
                    <Link href={item.href} key={item.title} className="block hover:no-underline">
                        <Card className="hover:bg-primary/5 hover:shadow-lg transition-all h-full">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center">
                                    <item.icon className="mr-2 h-4 w-4 text-primary"/>
                                    {item.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-xs">{item.description}</CardDescription>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </CardContent>
        </Card>
      </div>
      
      <Card className="shadow-md">
        <CardHeader>
            <CardTitle className="text-xl flex items-center"><ListChecks className="mr-2 h-5 w-5"/> Recent Activity Log (Placeholder)</CardTitle>
            <CardDescription>Recent administrative actions and important system events.</CardDescription>
        </CardHeader>
        <CardContent className="h-40 flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-md">
            Activity Log Entries Placeholder
        </CardContent>
      </Card>
    </div>
  );
}
