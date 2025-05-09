'use client';

import { useState, type ChangeEvent, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image'; // For image preview
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
import { Input } from "@/components/ui/input"; // For file input
import { useToast } from '@/hooks/use-toast';
import { Loader2, ImageIcon, X } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { createPost } from '@/lib/post-service';
import { uploadFile } from '@/lib/storage-service'; // To upload image
import type { Post } from '@/types';

const postFormSchema = z.object({
  content: z.string().min(1, "Post content cannot be empty.").max(1000, "Post content is too long."),
});

type PostFormValues = z.infer<typeof postFormSchema>;

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostCreated: () => void; // Callback to refresh feed
}

export default function CreatePostDialog({ open, onOpenChange, onPostCreated }: CreatePostDialogProps) {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      content: '',
    },
  });

  // Reset form and image states when dialog is closed or opened
  useEffect(() => {
    if (!open) {
      form.reset();
      setImageFile(null);
      setImagePreview(null);
      setIsSubmitting(false);
      setIsUploadingImage(false);
    }
  }, [open, form]);


  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    // Reset file input value
    const fileInput = document.getElementById('postImage') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const onSubmit: SubmitHandler<PostFormValues> = async (data) => {
    if (!currentUser) {
      toast({ title: "Authentication Error", description: "You must be logged in to post.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    let imageUrl: string | undefined = undefined;

    try {
      if (imageFile) {
        setIsUploadingImage(true);
        const filePath = `posts/${currentUser.uid}/${Date.now()}_${imageFile.name}`;
        try {
            imageUrl = await uploadFile(imageFile, filePath);
        } catch (uploadError) {
            console.error("Error uploading image:", uploadError);
            toast({ title: "Image Upload Failed", description: "Could not upload image. Please try again.", variant: "destructive" });
            setIsUploadingImage(false);
            setIsSubmitting(false);
            return;
        }
        setIsUploadingImage(false);
      }

      const newPostData: Omit<Post, 'id' | 'createdAt' | 'likesCount' | 'commentsCount' | 'repostsCount' | 'likes' | 'comments'> = {
        author: {
          id: currentUser.uid, // Use uid as id for author stub
          uid: currentUser.uid,
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          headline: currentUser.headline,
          profilePictureUrl: currentUser.profilePictureUrl,
        },
        authorId: currentUser.uid,
        content: data.content,
        imageUrl: imageUrl,
        // videoUrl can be added later
      };
      await createPost(newPostData);
      toast({ title: "Post Created", description: "Your post is now live!" });
      
      // Reset logic is now in useEffect based on `open` state
      onOpenChange(false); // This will trigger the useEffect for reset
      onPostCreated(); // Trigger feed refresh

    } catch (error) {
      console.error("Error creating post:", error);
      toast({ title: "Error", description: "Failed to create post. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
      setIsUploadingImage(false);
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
              disabled={isSubmitting || isUploadingImage}
            />
            {form.formState.errors.content && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.content.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="postImage" className="flex items-center cursor-pointer text-sm font-medium text-muted-foreground hover:text-primary">
              <ImageIcon className="mr-2 h-5 w-5" />
              Add Image (Optional)
            </Label>
            <Input
              id="postImage"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden" // Style the label as the button
              disabled={isSubmitting || isUploadingImage}
            />
          </div>

          {imagePreview && (
            <div className="relative group">
              <Image src={imagePreview} alt="Selected image preview" width={500} height={300} className="rounded-md object-contain max-h-[300px] w-full" />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-70 group-hover:opacity-100 h-7 w-7"
                onClick={removeImage}
                disabled={isSubmitting || isUploadingImage}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove image</span>
              </Button>
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting || isUploadingImage}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting || isUploadingImage}>
              {(isSubmitting || isUploadingImage) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isUploadingImage ? 'Uploading...' : 'Post'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
