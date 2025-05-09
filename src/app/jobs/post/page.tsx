'use client';

import { useState, useEffect } from 'react'; // Added useEffect import
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { createJob } from '@/lib/job-service';
import type { Job } from '@/types';

const jobFormSchema = z.object({
  title: z.string().min(3, 'Job title must be at least 3 characters.').max(100),
  companyName: z.string().min(2, 'Company name is required.').max(100),
  location: z.string().min(2, 'Location is required.').max(100),
  employmentType: z.enum(["Full-time", "Part-time", "Contract", "Internship"]),
  description: z.string().min(50, 'Description must be at least 50 characters.').max(5000),
  companyLogoUrl: z.string().url("Must be a valid URL for company logo.").optional().or(z.literal('')),
  skillsRequired: z.string().optional().transform(val => val ? val.split(',').map(s => s.trim()).filter(s => s) : []),
});

type JobFormValues = z.infer<typeof jobFormSchema>;

export default function PostJobPage() {
  const { currentUser, loadingAuth } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: '',
      companyName: '',
      location: '',
      employmentType: "Full-time",
      description: '',
      companyLogoUrl: '',
      skillsRequired: [],
    },
  });

  useEffect(() => {
    if (!loadingAuth && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, loadingAuth, router]);

  const onSubmit: SubmitHandler<JobFormValues> = async (data) => {
    if (!currentUser) {
      toast({ title: "Authentication Error", description: "You must be logged in to post a job.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const newJobData: Omit<Job, 'id' | 'postedDate'> = {
        ...data,
        authorId: currentUser.uid,
        // companyLogoUrl can be undefined if not provided, or an empty string which is fine.
        // Firestore will not save undefined fields.
        companyLogoUrl: data.companyLogoUrl || undefined, 
      };
      const jobId = await createJob(newJobData);
      toast({ title: "Job Posted", description: "Your job listing is now live!" });
      router.push(`/jobs/${jobId}`); 
    } catch (error) {
      console.error("Error posting job:", error);
      toast({ title: "Error", description: "Failed to post job. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
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
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Post a New Job</CardTitle>
          <CardDescription>Fill in the details below to create a job listing.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="title">Job Title</Label>
              <Input id="title" {...form.register('title')} disabled={isSubmitting} />
              {form.formState.errors.title && <p className="text-sm text-destructive mt-1">{form.formState.errors.title.message}</p>}
            </div>

            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input id="companyName" {...form.register('companyName')} disabled={isSubmitting} />
              {form.formState.errors.companyName && <p className="text-sm text-destructive mt-1">{form.formState.errors.companyName.message}</p>}
            </div>
            
            <div>
              <Label htmlFor="companyLogoUrl">Company Logo URL (Optional)</Label>
              <Input id="companyLogoUrl" placeholder="https://example.com/logo.png" {...form.register('companyLogoUrl')} disabled={isSubmitting} />
              {form.formState.errors.companyLogoUrl && <p className="text-sm text-destructive mt-1">{form.formState.errors.companyLogoUrl.message}</p>}
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="e.g., San Francisco, CA or Remote" {...form.register('location')} disabled={isSubmitting} />
              {form.formState.errors.location && <p className="text-sm text-destructive mt-1">{form.formState.errors.location.message}</p>}
            </div>

            <div>
              <Label htmlFor="employmentType">Employment Type</Label>
              <Select 
                onValueChange={(value) => form.setValue('employmentType', value as JobFormValues["employmentType"])} 
                defaultValue={form.getValues('employmentType')}
                disabled={isSubmitting}
              >
                <SelectTrigger id="employmentType">
                  <SelectValue placeholder="Select employment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.employmentType && <p className="text-sm text-destructive mt-1">{form.formState.errors.employmentType.message}</p>}
            </div>

            <div>
              <Label htmlFor="description">Job Description</Label>
              <Textarea id="description" {...form.register('description')} rows={6} className="min-h-[150px]" disabled={isSubmitting} />
              {form.formState.errors.description && <p className="text-sm text-destructive mt-1">{form.formState.errors.description.message}</p>}
            </div>

            <div>
              <Label htmlFor="skillsRequired">Skills Required (comma-separated)</Label>
              <Input id="skillsRequired" placeholder="e.g., React, Node.js, SQL" {...form.register('skillsRequired')} disabled={isSubmitting} />
               {/* The transform in Zod schema handles array conversion, so direct error message for skillsRequired (as string) is fine if needed */}
              {form.formState.errors.skillsRequired && <p className="text-sm text-destructive mt-1">{form.formState.errors.skillsRequired.message}</p>}
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Post Job
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
