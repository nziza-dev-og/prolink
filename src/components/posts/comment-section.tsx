
'use client';

import { useState, useEffect, type FormEvent } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useAuth } from '@/context/auth-context';
import { addComment, getComments } from '@/lib/post-service';
import type { Comment as CommentType, Post, UserProfile } from '@/types';
import { Loader2, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CommentSectionProps {
  post: Post;
  onCommentAdded: (updatedPost: Post) => void;
}

function CommentItem({ comment }: { comment: CommentType }) {
  return (
    <div className="flex items-start space-x-3 py-3">
      <Link href={`/profile/${comment.author.uid}`}>
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.author.profilePictureUrl} alt={comment.author.firstName} data-ai-hint="user avatar small" />
          <AvatarFallback>{comment.author.firstName?.charAt(0)}{comment.author.lastName?.charAt(0)}</AvatarFallback>
        </Avatar>
      </Link>
      <div className="flex-grow bg-muted p-3 rounded-md">
        <div className="flex items-center justify-between mb-1">
          <Link href={`/profile/${comment.author.uid}`} className="text-sm font-semibold hover:underline">
            {comment.author.firstName} {comment.author.lastName}
          </Link>
          <p className="text-xs text-muted-foreground">
            {new Date(comment.createdAt as string).toLocaleDateString()}
          </p>
        </div>
        <p className="text-sm whitespace-pre-line">{comment.content}</p>
        {/* Placeholder for comment likes/actions */}
        {/* <div className="text-xs text-muted-foreground mt-1 space-x-2">
          <button className="hover:underline">Like</button>
          <span>·</span>
          <button className="hover:underline">Reply</button>
        </div> */}
      </div>
    </div>
  );
}

export default function CommentSection({ post, onCommentAdded }: CommentSectionProps) {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<CommentType[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    async function fetchComments() {
      setIsLoadingComments(true);
      try {
        const fetchedComments = await getComments(post.id);
        setComments(fetchedComments);
      } catch (error) {
        console.error("Error fetching comments:", error);
        toast({ title: "Error", description: "Could not load comments.", variant: "destructive" });
      } finally {
        setIsLoadingComments(false);
      }
    }
    fetchComments();
  }, [post.id, toast]);

  const handleAddComment = async (event: FormEvent) => {
    event.preventDefault();
    if (!currentUser || !newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const commentData = {
        authorId: currentUser.uid,
        content: newComment,
        // author details will be populated by addComment function or fetched by getComments later
      };
      const commentId = await addComment(post.id, commentData);
      
      // Optimistically add comment to UI or re-fetch
      const addedComment: CommentType = {
        id: commentId, // This might not be the final ID if using client-generated one
        author: {
            id: currentUser.uid,
            uid: currentUser.uid,
            firstName: currentUser.firstName,
            lastName: currentUser.lastName,
            headline: currentUser.headline,
            profilePictureUrl: currentUser.profilePictureUrl
        },
        authorId: currentUser.uid,
        content: newComment,
        createdAt: new Date().toISOString(),
        likesCount: 0,
      };
      setComments(prev => [...prev, addedComment]);
      setNewComment('');
      onCommentAdded({ ...post, commentsCount: post.commentsCount + 1 });

      toast({ title: "Comment Added" });
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({ title: "Error", description: "Failed to add comment.", variant: "destructive" });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t">
      <h4 className="text-md font-semibold mb-2">Comments ({post.commentsCount || 0})</h4>
      
      {currentUser && (
        <form onSubmit={handleAddComment} className="flex items-start space-x-2 mb-4">
          <Avatar className="h-9 w-9 mt-1">
            <AvatarImage src={currentUser.profilePictureUrl} alt={currentUser.firstName} data-ai-hint="user avatar small"/>
            <AvatarFallback>{currentUser.firstName?.charAt(0)}{currentUser.lastName?.charAt(0)}</AvatarFallback>
          </Avatar>
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={1}
            className="flex-grow min-h-[40px] resize-none"
            disabled={isSubmittingComment}
          />
          <Button type="submit" size="sm" disabled={isSubmittingComment || !newComment.trim()}>
            {isSubmittingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="sr-only sm:not-sr-only ml-2">Post</span>
          </Button>
        </form>
      )}

      {isLoadingComments ? (
        <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : comments.length > 0 ? (
        <div className="space-y-1">
          {comments.map((comment, index) => (
            <div key={comment.id}>
                <CommentItem comment={comment} />
                {index < comments.length - 1 && <Separator className="my-0"/>}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">No comments yet. Be the first to comment!</p>
      )}
    </div>
  );
}
