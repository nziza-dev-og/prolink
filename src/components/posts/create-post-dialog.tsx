
'use client';

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image'; 
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input"; 
import { useToast } from '@/hooks/use-toast';
import { Loader2, Link as LinkIcon, X } from 'lucide-react'; // Changed ImageIcon to LinkIcon for clarity
import { useAuth } from '@/context/auth-context';
import { createPost } from '@/lib/post-service';
import type { Post } from '@/types';

const postFormSchema = z.object({
  content: z.string().min(1, "Post content cannot be empty.").max(1000, "Post content is too long."),
  imageUrl: z.string().url("Please enter a valid image URL.").optional().or(z.literal('')),
});

type PostFormValues = z.infer<typeof postFormSchema>;

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostCreated: () => void; 
}

export default function CreatePostDialog({ open, onOpenChange, onPostCreated }: CreatePostDialogProps) {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);


  const form = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      content: '',
      imageUrl: '',
    },
  });

  const imageUrlValue = form.watch('imageUrl');

  useEffect(() => {
    if (imageUrlValue && form.getFieldState('imageUrl').isDirty && !form.getFieldState('imageUrl').error) {
      // Basic check to see if it looks like an image URL before trying to preview
      const imageExtensions = /\.(jpeg|jpg|gif|png|webp)$/i;
      if (imageExtensions.test(imageUrlValue)) {
        setImagePreview(imageUrlValue);
      } else {
        setImagePreview(null); // Not a direct image link or invalid
      }
    } else if (!imageUrlValue) {
      setImagePreview(null);
    }
  }, [imageUrlValue, form]);


  useEffect(() => {
    if (!open) {
      form.reset();
      setImagePreview(null);
      setIsSubmitting(false);
    }
  }, [open, form]);


  const removeImagePreview = () => {
    form.setValue('imageUrl', '');
    setImagePreview(null);
  };

  const onSubmit: SubmitHandler<PostFormValues> = async (data) => {
    if (!currentUser) {
      toast({ title: "Authentication Error", description: "You must be logged in to post.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      const newPostData: Omit<Post, 'id' | 'createdAt' | 'likesCount' | 'commentsCount' | 'repostsCount' | 'likes' | 'comments'> = {
        author: {
          id: currentUser.uid, 
          uid: currentUser.uid,
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          headline: currentUser.headline,
          profilePictureUrl: currentUser.profilePictureUrl,
        },
        authorId: currentUser.uid,
        content: data.content,
        imageUrl: data.imageUrl || undefined, // Store URL if provided
      };
      await createPost(newPostData);
      toast({ title: "Post Created", description: "Your post is now live!" });
      
      onOpenChange(false); 
      onPostCreated(); 

    } catch (error) {
      console.error("Error creating post:", error);
      toast({ title: "Error", description: "Failed to create post. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create a post</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="content" className="sr-only">Post content</Label>
            <Textarea
              id="content"
              placeholder={`What's on your mind, ${currentUser?.firstName || 'User'}?`}
              {...form.register('content')}
              className="min-h-[120px]"
              disabled={isSubmitting}
            />
            {form.formState.errors.content && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.content.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">
                <LinkIcon className="mr-2 h-5 w-5 inline-block relative -top-px" />
                Image URL (Optional)
            </Label>
            <Input
              id="imageUrl"
              type="url"
              placeholder="https://example.com/image.jpg"
              {...form.register('imageUrl')}
              disabled={isSubmitting}
            />
             {form.formState.errors.imageUrl && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.imageUrl.message}</p>
            )}
          </div>

          {imagePreview && (
            <div className="relative group">
              <Image src={imagePreview} alt="Image preview" width={500} height={300} className="rounded-md object-contain max-h-[300px] w-full" data-ai-hint="user content image" />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-70 group-hover:opacity-100 h-7 w-7"
                onClick={removeImagePreview}
                disabled={isSubmitting}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove image</span>
              </Button>
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Post
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

