'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getLearningCourses as fetchLearningCourses, mockUserProfiles } from "@/lib/mock-data"; 
import { getPostsByAuthorId, getPosts } from '@/lib/post-service'; 
import type { Post as PostType, LearningCourse, UserProfile, Skill } from "@/types";
import { Briefcase, Edit3, Image as ImageIcon, Link2, Loader2, MessageCircle, Repeat, Send, ThumbsUp, Users, Video } from "lucide-react";
import { useAuth } from '@/context/auth-context';
import CreatePostDialog from '@/components/posts/create-post-dialog';
import PostActions from '@/components/posts/post-actions'; 

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
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:bg-accent/50" disabled>
              <Briefcase className="mr-2 h-5 w-5 text-purple-500" /> Job
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:bg-accent/50" disabled>
              <Edit3 className="mr-2 h-5 w-5 text-orange-500" /> Write article
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
  const handleLikeUnlike = (postId: string, newLikes: string[], newLikesCount: number) => {
    if (post.id === postId) {
      onPostUpdated({ ...post, likes: newLikes, likesCount: newLikesCount });
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
            key={index} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-primary hover:underline break-all"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };
  
  return (
    <Card className="mb-4">
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
          <span>{post.commentsCount || 0} Comments</span>
          <span>{post.repostsCount || 0} Reposts</span>
        </div>
      </CardFooter>
      <div className="px-4 pb-3">
         <PostActions post={post} onLikeUnlike={handleLikeUnlike} />
      </div>
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
             {/* Mock data for invitations count, replace with actual data if available */}
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
  const { currentUser } = useAuth();
  const [suggestions, setSuggestions] = useState<UserProfile[]>([]);

  useEffect(() => {
    // This is mock data. In a real app, fetch suggestions from a service.
    if (currentUser) {
      const currentUserLocation = currentUser.location;
      const currentUserConnections = currentUser.connections || [];
      const currentUserPendingInvitations = currentUser.pendingInvitations || []; // Assuming this field exists
      
      const filteredSuggestions = mockUserProfiles.filter(p => 
        p.uid !== currentUser.uid && 
        !currentUserConnections.includes(p.uid) &&
        !currentUserPendingInvitations.some(invId => invId === p.uid) && // Don't suggest if already invited
        (currentUserLocation ? p.location === currentUserLocation : true) 
      ).slice(0,3); // Limit to 3 suggestions
      setSuggestions(filteredSuggestions);
    }
  }, [currentUser]);


  if (!currentUser || suggestions.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-md">People you may know {currentUser.location ? `from ${currentUser.location}` : ''}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map(person => (
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
            <Button variant="outline" size="sm" disabled> {/* Connect functionality to be implemented */}
              <Link2 className="h-4 w-4 mr-1" /> Connect
            </Button>
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button variant="ghost" className="w-full text-primary" asChild>
          <Link href="/network">Show more</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}


export default function HomePage() {
  const { currentUser, loadingAuth } = useAuth();
  const router = useRouter();

  const [posts, setPosts] = useState<PostType[]>([]);
  // const [allLearningCourses, setAllLearningCourses] = useState<LearningCourse[]>([]); // Keep if needed for other features
  const [recommendedCourses, setRecommendedCourses] = useState<LearningCourse[]>([]);
  const [isLoadingPageData, setIsLoadingPageData] = useState(true);

  const fetchUserSpecificPosts = useCallback(async () => {
    if (!currentUser) return; 
    setIsLoadingPageData(true);
    try {
      // Fetch posts specifically by the current user for their feed
      const userPostsData = await getPostsByAuthorId(currentUser.uid);
      const allPostsData = await getPosts(); // Fetch all posts to show in feed as well
      
      // Combine user's posts with others, ensuring no duplicates and sorting
      const combinedPosts = [...userPostsData, ...allPostsData.filter(p => p.authorId !== currentUser.uid)];
      const uniquePosts = Array.from(new Map(combinedPosts.map(p => [p.id, p])).values());
      uniquePosts.sort((a, b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime());
      
      setPosts(uniquePosts);
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
        await fetchUserSpecificPosts(); 
        
        const learningCoursesData = await fetchLearningCourses();
        // setAllLearningCourses(learningCoursesData); // Keep if needed elsewhere
        
        // Simulate learning recommendations based on user skills
        const userSkills = currentUser.skills?.map(skill => skill.name.toLowerCase()) || [];
        if (userSkills.length > 0 && learningCoursesData.length > 0) {
            const matchingCourses = learningCoursesData.filter(course => 
                course.keywords?.some(keyword => userSkills.includes(keyword.toLowerCase()))
            ).slice(0,2); // Limit to 2 recommendations
            setRecommendedCourses(matchingCourses.length > 0 ? matchingCourses : learningCoursesData.slice(0,2));
        } else {
            setRecommendedCourses(learningCoursesData.slice(0,2)); // Default if no skills or matches
        }
        setIsLoadingPageData(false); 
      }
    }
    if (!loadingAuth && currentUser) {
        loadInitialData();
    }
  }, [currentUser, loadingAuth, fetchUserSpecificPosts]);

  const handlePostCreated = () => {
    fetchUserSpecificPosts(); 
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
              <PostCard key={post.id} post={post} onPostUpdated={handlePostUpdated} />
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

