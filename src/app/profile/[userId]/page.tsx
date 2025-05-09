'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getUserProfile } from "@/lib/user-service"; // Fetches from Firestore
import { getFeedPosts } from "@/lib/mock-data"; // Still using mock posts for now
import type { UserProfile, WorkExperience, Education, Skill, Post as PostType } from "@/types";
import { Building, Edit, GraduationCap, Loader2, MessageSquare, Plus, Star, UserPlus } from "lucide-react";
import { useAuth } from '@/context/auth-context';

// Re-using PostCard component (can be extracted later)
function PostCard({ post }: { post: PostType }) {
  return (
    <Card className="mb-4">
      <CardHeader className="p-4">
        <div className="flex items-center space-x-3">
          <Link href={`/profile/${post.author.id}`}>
            <Avatar>
              <AvatarImage src={post.author.profilePictureUrl} alt={post.author.firstName} data-ai-hint="user avatar"/>
              <AvatarFallback>{post.author.firstName?.charAt(0)}{post.author.lastName?.charAt(0)}</AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <Link href={`/profile/${post.author.id}`} className="font-semibold hover:underline">{post.author.firstName} {post.author.lastName}</Link>
            <p className="text-xs text-muted-foreground">{post.author.headline}</p>
            <p className="text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-2">
        <p className="text-sm mb-2 whitespace-pre-line">{post.content}</p>
        {post.imageUrl && (
          <div className="my-2 rounded-md overflow-hidden">
            <Image src={post.imageUrl} alt="Post image" width={600} height={400} className="w-full h-auto object-cover" data-ai-hint="social media post"/>
          </div>
        )}
      </CardContent>
      {/* Add PostActions or similar here if needed */}
    </Card>
  );
}


export default function UserProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const router = useRouter();
  
  const { currentUser: loggedInUser, loadingAuth } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<PostType[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    if (!loadingAuth && !loggedInUser && userId) { // ensure userId is checked after router is ready
        router.push('/login');
    }
  }, [loggedInUser, loadingAuth, router, userId]);
  
  useEffect(() => {
    async function fetchProfileData() {
      if (userId) {
        setIsLoadingProfile(true);
        try {
          const userProfileData = await getUserProfile(userId);
          setProfile(userProfileData);

          // TODO: Replace with Firestore query for user's posts
          const allPosts = await getFeedPosts();
          setUserPosts(allPosts.filter(post => post.author.id === userId));

        } catch (error) {
          console.error("Failed to fetch profile data:", error);
          // Optionally, redirect to a 404 page or show an error message
        } finally {
          setIsLoadingProfile(false);
        }
      }
    }
    if (!loadingAuth && loggedInUser) { // Only fetch if auth is resolved and user is logged in
        fetchProfileData();
    }
  }, [userId, loadingAuth, loggedInUser]);

  if (loadingAuth || isLoadingProfile) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-12rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center py-10">Profile not found or you do not have permission to view it.</div>;
  }

  const isCurrentUserProfile = loggedInUser?.uid === profile.uid;

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <Card className="overflow-hidden">
        <div className="relative h-48 md:h-64 bg-muted">
          {profile.coverPhotoUrl && (
            <Image src={profile.coverPhotoUrl} alt={`${profile.firstName}'s cover photo`} layout="fill" objectFit="cover" data-ai-hint="profile cover background"/>
          )}
        </div>
        <CardContent className="p-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-end -mt-20 sm:-mt-24">
            <Avatar className="h-32 w-32 sm:h-40 sm:w-40 border-4 border-card rounded-full bg-card">
              <AvatarImage src={profile.profilePictureUrl} alt={profile.firstName} data-ai-hint="user avatar large"/>
              <AvatarFallback className="text-5xl">{profile.firstName?.charAt(0)}{profile.lastName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="sm:ml-6 mt-4 sm:mt-0 flex-grow">
              <h1 className="text-2xl sm:text-3xl font-bold">{profile.firstName} {profile.lastName}</h1>
              <p className="text-md text-foreground">{profile.headline}</p>
              <p className="text-sm text-muted-foreground">{profile.location} 
                {/* <Link href="#" className="text-primary hover:underline">Contact info</Link> */}
              </p>
              <p className="text-sm text-primary font-semibold hover:underline">
                <Link href={`/network/connections/${profile.id}`}>{profile.connectionsCount || 0} connections</Link>
              </p>
            </div>
            <div className="mt-4 sm:mt-0 space-x-2 flex items-center">
              {isCurrentUserProfile ? (
                <>
                  <Button variant="outline" disabled> {/* TODO: Implement Edit Profile */}
                    <Edit className="mr-2 h-4 w-4" /> Edit profile
                  </Button>
                  <Button disabled>Add profile section</Button> {/* TODO: Implement Add Profile Section */}
                </>
              ) : (
                <>
                  <Button disabled><UserPlus className="mr-2 h-4 w-4" /> Connect</Button> {/* TODO: Implement Connect */}
                  <Button variant="outline" disabled><MessageSquare className="mr-2 h-4 w-4" /> Message</Button> {/* TODO: Implement Message */}
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About Section */}
      {profile.summary && (
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-line">{profile.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Activity Section */}
      <Card>
        <CardHeader>
          <CardTitle>Activity</CardTitle>
          {/* <CardDescription>{profile.connectionsCount || 0} followers</CardDescription> */}
        </CardHeader>
        <CardContent>
          {userPosts.length > 0 ? (
            userPosts.map(post => <PostCard key={post.id} post={post} />)
          ) : (
            <p className="text-sm text-muted-foreground">{profile.firstName} hasn&apos;t posted recently.</p>
          )}
          {/* {userPosts.length > 0 && <Button variant="link" className="text-primary p-0 h-auto">See all activity</Button>} */}
        </CardContent>
      </Card>
      

      {/* Experience Section */}
      {profile.workExperience && profile.workExperience.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Experience</CardTitle>
            {isCurrentUserProfile && <Button variant="ghost" size="icon" disabled><Plus className="h-5 w-5" /></Button>} {/* TODO: Implement */}
          </CardHeader>
          <CardContent className="space-y-6">
            {profile.workExperience.map((exp: WorkExperience) => (
              <div key={exp.id} className="flex space-x-4">
                {exp.companyLogoUrl ?
                  <Image src={exp.companyLogoUrl} alt={`${exp.companyName} logo`} width={48} height={48} className="rounded-sm h-12 w-12 object-contain" data-ai-hint="company logo small"/> :
                  <div className="h-12 w-12 bg-muted rounded-sm flex items-center justify-center"><Building className="h-6 w-6 text-muted-foreground"/></div>
                }
                <div>
                  <h3 className="font-semibold">{exp.title}</h3>
                  <p className="text-sm">{exp.companyName}</p>
                  <p className="text-xs text-muted-foreground">
                    {exp.startDate} – {exp.endDate || 'Present'}
                  </p>
                  {exp.location && <p className="text-xs text-muted-foreground">{exp.location}</p>}
                  {exp.description && <p className="text-sm mt-1">{exp.description}</p>}
                </div>
                {isCurrentUserProfile && <Button variant="ghost" size="icon" className="ml-auto self-start" disabled><Edit className="h-4 w-4" /></Button>} {/* TODO: Implement */}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Education Section */}
      {profile.education && profile.education.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Education</CardTitle>
             {isCurrentUserProfile && <Button variant="ghost" size="icon" disabled><Plus className="h-5 w-5" /></Button>} {/* TODO: Implement */}
          </CardHeader>
          <CardContent className="space-y-6">
            {profile.education.map((edu: Education) => (
              <div key={edu.id} className="flex space-x-4">
                 <div className="h-12 w-12 bg-muted rounded-sm flex items-center justify-center"><GraduationCap className="h-6 w-6 text-muted-foreground"/></div>
                <div>
                  <h3 className="font-semibold">{edu.schoolName}</h3>
                  {edu.degree && <p className="text-sm">{edu.degree}</p>}
                  {edu.fieldOfStudy && <p className="text-sm text-muted-foreground">{edu.fieldOfStudy}</p>}
                  <p className="text-xs text-muted-foreground">
                    {edu.startDate} – {edu.endDate || 'Present'}
                  </p>
                   {edu.description && <p className="text-sm mt-1">{edu.description}</p>}
                </div>
                {isCurrentUserProfile && <Button variant="ghost" size="icon" className="ml-auto self-start" disabled><Edit className="h-4 w-4" /></Button>} {/* TODO: Implement */}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Skills Section */}
      {profile.skills && profile.skills.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Skills</CardTitle>
            {isCurrentUserProfile && <Button variant="outline" size="sm" disabled>Add new skill</Button>} {/* TODO: Implement */}
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.skills.slice(0, 5).map((skill: Skill) => ( // Show top 5 skills, for example
              <div key={skill.id} className="pb-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-sm">{skill.name}</h4>
                  {isCurrentUserProfile && <Button variant="ghost" size="icon" className="h-7 w-7" disabled><Edit className="h-4 w-4" /></Button>} {/* TODO: Implement */}
                </div>
                {skill.endorsements && skill.endorsements > 0 && (
                   <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <Star className="h-3 w-3 mr-1 fill-primary text-primary" />
                    <span>Endorsed by {skill.endorsements} people</span>
                  </div>
                )}
              </div>
            ))}
            {profile.skills.length > 5 && (
              <Button variant="link" className="text-primary p-0 h-auto" disabled>Show all {profile.skills.length} skills</Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
