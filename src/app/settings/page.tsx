'use client';

import type { UserProfile } from '@/types';
import { useEffect, useState, type ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/auth-context';
import { updateUserProfile } from '@/lib/user-service';
import { uploadFile } from '@/lib/storage-service'; // New import
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // New import
import { useToast } from '@/hooks/use-toast';
import { Loader2, Camera } from 'lucide-react'; // Added Camera icon
import { useRouter } from 'next/navigation';

const profileFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  headline: z.string().optional(),
  summary: z.string().optional(),
  location: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function SettingsPage() {
  const { currentUser, loadingAuth, refetchUserProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);

  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      headline: '',
      summary: '',
      location: '',
    },
  });

  useEffect(() => {
    if (!loadingAuth && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, loadingAuth, router]);

  useEffect(() => {
    if (currentUser) {
      form.reset({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        headline: currentUser.headline || '',
        summary: currentUser.summary || '',
        location: currentUser.location || '',
      });
      setImagePreviewUrl(currentUser.profilePictureUrl || null);
    }
  }, [currentUser, form]);

  const onProfileSubmit = async (values: ProfileFormValues) => {
    if (!currentUser) return;
    setIsSubmittingProfile(true);
    try {
      await updateUserProfile(currentUser.uid, values);
      await refetchUserProfile();
      toast({ title: 'Profile Updated', description: 'Your profile information has been successfully updated.' });
    } catch (error: any) {
      toast({ title: 'Update Failed', description: error.message || 'Could not update profile.', variant: 'destructive' });
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfilePictureFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setProfilePictureFile(null);
      setImagePreviewUrl(currentUser?.profilePictureUrl || null);
    }
  };

  const handleUploadProfilePicture = async () => {
    if (!currentUser || !profilePictureFile) {
      toast({ title: 'No File Selected', description: 'Please select an image to upload.', variant: 'destructive'});
      return;
    }
    setIsUploadingPicture(true);
    try {
      const filePath = `profilePictures/${currentUser.uid}/${profilePictureFile.name}`;
      const downloadURL = await uploadFile(profilePictureFile, filePath);
      await updateUserProfile(currentUser.uid, { profilePictureUrl: downloadURL });
      await refetchUserProfile();
      toast({ title: 'Profile Picture Updated', description: 'Your new profile picture is now live.' });
      setProfilePictureFile(null); 
      // imagePreviewUrl is already set to the new local URL or will be updated by refetchUserProfile
    } catch (error: any) {
      toast({ title: 'Upload Failed', description: error.message || 'Could not upload profile picture.', variant: 'destructive' });
    } finally {
      setIsUploadingPicture(false);
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
    <div className="max-w-3xl mx-auto space-y-8 py-8">
      <h1 className="text-3xl font-bold">Settings & Privacy</h1>

      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>Update your profile avatar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={imagePreviewUrl || currentUser.profilePictureUrl} alt={currentUser.firstName} data-ai-hint="user avatar large"/>
              <AvatarFallback className="text-3xl">
                {currentUser.firstName?.charAt(0)}
                {currentUser.lastName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-2">
                <Label htmlFor="profilePictureInput" className={cn(
                    buttonVariants({ variant: "outline" }),
                    "cursor-pointer"
                )}>
                    <Camera className="mr-2 h-4 w-4" />
                    Change Picture
                </Label>
                <Input 
                    id="profilePictureInput" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="hidden"
                    disabled={isUploadingPicture}
                />
                {profilePictureFile && (
                    <Button onClick={handleUploadProfilePicture} disabled={isUploadingPicture || !profilePictureFile}>
                        {isUploadingPicture && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Upload & Save
                    </Button>
                )}
            </div>
          </div>
           {profilePictureFile && <p className="text-sm text-muted-foreground">Selected: {profilePictureFile.name}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your personal details.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onProfileSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your first name" {...field} disabled={isSubmittingProfile} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your last name" {...field} disabled={isSubmittingProfile} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="headline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Headline</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Senior Software Engineer at TechCorp" {...field} disabled={isSubmittingProfile} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., San Francisco, CA" {...field} disabled={isSubmittingProfile}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="summary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Summary</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Tell us about yourself" {...field} rows={5} disabled={isSubmittingProfile}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmittingProfile}>
                {isSubmittingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Profile Changes
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Manage your account details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Email Address</Label>
            <p className="text-sm text-muted-foreground">{currentUser.email}</p>
            <Button variant="link" className="p-0 h-auto text-sm" disabled>Change Email (coming soon)</Button>
          </div>
          <div>
            <Label>Password</Label>
            <Button variant="link" className="p-0 h-auto text-sm block" disabled>Change Password (coming soon)</Button>
          </div>
           <div>
             <Label>Admin Access</Label>
             <Button variant="outline" size="sm" onClick={() => router.push('/admin/login')} className="mt-1">
                Go to Admin Panel
             </Button>
           </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Privacy Settings</CardTitle>
          <CardDescription>Control how your information is shared.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Privacy controls are under development. (e.g., Profile visibility, Who can see your connections, etc.)</p>
          <div className="flex items-center justify-between mt-4 py-2 border-t">
            <Label htmlFor="profile-visibility">Profile Visibility</Label>
             <p className="text-xs text-muted-foreground">Currently Public</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
