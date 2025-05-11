
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, Eye, Edit2, CalendarClock, AlertTriangle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { Post, Article } from '@/types';
import { getPosts } from '@/lib/post-service';
import { getAllArticles } from '@/lib/article-service';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function AdminContentPage() {
  const { toast } = useToast();
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [isLoadingContent, setIsLoadingContent] = useState(true);

  useEffect(() => {
    async function fetchContent() {
      setIsLoadingContent(true);
      try {
        const fetchedPosts = await getPosts();
        setRecentPosts(fetchedPosts.slice(0, 10)); 
        const fetchedArticles = await getAllArticles();
        setRecentArticles(fetchedArticles.slice(0, 10));
      } catch (error) {
        console.error("Failed to fetch content:", error);
        toast({ title: "Error", description: "Could not load content.", variant: "destructive" });
      } finally {
        setIsLoadingContent(false);
      }
    }
    fetchContent();
  }, [toast]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
      </div>
      <CardDescription>Oversee and manage platform content like posts and articles.</CardDescription>

      <Card className="shadow-md">
        <CardHeader>
            <CardTitle className="text-xl">Recent Activity</CardTitle>
            <CardDescription>Latest posts and articles published on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
            {isLoadingContent ? (
                 <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>
            ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <h3 className="font-semibold text-lg mb-3">Recent Posts ({recentPosts.length})</h3>
                    {recentPosts.length > 0 ? (
                        <ScrollArea className="h-[300px] pr-3">
                            <ul className="space-y-3">
                            {recentPosts.map(post => (
                                <li key={post.id} className="p-3 border rounded-lg hover:shadow-sm transition-shadow">
                                <Link href={`/profile/${post.author.uid}#post-${post.id}`} className="font-semibold hover:underline block truncate text-md mb-1">{post.content.substring(0,100)}{post.content.length > 100 ? '...' : ''}</Link>
                                <p className="text-xs text-muted-foreground">By: {post.author.firstName} {post.author.lastName}</p>
                                <p className="text-xs text-muted-foreground">{format(new Date(post.createdAt as string), "PPp")}</p>
                                </li>
                            ))}
                            </ul>
                        </ScrollArea>
                    ) : <p className="text-muted-foreground text-sm">No recent posts.</p>}
                </div>
                <div>
                    <h3 className="font-semibold text-lg mb-3">Recent Articles ({recentArticles.length})</h3>
                    {recentArticles.length > 0 ? (
                        <ScrollArea className="h-[300px] pr-3">
                            <ul className="space-y-3">
                            {recentArticles.map(article => (
                                <li key={article.id} className="p-3 border rounded-lg hover:shadow-sm transition-shadow">
                                <Link href={`/articles/${article.id}`} className="font-semibold hover:underline block truncate text-md mb-1">{article.title}</Link>
                                <p className="text-xs text-muted-foreground">By: {article.author.firstName} {article.author.lastName}</p>
                                <p className="text-xs text-muted-foreground">{format(new Date(article.createdAt as string), "PPp")}</p>
                                </li>
                            ))}
                            </ul>
                        </ScrollArea>
                    ) : <p className="text-muted-foreground text-sm">No recent articles.</p>}
                </div>
            </div>
            )}
        </CardContent>
      </Card>
      
      <Card className="shadow-md">
        <CardHeader>
            <CardTitle className="text-xl">Moderation Tools</CardTitle>
            <CardDescription>Features for content review and management.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
                <Button variant="outline" disabled><Eye className="mr-2 h-4 w-4"/> Moderate Content (Soon)</Button>
                <Button variant="outline" disabled><CalendarClock className="mr-2 h-4 w-4"/> Scheduled Posts (Soon)</Button>
                <Button variant="outline" disabled><AlertTriangle className="mr-2 h-4 w-4"/> Flagged Content (Soon)</Button>
            </div>
            <p className="text-sm text-muted-foreground">Reported Issues: 0 (Placeholder)</p>
        </CardContent>
      </Card>
    </div>
  );
}
