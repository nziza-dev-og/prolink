
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, FileText } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { Post, Article } from '@/types';
import { getPosts } from '@/lib/post-service';
import { getAllArticles } from '@/lib/article-service';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

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
        setRecentPosts(fetchedPosts.slice(0, 10)); // Show more, up to 10
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
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center"><FileText className="mr-2 h-6 w-6" /> Content Management</CardTitle>
          <CardDescription>Oversee and manage platform content like posts and articles.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle className="text-xl">Recent Activity</CardTitle>
            <CardDescription>Latest posts and articles published on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
            {isLoadingContent ? (
                 <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>
            ) : (
            <div className="space-y-6">
                <div>
                    <h4 className="font-semibold text-lg mb-2">Recent Posts ({recentPosts.length})</h4>
                    {recentPosts.length > 0 ? (
                        <ul className="space-y-3">
                        {recentPosts.map(post => (
                            <li key={post.id} className="p-3 border rounded-md hover:bg-muted/50">
                            <Link href={`/posts/${post.id}`} className="font-semibold hover:underline block truncate text-md">{post.content.substring(0,100)}{post.content.length > 100 ? '...' : ''}</Link>
                            <p className="text-xs text-muted-foreground">By: {post.author.firstName} {post.author.lastName} on {format(new Date(post.createdAt as string), "PPP p")}</p>
                            </li>
                        ))}
                        </ul>
                    ) : <p className="text-muted-foreground">No recent posts.</p>}
                </div>
                <Separator/>
                <div>
                    <h4 className="font-semibold text-lg mb-2">Recent Articles ({recentArticles.length})</h4>
                    {recentArticles.length > 0 ? (
                        <ul className="space-y-3">
                        {recentArticles.map(article => (
                            <li key={article.id} className="p-3 border rounded-md hover:bg-muted/50">
                            <Link href={`/articles/${article.id}`} className="font-semibold hover:underline block truncate text-md">{article.title}</Link>
                            <p className="text-xs text-muted-foreground">By: {article.author.firstName} {article.author.lastName} on {format(new Date(article.createdAt as string), "PPP p")}</p>
                            </li>
                        ))}
                        </ul>
                    ) : <p className="text-muted-foreground">No recent articles.</p>}
                </div>
            </div>
            )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle className="text-xl">Moderation Tools</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
                <Button variant="outline" disabled>Moderate Content (Coming Soon)</Button>
                <Button variant="outline" disabled>View Scheduled Posts (Coming Soon)</Button>
                <Button variant="outline" disabled>Flagged Content (Coming Soon)</Button>
            </div>
            <p className="text-sm text-muted-foreground">Reported Issues: 0 (Placeholder)</p>
        </CardContent>
      </Card>
    </div>
  );
}
