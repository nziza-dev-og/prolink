
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserProfile, updateUserProfile } from "@/lib/user-service"; 
import { getPostsByAuthorId } from "@/lib/post-service"; 
import type { UserProfile, WorkExperience, Education, Skill, Post as PostType } from "@/types";
import { Building, Edit, GraduationCap, Loader2, MessageSquare, Plus, Star, UserPlus, Upload } from "lucide-react";
import { useAuth } from '@/context/auth-context';
import PostActions from '@/components/posts/post-actions'; 
import CommentSection from '@/components/posts/comment-section';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { uploadFile } from '@/lib/storage-service';


function ProfilePostCard({ post, onPostUpdated }: { post: PostType, onPostUpdated: (updatedPost: PostType) => void }) {
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

  if (!post.author) {
    console.warn(`ProfilePostCard: post.author is undefined for post ID: ${post.id}. Post data:`, JSON.stringify(post));
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
            key={`link-${post.id}-${index}`} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-primary hover:underline break-all"
          >
            {part}
          </a>
        );
      }
      return <span key={`text-${post.id}-${index}`}>{part}</span>;
    });
  };

  return (
    <Card className="mb-4" key={post.id + '-profile-post'}>
      <CardHeader className="p-4">
        <div className="flex items-center space-x-3">
          <Link href={post.author.uid ? `/profile/${post.author.uid}` : '#'}>
            <Avatar>
              <AvatarImage src={post.author.profilePictureUrl} alt={post.author.firstName || 'User'} data-ai-hint="user avatar"/>
              <AvatarFallback>{post.author.firstName?.charAt(0)}{post.author.lastName?.charAt(0)}</AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <Link href={post.author.uid ? `/profile/${post.author.uid}` : '#'} className="font-semibold hover:underline">
               {post.author.firstName || 'Unknown'} {post.author.lastName || 'Author'}
            </Link>
            <p className="text-xs text-muted-foreground">{post.author.headline || 'No headline'}</p>
            <p className="text-xs text-muted-foreground">{post.createdAt ? new Date(post.createdAt as string).toLocaleDateString() : 'Date unknown'}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-2">
        <div className="text-sm mb-2 whitespace-pre-line">{renderContentWithLinks(post.content)}</div>
        {post.imageUrl && (
          <div className="my-2 rounded-md overflow-hidden">
            <Image src={post.imageUrl} alt="Post image" width={600} height={400} className="w-full h-auto object-cover" data-ai-hint="social media post"/>
          </div>
        )}
      </CardContent>
       <div className="px-4 pb-2 pt-0 text-xs text-muted-foreground flex justify-between">
           <span>{post.likesCount || 0} Likes</span>
            <button onClick={() => setShowComments(!showComments)} className="hover:underline">
                {post.commentsCount || 0} Comments
            </button>
           <span>{post.repostsCount || 0} Reposts</span>
       </div>
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


export default function UserProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const router = useRouter();
  
  const { currentUser: loggedInUser, loadingAuth, refetchUserProfile } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<PostType[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const [isEditingProfilePicture, setIsEditingProfilePicture] = useState(false);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [profilePictureUrlInput, setProfilePictureUrlInput] = useState('');
  const [isUploadingProfilePicture, setIsUploadingProfilePicture] = useState(false);
  
  const [isEditingCoverPhoto, setIsEditingCoverPhoto] = useState(false);
  const [coverPhotoFile, setCoverPhotoFile] = useState<File | null>(null);
  const [coverPhotoUrlInput, setCoverPhotoUrlInput] = useState('');
  const [isUploadingCoverPhoto, setIsUploadingCoverPhoto] = useState(false);


  const fetchProfileAndPosts = useCallback(async () => {
    if (userId) {
      setIsLoadingProfile(true);
      try {
        const userProfileData = await getUserProfile(userId);
        setProfile(userProfileData);
        if (userProfileData) {
          setProfilePictureUrlInput(userProfileData.profilePictureUrl || '');
          setCoverPhotoUrlInput(userProfileData.coverPhotoUrl || '');
          const postsData = await getPostsByAuthorId(userId);
          setUserPosts(postsData);
        }
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
        toast({ title: "Error", description: "Could not load profile data.", variant: "destructive" });
      } finally {
        setIsLoadingProfile(false);
      }
    }
  }, [userId, toast]);


  useEffect(() => {
    if (!loadingAuth && !loggedInUser && userId) { 
        router.push('/login');
    }
  }, [loggedInUser, loadingAuth, router, userId]);
  
  useEffect(() => {
    if (!loadingAuth && loggedInUser) { 
        fetchProfileAndPosts();
    }
  }, [userId, loadingAuth, loggedInUser, fetchProfileAndPosts]);

  const handlePostUpdated = (updatedPost: PostType) => {
    setUserPosts(prevPosts => prevPosts.map(p => p.id === updatedPost.id ? updatedPost : p));
  };

  const handleProfilePictureFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePictureFile(e.target.files[0]);
      setProfilePictureUrlInput(''); // Clear URL input if file is selected
    }
  };

  const handleCoverPhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverPhotoFile(e.target.files[0]);
      setCoverPhotoUrlInput(''); 
    }
  };
  
  const handleUpdateProfilePicture = async () => {
    if (!loggedInUser) return;
    setIsUploadingProfilePicture(true);
    let newProfilePictureUrl = profile?.profilePictureUrl;

    try {
      if (profilePictureFile) {
        const filePath = `profilePictures/${loggedInUser.uid}/${profilePictureFile.name}`;
        newProfilePictureUrl = await uploadFile(profilePictureFile, filePath);
      } else if (profilePictureUrlInput.trim() !== '' && profilePictureUrlInput !== profile?.profilePictureUrl) {
        newProfilePictureUrl = profilePictureUrlInput.trim();
      }

      if (newProfilePictureUrl !== profile?.profilePictureUrl) {
         await updateUserProfile(loggedInUser.uid, { profilePictureUrl: newProfilePictureUrl });
         await refetchUserProfile(); // Refetch context
         await fetchProfileAndPosts(); // Refetch page data
         toast({ title: "Profile Picture Updated" });
      }
      setIsEditingProfilePicture(false);
      setProfilePictureFile(null);
    } catch (error) {
      console.error("Error updating profile picture:", error);
      toast({ title: "Update Failed", description: "Could not update profile picture.", variant: "destructive" });
    } finally {
      setIsUploadingProfilePicture(false);
    }
  };

  const handleUpdateCoverPhoto = async () => {
    if (!loggedInUser) return;
    setIsUploadingCoverPhoto(true);
    let newCoverPhotoUrl = profile?.coverPhotoUrl;

    try {
      if (coverPhotoFile) {
        const filePath = `coverPhotos/${loggedInUser.uid}/${coverPhotoFile.name}`;
        newCoverPhotoUrl = await uploadFile(coverPhotoFile, filePath);
      } else if (coverPhotoUrlInput.trim() !== '' && coverPhotoUrlInput !== profile?.coverPhotoUrl) {
        newCoverPhotoUrl = coverPhotoUrlInput.trim();
      }
       if (newCoverPhotoUrl !== profile?.coverPhotoUrl) {
         await updateUserProfile(loggedInUser.uid, { coverPhotoUrl: newCoverPhotoUrl });
         await refetchUserProfile();
         await fetchProfileAndPosts();
         toast({ title: "Cover Photo Updated" });
       }
      setIsEditingCoverPhoto(false);
      setCoverPhotoFile(null);
    } catch (error) {
      console.error("Error updating cover photo:", error);
      toast({ title: "Update Failed", description: "Could not update cover photo.", variant: "destructive" });
    } finally {
      setIsUploadingCoverPhoto(false);
    }
  };


  if (loadingAuth || isLoadingProfile) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-12rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center py-10">Profile not found.</div>;
  }

  const isCurrentUserProfile = loggedInUser?.uid === profile.uid;

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="relative h-48 md:h-64 bg-muted group">
          {profile.coverPhotoUrl && (
            <Image src={profile.coverPhotoUrl} alt={`${profile.firstName}'s cover photo`} layout="fill" objectFit="cover" data-ai-hint="profile cover background"/>
          )}
          {isCurrentUserProfile && (
            <Button 
              variant="outline" 
              size="icon" 
              className="absolute top-2 right-2 bg-card/70 hover:bg-card opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => setIsEditingCoverPhoto(true)}
            >
              <Upload className="h-5 w-5"/>
            </Button>
          )}
        </div>
        <CardContent className="p-4 sm:p-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6">
            <div className="relative group">
              <Avatar className="h-32 w-32 sm:h-40 sm:w-40 border-4 border-card rounded-full bg-card -mt-16 sm:-mt-20 flex-shrink-0">
                <AvatarImage src={profile.profilePictureUrl} alt={profile.firstName || ''} data-ai-hint="user avatar large"/>
                <AvatarFallback className="text-5xl">{profile.firstName?.charAt(0)}{profile.lastName?.charAt(0)}</AvatarFallback>
              </Avatar>
              {isCurrentUserProfile && (
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="absolute bottom-0 right-0 sm:bottom-2 sm:right-2 bg-card/70 hover:bg-card opacity-0 group-hover:opacity-100 transition-opacity rounded-full h-8 w-8 sm:h-10 sm:w-10"
                  onClick={() => setIsEditingProfilePicture(true)}
                >
                  <Upload className="h-4 w-4 sm:h-5 sm:w-5"/>
                </Button>
              )}
            </div>
            <div className="mt-4 sm:mt-0 flex-grow">
              <h1 className="text-2xl sm:text-3xl font-bold">{profile.firstName} {profile.lastName}</h1>
              <p className="text-md text-foreground">{profile.headline}</p>
              <p className="text-sm text-muted-foreground">{profile.location} </p>
              <p className="text-sm text-primary font-semibold hover:underline">
                <Link href={`/network/connections/${profile.uid}`}>{profile.connectionsCount || 0} connections</Link>
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              {isCurrentUserProfile ? (
                <>
                  <Button variant="outline" asChild className="w-full sm:w-auto"> 
                    <Link href="/settings">
                        <Edit className="mr-2 h-4 w-4" /> Edit profile
                    </Link>
                  </Button>
                  <Button disabled className="w-full sm:w-auto">Add profile section</Button> 
                </>
              ) : (
                <>
                  <Button asChild className="w-full sm:w-auto"><Link href={`/network?search=${profile.firstName}%20${profile.lastName}`}><UserPlus className="mr-2 h-4 w-4" /> Connect</Link></Button> 
                  <Button variant="outline" asChild className="w-full sm:w-auto"><Link href={`/messaging?chatWith=${profile.uid}`}><MessageSquare className="mr-2 h-4 w-4" /> Message</Link></Button> 
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Picture Dialog */}
      <Dialog open={isEditingProfilePicture} onOpenChange={setIsEditingProfilePicture}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Profile Picture</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label htmlFor="profilePictureUrlInput" className="text-sm font-medium">Image URL</label>
              <Input 
                id="profilePictureUrlInput" 
                value={profilePictureUrlInput} 
                onChange={(e) => { setProfilePictureUrlInput(e.target.value); setProfilePictureFile(null); }} 
                placeholder="https://example.com/image.png" 
                disabled={isUploadingProfilePicture}
              />
            </div>
            <div className="text-center text-sm text-muted-foreground">OR</div>
            <div>
              <label htmlFor="profilePictureFileInput" className="text-sm font-medium">Upload File</label>
              <Input 
                id="profilePictureFileInput" 
                type="file" 
                accept="image/*" 
                onChange={handleProfilePictureFileChange} 
                disabled={isUploadingProfilePicture}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
              {profilePictureFile && <p className="text-xs text-muted-foreground mt-1">Selected: {profilePictureFile.name}</p>}
            </div>
            {(profilePictureUrlInput || profilePictureFile) && profile?.profilePictureUrl !== (profilePictureFile ? URL.createObjectURL(profilePictureFile) : profilePictureUrlInput) && (
              <div className="mt-2 border rounded-md p-2">
                <p className="text-xs mb-1">Preview:</p>
                 <Image src={profilePictureFile ? URL.createObjectURL(profilePictureFile) : profilePictureUrlInput} alt="Preview" width={100} height={100} className="rounded-full mx-auto" data-ai-hint="user avatar preview" />
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline" disabled={isUploadingProfilePicture}>Cancel</Button></DialogClose>
            <Button onClick={handleUpdateProfilePicture} disabled={isUploadingProfilePicture || (!profilePictureFile && !profilePictureUrlInput.trim())}>
              {isUploadingProfilePicture && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Cover Photo Dialog */}
      <Dialog open={isEditingCoverPhoto} onOpenChange={setIsEditingCoverPhoto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Cover Photo</DialogTitle>
          </DialogHeader>
           <div className="space-y-4 py-4">
            <div>
              <label htmlFor="coverPhotoUrlInput" className="text-sm font-medium">Image URL</label>
              <Input 
                id="coverPhotoUrlInput" 
                value={coverPhotoUrlInput} 
                onChange={(e) => { setCoverPhotoUrlInput(e.target.value); setCoverPhotoFile(null); }} 
                placeholder="https://example.com/cover.png" 
                disabled={isUploadingCoverPhoto}
              />
            </div>
            <div className="text-center text-sm text-muted-foreground">OR</div>
            <div>
              <label htmlFor="coverPhotoFileInput" className="text-sm font-medium">Upload File</label>
              <Input 
                id="coverPhotoFileInput" 
                type="file" 
                accept="image/*" 
                onChange={handleCoverPhotoFileChange} 
                disabled={isUploadingCoverPhoto}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
              {coverPhotoFile && <p className="text-xs text-muted-foreground mt-1">Selected: {coverPhotoFile.name}</p>}
            </div>
             {(coverPhotoUrlInput || coverPhotoFile) && profile?.coverPhotoUrl !== (coverPhotoFile ? URL.createObjectURL(coverPhotoFile) : coverPhotoUrlInput) && (
              <div className="mt-2 border rounded-md p-2">
                <p className="text-xs mb-1">Preview:</p>
                 <Image src={coverPhotoFile ? URL.createObjectURL(coverPhotoFile) : coverPhotoUrlInput} alt="Preview" width={300} height={100} className="rounded-md mx-auto object-cover" data-ai-hint="cover photo preview"/>
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline" disabled={isUploadingCoverPhoto}>Cancel</Button></DialogClose>
            <Button onClick={handleUpdateCoverPhoto} disabled={isUploadingCoverPhoto || (!coverPhotoFile && !coverPhotoUrlInput.trim())}>
              {isUploadingCoverPhoto && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


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

      <Card>
        <CardHeader>
          <CardTitle>Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {userPosts.length > 0 ? (
            userPosts.map(post => <ProfilePostCard key={post.id + '-profile-activity'} post={post} onPostUpdated={handlePostUpdated} />)
          ) : (
            <p className="text-sm text-muted-foreground">{profile.firstName} hasn&apos;t posted recently.</p>
          )}
        </CardContent>
      </Card>
      
      {profile.workExperience && profile.workExperience.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Experience</CardTitle>
            {isCurrentUserProfile && <Button variant="ghost" size="icon" disabled><Plus className="h-5 w-5" /></Button>}
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
                {isCurrentUserProfile && <Button variant="ghost" size="icon" className="ml-auto self-start" disabled><Edit className="h-4 w-4" /></Button>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {profile.education && profile.education.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Education</CardTitle>
             {isCurrentUserProfile && <Button variant="ghost" size="icon" disabled><Plus className="h-5 w-5" /></Button>}
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
                {isCurrentUserProfile && <Button variant="ghost" size="icon" className="ml-auto self-start" disabled><Edit className="h-4 w-4" /></Button>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {profile.skills && profile.skills.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Skills</CardTitle>
            {isCurrentUserProfile && <Button variant="outline" size="sm" disabled>Add new skill</Button>}
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.skills.slice(0, 5).map((skill: Skill) => ( 
              <div key={skill.id} className="pb-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-sm">{skill.name}</h4>
                  {isCurrentUserProfile && <Button variant="ghost" size="icon" className="h-7 w-7" disabled><Edit className="h-4 w-4" /></Button>}
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
