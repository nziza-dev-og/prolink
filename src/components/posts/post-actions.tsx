'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ThumbsUp, MessageCircle, Repeat, Send } from "lucide-react";
import type { Post } from "@/types";
import { useAuth } from '@/context/auth-context';
import { likePost, unlikePost } from '@/lib/post-service';
import { useToast } from '@/hooks/use-toast';

interface PostActionsProps {
  post: Post;
  onLikeUnlike: (postId: string, newLikes: string[], newLikesCount: number) => void; // Callback to update parent state
}

export default function PostActions({ post, onLikeUnlike }: PostActionsProps) {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [currentLikesCount, setCurrentLikesCount] = useState(post.likesCount);

  useEffect(() => {
    if (currentUser && post.likes) {
      setIsLiked(post.likes.includes(currentUser.uid));
    }
    setCurrentLikesCount(post.likesCount);
  }, [post.likes, post.likesCount, currentUser]);

  const handleLikeToggle = async () => {
    if (!currentUser) {
      toast({ title: "Login Required", description: "Please login to like posts.", variant: "destructive" });
      return;
    }

    try {
      let newLikesArray;
      let newLikesCountValue;

      if (isLiked) {
        await unlikePost(post.id, currentUser.uid);
        newLikesArray = post.likes.filter(uid => uid !== currentUser.uid);
        newLikesCountValue = Math.max(0, currentLikesCount - 1);
        toast({ title: "Unliked", description: "You unliked this post." });
      } else {
        await likePost(post.id, currentUser.uid);
        newLikesArray = [...post.likes, currentUser.uid];
        newLikesCountValue = currentLikesCount + 1;
        toast({ title: "Liked", description: "You liked this post." });
      }
      setIsLiked(!isLiked);
      setCurrentLikesCount(newLikesCountValue);
      onLikeUnlike(post.id, newLikesArray, newLikesCountValue);
    } catch (error) {
      console.error("Error toggling like:", error);
      toast({ title: "Error", description: "Could not update like status.", variant: "destructive" });
    }
  };

  return (
    <div className="flex justify-around items-center pt-2 border-t mt-2">
      <Button variant="ghost" size="sm" className="text-muted-foreground hover:bg-accent/50" onClick={handleLikeToggle}>
        <ThumbsUp className={`mr-1 h-5 w-5 ${isLiked ? 'text-primary fill-primary' : ''}`} /> Like
      </Button>
      <Button variant="ghost" size="sm" className="text-muted-foreground hover:bg-accent/50" disabled>
        <MessageCircle className="mr-1 h-5 w-5" /> Comment
      </Button>
      <Button variant="ghost" size="sm" className="text-muted-foreground hover:bg-accent/50" disabled>
        <Repeat className="mr-1 h-5 w-5" /> Repost
      </Button>
      <Button variant="ghost" size="sm" className="text-muted-foreground hover:bg-accent/50" disabled>
        <Send className="mr-1 h-5 w-5" /> Send
      </Button>
    </div>
  );
}