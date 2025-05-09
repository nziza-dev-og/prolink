

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getLearningCourses } from "@/lib/mock-data"; 
import { getPosts } from '@/lib/post-service'; 
import type { Post as PostType, LearningCourse, UserProfile } from "@/types";
import { Briefcase, Edit3, Image as ImageIcon, Link2, Loader2, MessageCircle, Repeat, Send, ThumbsUp, Users, Video } from "lucide-react";
import { useAuth } from '@/context/auth-context';
import CreatePostDialog from '@/components/posts/create-post-dialog';
import PostActions from '@/components/posts/post-actions'; 
import CommentSection from '@/components/posts/comment-section';
import { getFriendsOfFriendsSuggestions } from '@/lib/user-service';
import { useToast } from '@/hooks/use-toast';

function CreatePostCard({ onPostCreated }: { onPostCreated: () => void }) {
  const { currentUser, loadingAuth } = useAuth();
  const [isCreatePostDialogOpen, setIsCreatePostDialogOpen] = useState(false);

  if (loadingAuth) return <Card className="mb-4 p-4 flex justify-center items-center h-32"><Loader2 className="h-8 w-8 animate-spin text-primary"/></Card>;
  if (!currentUser) return null; 

  return (
    <>
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3 mb-3">
            <Link href={`/profile/${currentUser.uid}`}>
              <Avatar>
                <AvatarImage src={currentUser.profilePictureUrl} alt={currentUser.firstName || ''} data-ai-hint="user avatar" />
                <AvatarFallback>{currentUser.firstName?.charAt(0)}{currentUser.lastName?.charAt(0)}</AvatarFallback>
              </Avatar>
            </Link>
            <Button variant="outline" className="flex-grow justify-start rounded-full text-muted-foreground" onClick={() => setIsCreatePostDialogOpen(true)}>
              Start a post
            </Button>
          </div>
          <div className="flex justify-around">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:bg-accent/50" onClick={() => setIsCreatePostDialogOpen(true)}>
              <ImageIcon className="mr-2 h-5 w-5 text-blue-500" /> Media
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:bg-accent/50" disabled>
              <Video className="mr-2 h-5 w-5 text-green-500" /> Video
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:bg-accent/50" asChild>
              <Link href="/jobs/post">
                <Briefcase className="mr-2 h-5 w-5 text-purple-500" /> Job
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:bg-accent/50" asChild>
              <Link href="/articles/create">
                <Edit3 className="mr-2 h-5 w-5 text-orange-500" /> Write article
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      <CreatePostDialog 
        open={isCreatePostDialogOpen} 
        onOpenChange={setIsCreatePostDialogOpen}
        onPostCreated={onPostCreated} 
      />
    </>
  );
}

function PostCard({ post, onPostUpdated }: { post: PostType, onPostUpdated: (updatedPost: PostType) => void }) {
  const [showComments, setShowComments] = useState(false);

  const handleLikeUnlike = (postId: string, newLikes: string[], newLikesCount: number) => {
    if (post.id === postId) {
      onPostUpdated({ ...post, likes: newLikes, likesCount: newLikesCount });
    }
  };

  const handleCommentAdded = (updatedPostWithNewCommentCount: PostType) => {
     onPostUpdated(updatedPostWithNewCommentCount);
  }

  const handleRepost = (postId: string, newRepostsCount: number) => {
    if (post.id === postId) {
      onPostUpdated({ ...post, repostsCount: newRepostsCount });
    }
  };
  
  if (!post.author || !post.author.uid) { 
    console.warn(`PostCard: post.author or post.author.uid is undefined for post ID: ${post.id}. Post data:`, JSON.stringify(post));
    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <p className="text-sm text-destructive">Error: Author information is missing for this post.</p>
        </CardContent>
      </Card>
    );
  }

  const renderContentWithLinks = (text: string) => {
    const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.split(urlRegex).map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a 
            key={`link-${index}-${post.id}`} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-primary hover:underline break-all"
          >
            {part}
          </a>
        );
      }
      return <span key={`text-${index}-${post.id}`}>{part}</span>;
    });
  };
  
  return (
    <Card className="mb-4" key={post.id}>
      <CardHeader className="p-4">
        <div className="flex items-center space-x-3">
          <Link href={`/profile/${post.author.uid}`}>
            <Avatar>
              <AvatarImage src={post.author.profilePictureUrl} alt={post.author.firstName || 'User'} data-ai-hint="user avatar"/>
              <AvatarFallback>{post.author.firstName?.charAt(0)}{post.author.lastName?.charAt(0)}</AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <Link href={`/profile/${post.author.uid}`} className="font-semibold hover:underline">
              {post.author.firstName || 'Unknown'} {post.author.lastName || 'Author'}
            </Link>
            <p className="text-xs text-muted-foreground">{post.author.headline || 'No headline'}</p>
            <p className="text-xs text-muted-foreground">{post.createdAt ? new Date(post.createdAt as string).toLocaleDateString() : 'Date unknown'}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-2">
        <p className="text-sm mb-2 whitespace-pre-line">{renderContentWithLinks(post.content)}</p>
        {post.imageUrl && (
          <div className="my-2 rounded-md overflow-hidden">
            <Image src={post.imageUrl} alt="Post image" width={600} height={400} className="w-full h-auto object-cover" data-ai-hint="social media post"/>
          </div>
        )}
      </CardContent>
      <CardFooter className="px-4 pb-2 pt-0">
        <div className="flex justify-between w-full text-xs text-muted-foreground">
          <span>{post.likesCount || 0} Likes</span>
          <button onClick={() => setShowComments(!showComments)} className="hover:underline">
            {post.commentsCount || 0} Comments
          </button>
          <span>{post.repostsCount || 0} Reposts</span>
        </div>
      </CardFooter>
      <div className="px-4 pb-3">
         <PostActions 
            post={post} 
            onLikeUnlike={handleLikeUnlike} 
            onCommentAction={() => setShowComments(!showComments)}
            onRepost={handleRepost}
         />
      </div>
      {showComments && <CommentSection post={post} onCommentAdded={handleCommentAdded} />}
    </Card>
  );
}

function ProfileSummaryCard() {
  const { currentUser, loadingAuth } = useAuth();

  if (loadingAuth) return <Card className="p-4 flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary"/></Card>;
  if (!currentUser) return null;

  const connectionsDisplayCount = currentUser.connections?.length ?? currentUser.connectionsCount ?? 0;

  return (
    <Card>
      <div className="relative h-20 bg-muted overflow-hidden">
        {currentUser.coverPhotoUrl && <Image src={currentUser.coverPhotoUrl} alt="Cover photo" layout="fill" objectFit="cover" data-ai-hint="profile cover background"/>}
      </div>
      <CardContent className="p-4 text-center -mt-10">
        <Link href={`/profile/${currentUser.uid}`}>
          <Avatar className="h-20 w-20 mx-auto border-4 border-card mb-2">
            <AvatarImage src={currentUser.profilePictureUrl} alt={currentUser.firstName || ''} data-ai-hint="user avatar"/>
            <AvatarFallback>{currentUser.firstName?.charAt(0)}{currentUser.lastName?.charAt(0)}</AvatarFallback>
          </Avatar>
        </Link>
        <Link href={`/profile/${currentUser.uid}`} className="block font-semibold text-lg hover:underline">{currentUser.firstName} {currentUser.lastName}</Link>
        <p className="text-sm text-muted-foreground mb-3">{currentUser.headline}</p>
        <div className="border-t pt-3 space-y-1 text-sm">
          <Link href={`/network/connections/${currentUser.uid}`} className="flex justify-between items-center text-muted-foreground hover:bg-accent/10 p-1 rounded">
            <span>Connections</span>
            <span className="text-primary font-semibold">{connectionsDisplayCount}</span>
          </Link>
           <Link href={`/network?tab=invitations`} className="flex justify-between items-center text-muted-foreground hover:bg-accent/10 p-1 rounded">
            <span>Invitations</span>
            <span className="text-primary font-semibold">{currentUser.pendingInvitationsCount || 0}</span>
          </Link>
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <Button variant="outline" className="w-full" asChild>
          <Link href={`/profile/${currentUser.uid}`}> 
            <Users className="mr-2 h-4 w-4" /> My Profile
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function PeopleMayKnowCard() {
  const { currentUser, loadingAuth } = useAuth();
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<UserProfile[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);

  useEffect(() => {
    async function fetchSuggestions() {
      if (currentUser) {
        setIsLoadingSuggestions(true);
        try {
          const fofSuggestions = await getFriendsOfFriendsSuggestions(currentUser.uid, 3);
          setSuggestions(fofSuggestions);
        } catch (error) {
          console.error("Error fetching People You May Know:", error);
          toast({ title: "Error", description: "Could not load suggestions.", variant: "destructive"});
        } finally {
          setIsLoadingSuggestions(false);
        }
      }
    }
    if (!loadingAuth && currentUser) {
      fetchSuggestions();
    }
  }, [currentUser, loadingAuth, toast]);


  if (loadingAuth) return <Card className="p-4 flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin text-primary"/></Card>;
  if (!currentUser || (!isLoadingSuggestions && suggestions.length === 0)) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-md">People you may know</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoadingSuggestions ? (
          <div className="flex justify-center items-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          suggestions.map(person => (
            <div key={person.uid} className="flex items-center space-x-3">
              <Link href={`/profile/${person.uid}`}>
                  <Avatar>
                  <AvatarImage src={person.profilePictureUrl} alt={person.firstName} data-ai-hint="user avatar small"/>
                  <AvatarFallback>{person.firstName?.charAt(0)}{person.lastName?.charAt(0)}</AvatarFallback>
                  </Avatar>
              </Link>
              <div className="flex-grow">
                <Link href={`/profile/${person.uid}`} className="font-semibold text-sm hover:underline">{person.firstName} {person.lastName}</Link>
                <p className="text-xs text-muted-foreground">{person.headline}</p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/network?search=${person.firstName}%20${person.lastName}`}>
                  <Link2 className="h-4 w-4 mr-1" /> Connect
                </Link>
              </Button>
            </div>
          ))
        )}
      </CardContent>
      {suggestions.length > 0 && !isLoadingSuggestions && (
        <CardFooter>
          <Button variant="ghost" className="w-full text-primary" asChild>
            <Link href="/network">Show more</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}


export default function HomePage() {
  const { currentUser, loadingAuth } = useAuth();
  const router = useRouter();

  const [posts, setPosts] = useState<PostType[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<LearningCourse[]>([]);
  const [isLoadingPageData, setIsLoadingPageData] = useState(true);

  const fetchFeedPosts = useCallback(async () => {
    if (!currentUser) return; 
    setIsLoadingPageData(true);
    try {
      // Fetch posts relevant to the current user, e.g., posts from connections or based on interests.
      // For now, it fetches all posts for simplicity, but this should be refined.
      const allPostsData = await getPosts(); 
      
      // Example: Filter posts to show only those from the current user or their connections
      // This requires currentUser.connections to be populated and accurate.
      // const userAndConnectionsIds = [currentUser.uid, ...(currentUser.connections || [])];
      // const feedPosts = allPostsData.filter(post => userAndConnectionsIds.includes(post.authorId));

      // Sort by newest first (already done by getPosts in this implementation, but good to be explicit)
      allPostsData.sort((a, b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime());
      
      setPosts(allPostsData); // Replace with `feedPosts` if filtering is implemented
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoadingPageData(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!loadingAuth && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, loadingAuth, router]);

  useEffect(() => {
    async function loadInitialData() {
      if (currentUser) { 
        setIsLoadingPageData(true); 
        await fetchFeedPosts(); 
        
        const learningCoursesData = await getLearningCourses();
        // For "Recommended Learning", filter based on user's skills or search history (mocked for now)
        const userSkills = currentUser.skills?.map(skill => skill.name.toLowerCase()) || [];
        let filteredCourses = learningCoursesData;
        if (userSkills.length > 0) {
            const matching = learningCoursesData.filter(course => 
                course.keywords?.some(keyword => userSkills.includes(keyword.toLowerCase()))
            );
            if (matching.length > 0) filteredCourses = matching;
        }
        setRecommendedCourses(filteredCourses.slice(0,2)); // Show 2 courses
        
        setIsLoadingPageData(false); 
      }
    }
    if (!loadingAuth && currentUser) {
        loadInitialData();
    }
  }, [currentUser, loadingAuth, fetchFeedPosts]);

  const handlePostCreated = () => {
    fetchFeedPosts(); 
  };
  
  const handlePostUpdated = (updatedPost: PostType) => {
    setPosts(prevPosts => prevPosts.map(p => p.id === updatedPost.id ? updatedPost : p));
  };


  if (loadingAuth || (!currentUser && !loadingAuth)) { 
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-12rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!currentUser) return null; 


  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
      <aside className="md:col-span-1 space-y-4 sticky top-20">
        <ProfileSummaryCard />
      </aside>

      <section className="md:col-span-2 space-y-4">
        <CreatePostCard onPostCreated={handlePostCreated} />
        {isLoadingPageData && posts.length === 0 ? (
             <div className="flex justify-center items-center min-h-[calc(100vh-20rem)]">
                <Loader2 className="h-10 w-10 animate-spin text-primary"/>
             </div>
        ) : posts.length > 0 ? (
            posts.map((post) => (
              <PostCard key={post.id + '-homepage'} post={post} onPostUpdated={handlePostUpdated} />
            ))
        ) : (
          !isLoadingPageData && <Card><CardContent className="p-6 text-center text-muted-foreground">No posts yet. Be the first to share something!</CardContent></Card>
        )}
      </section>

      <aside className="md:col-span-1 space-y-4 sticky top-20">
         <PeopleMayKnowCard />
         {isLoadingPageData && recommendedCourses.length === 0 ? (
            <Card><CardContent className="p-4 h-48 flex justify-center items-center"><Loader2 className="h-8 w-8 animate-spin text-primary"/></CardContent></Card>
         ) : (
            recommendedCourses.length > 0 && <LearningCoursesCard courses={recommendedCourses} />
         )}
      </aside>
    </div>
  );
}

function LearningCoursesCard({ courses }: { courses: LearningCourse[] }) {
  if (!courses || courses.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-md">Recommended learning</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {courses.map((course: LearningCourse) => ( 
          <Link href={`/learning/${course.id}`} key={course.id} className="flex items-center space-x-3 group">
            <Image src={course.thumbnailUrl} alt={course.title} width={80} height={45} className="rounded object-cover" data-ai-hint="course thumbnail"/>
            <div>
              <p className="font-semibold text-sm group-hover:text-primary group-hover:underline">{course.title}</p>
              <p className="text-xs text-muted-foreground">{course.instructor}</p>
            </div>
          </Link>
        ))}
      </CardContent>
      <CardFooter>
         <Button variant="ghost" className="w-full text-primary" disabled>See all recommendations</Button>
      </CardFooter>
    </Card>
  )
}


