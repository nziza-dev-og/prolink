
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { createArticle } from '@/lib/article-service';
import type { Article } from '@/types';

const articleFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.').max(150),
  content: z.string().min(100, 'Article content must be at least 100 characters.').max(10000),
  coverImageUrl: z.string().url("Must be a valid URL for cover image.").optional().or(z.literal('')),
  tags: z.string().optional().transform(val => val ? val.split(',').map(s => s.trim()).filter(s => s) : []),
  status: z.enum(['draft', 'published']).default('draft'),
});

type ArticleFormValues = z.infer<typeof articleFormSchema>;

export default function CreateArticlePage() {
  const { currentUser, loadingAuth } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: {
      title: '',
      content: '',
      coverImageUrl: '',
      tags: [],
      status: 'published', // Default to published for simplicity, can add draft later
    },
  });

  useEffect(() => {
    if (!loadingAuth && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, loadingAuth, router]);

  const onSubmit: SubmitHandler<ArticleFormValues> = async (data) => {
    if (!currentUser) {
      toast({ title: "Authentication Error", description: "You must be logged in to write an article.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const newArticleData: Omit<Article, 'id' | 'createdAt' | 'updatedAt' | 'author' | 'views' | 'likesCount' | 'commentsCount'> = {
        authorId: currentUser.uid,
        title: data.title,
        content: data.content,
        coverImageUrl: data.coverImageUrl || undefined,
        tags: data.tags,
        status: data.status,
      };
      const articleId = await createArticle(newArticleData);
      toast({ title: "Article Published", description: "Your article is now live!" });
      // Potentially redirect to the article page: router.push(`/articles/${articleId}`);
      // For now, redirect to home or a generic articles page if it exists
      router.push('/'); 
    } catch (error) {
      console.error("Error publishing article:", error);
      toast({ title: "Error", description: "Failed to publish article. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loadingAuth || !currentUser) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-12rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Write an Article</CardTitle>
          <CardDescription>Share your insights and stories with the community.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="title">Article Title</Label>
              <Input id="title" {...form.register('title')} disabled={isSubmitting} placeholder="Your amazing article title" />
              {form.formState.errors.title && <p className="text-sm text-destructive mt-1">{form.formState.errors.title.message}</p>}
            </div>

            <div>
              <Label htmlFor="coverImageUrl">Cover Image URL (Optional)</Label>
              <Input id="coverImageUrl" placeholder="https://example.com/your-cover-image.png" {...form.register('coverImageUrl')} disabled={isSubmitting} />
              {form.formState.errors.coverImageUrl && <p className="text-sm text-destructive mt-1">{form.formState.errors.coverImageUrl.message}</p>}
            </div>
            
            <div>
              <Label htmlFor="content">Article Content</Label>
              <Textarea 
                id="content" 
                {...form.register('content')} 
                rows={15} 
                className="min-h-[300px]" 
                disabled={isSubmitting}
                placeholder="Start writing your article here... You can use Markdown for formatting."
              />
              {form.formState.errors.content && <p className="text-sm text-destructive mt-1">{form.formState.errors.content.message}</p>}
            </div>

            <div>
              <Label htmlFor="tags">Tags (comma-separated, optional)</Label>
              <Input id="tags" placeholder="e.g., Technology, Productivity, Career" {...form.register('tags')} disabled={isSubmitting} />
              {form.formState.errors.tags && <p className="text-sm text-destructive mt-1">{form.formState.errors.tags.message}</p>}
            </div>
            
            {/* Status: For now, we default to 'published'. Could add a select for 'draft' later.
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                onValueChange={(value) => form.setValue('status', value as "draft" | "published")}
                defaultValue={form.getValues('status')}
                disabled={isSubmitting}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Publish</SelectItem>
                  <SelectItem value="draft">Save as Draft</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.status && <p className="text-sm text-destructive mt-1">{form.formState.errors.status.message}</p>}
            </div>
            */}

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Publish Article
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
