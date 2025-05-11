

'use client';

import type { UserProfile, JobPreferences } from '@/types';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import { useAuth } from '@/context/auth-context';
import { updateUserProfile } from '@/lib/user-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label as ShadCnLabel } from '@/components/ui/label'; 
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Briefcase } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const profileFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  headline: z.string().optional(),
  summary: z.string().optional(),
  location: z.string().optional(),
  profilePictureUrl: z.string().url("Must be a valid URL for profile picture.").optional().or(z.literal('')),
  coverPhotoUrl: z.string().url("Must be a valid URL for cover photo.").optional().or(z.literal('')),
  jobPreferences: z.object({
    desiredTitles: z.string().optional().transform(val => val ? val.split(',').map(s => s.trim()).filter(s => s.length > 0) : []),
    preferredLocations: z.string().optional().transform(val => val ? val.split(',').map(s => s.trim()).filter(s => s.length > 0) : []),
    openToOpportunities: z.enum(['NotOpen', 'Open', 'ActivelyLooking']).optional().default('NotOpen'),
  }).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function SettingsPage() {
  const { currentUser, loadingAuth, refetchUserProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);

  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [coverImagePreviewUrl, setCoverImagePreviewUrl] = useState<string | null>(null);


  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      headline: '',
      summary: '',
      location: '',
      profilePictureUrl: '',
      coverPhotoUrl: '',
      jobPreferences: {
        desiredTitles: [],
        preferredLocations: [],
        openToOpportunities: 'NotOpen',
      },
    },
  });

  useEffect(() => {
    if (!loadingAuth && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, loadingAuth, router]);

  useEffect(() => {
    if (currentUser) {
      const initialProfilePicUrl = currentUser.profilePictureUrl || '';
      const initialCoverPhotoUrl = currentUser.coverPhotoUrl || '';
      form.reset({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        headline: currentUser.headline || '',
        summary: currentUser.summary || '',
        location: currentUser.location || '',
        profilePictureUrl: initialProfilePicUrl,
        coverPhotoUrl: initialCoverPhotoUrl,
        jobPreferences: {
          desiredTitles: currentUser.jobPreferences?.desiredTitles?.join(', ') || '',
          preferredLocations: currentUser.jobPreferences?.preferredLocations?.join(', ') || '',
          openToOpportunities: currentUser.jobPreferences?.openToOpportunities || 'NotOpen',
        },
      });
      setImagePreviewUrl(initialProfilePicUrl || null);
      setCoverImagePreviewUrl(initialCoverPhotoUrl || null);
    }
  }, [currentUser, form]);

  const watchedProfilePictureUrl = form.watch('profilePictureUrl');
  const watchedCoverPhotoUrl = form.watch('coverPhotoUrl');

  useEffect(() => {
    if (watchedProfilePictureUrl && watchedProfilePictureUrl.trim() !== "") {
      setImagePreviewUrl(watchedProfilePictureUrl);
    } else if (currentUser) {
      setImagePreviewUrl(currentUser.profilePictureUrl || null);
    } else {
      setImagePreviewUrl(null);
    }
  }, [watchedProfilePictureUrl, currentUser]);

  useEffect(() => {
    if (watchedCoverPhotoUrl && watchedCoverPhotoUrl.trim() !== "") {
      setCoverImagePreviewUrl(watchedCoverPhotoUrl);
    } else if (currentUser) {
      setCoverImagePreviewUrl(currentUser.coverPhotoUrl || null);
    } else {
      setCoverImagePreviewUrl(null);
    }
  }, [watchedCoverPhotoUrl, currentUser]);


  const onProfileSubmit = async (values: ProfileFormValues) => {
    if (!currentUser) return;
    setIsSubmittingProfile(true);

    // Transform jobPreferences strings back to arrays for desiredTitles and preferredLocations
    const jobPreferencesToSave: JobPreferences = {
        desiredTitles: typeof values.jobPreferences?.desiredTitles === 'string' 
            ? values.jobPreferences.desiredTitles.split(',').map(s => s.trim()).filter(s => s) 
            : values.jobPreferences?.desiredTitles || [],
        preferredLocations: typeof values.jobPreferences?.preferredLocations === 'string'
            ? values.jobPreferences.preferredLocations.split(',').map(s => s.trim()).filter(s => s)
            : values.jobPreferences?.preferredLocations || [],
        openToOpportunities: values.jobPreferences?.openToOpportunities || 'NotOpen',
    };
    
    try {
      await updateUserProfile(currentUser.uid, { 
        firstName: values.firstName,
        lastName: values.lastName,
        headline: values.headline,
        summary: values.summary,
        location: values.location,
        profilePictureUrl: values.profilePictureUrl || undefined,
        coverPhotoUrl: values.coverPhotoUrl || undefined,
        jobPreferences: jobPreferencesToSave,
      });
      await refetchUserProfile();
      toast({ title: 'Profile Updated', description: 'Your profile information has been successfully updated.' });
    } catch (error: any) {
      toast({ title: 'Update Failed', description: error.message || 'Could not update profile.', variant: 'destructive' });
    } finally {
      setIsSubmittingProfile(false);
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

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onProfileSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>Update your profile avatar by providing an image URL.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={imagePreviewUrl || undefined} alt={currentUser.firstName || 'User'} data-ai-hint="user avatar large"/>
                  <AvatarFallback className="text-3xl">
                    {currentUser.firstName?.charAt(0)}
                    {currentUser.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <FormField
                control={form.control}
                name="profilePictureUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile Picture URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/your-image.png" {...field} disabled={isSubmittingProfile} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cover Photo</CardTitle>
              <CardDescription>Update your cover photo by providing an image URL.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative h-48 w-full bg-muted rounded-md overflow-hidden">
                {coverImagePreviewUrl ? (
                  <Image src={coverImagePreviewUrl} alt="Cover photo preview" layout="fill" objectFit="cover" data-ai-hint="profile cover background"/>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <span>No cover photo</span>
                  </div>
                )}
              </div>
              <FormField
                control={form.control}
                name="coverPhotoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Photo URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/your-cover-image.png" {...field} disabled={isSubmittingProfile} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
            </CardContent>
          </Card>

          <Card id="job-preferences">
            <CardHeader>
              <CardTitle className="flex items-center"><Briefcase className="mr-2 h-5 w-5 text-primary" /> Job Preferences</CardTitle>
              <CardDescription>Set your preferences for job alerts and recommendations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="jobPreferences.desiredTitles"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Desired Job Titles (comma-separated)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Software Engineer, Product Manager" {...field} disabled={isSubmittingProfile} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="jobPreferences.preferredLocations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Locations (comma-separated)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Remote, New York, San Francisco" {...field} disabled={isSubmittingProfile} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="jobPreferences.openToOpportunities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Open to Opportunities?</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value} disabled={isSubmittingProfile}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your openness to new opportunities" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="NotOpen">Not Open</SelectItem>
                          <SelectItem value="Open">Open to Opportunities</SelectItem>
                          <SelectItem value="ActivelyLooking">Actively Looking</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </CardContent>
          </Card>
          
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmittingProfile}>
              {isSubmittingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save All Changes
            </Button>
          </div>
        </form>
      </Form>


      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Manage your account details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <ShadCnLabel>Email Address</ShadCnLabel>
            <p className="text-sm text-muted-foreground">{currentUser.email}</p>
            <Button variant="link" className="p-0 h-auto text-sm" disabled>Change Email (coming soon)</Button>
          </div>
          <div>
            <ShadCnLabel>Password</ShadCnLabel>
            <Button variant="link" className="p-0 h-auto text-sm block" disabled>Change Password (coming soon)</Button>
          </div>
           <div>
             <ShadCnLabel>Admin Access</ShadCnLabel>
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
            <ShadCnLabel htmlFor="profile-visibility">Profile Visibility</ShadCnLabel>
             <p className="text-xs text-muted-foreground">Currently Public</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

