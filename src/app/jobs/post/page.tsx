'use client';

import { useState, useEffect } from 'react'; 
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
import { Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { createJob } from '@/lib/job-service';
import type { Job } from '@/types';
import { FormField, FormItem, FormControl, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const jobFormSchema = z.object({
  title: z.string().min(3, 'Job title must be at least 3 characters.').max(100),
  companyName: z.string().min(2, 'Company name is required.').max(100),
  location: z.string().min(2, 'Location is required.').max(100),
  employmentType: z.enum(["Full-time", "Part-time", "Contract", "Internship"]),
  description: z.string().min(50, 'Description must be at least 50 characters.').max(5000),
  companyLogoUrl: z.string().url("Must be a valid URL for company logo.").optional().or(z.literal('')),
  skillsRequired: z.string().optional().transform(val => val ? val.split(',').map(s => s.trim()).filter(s => s) : []),
  assessmentId: z.string().optional().or(z.literal('')),
  addAssessmentLater: z.boolean().default(false),
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
      assessmentId: '',
      addAssessmentLater: false,
    },
  });

  const addAssessmentLaterValue = form.watch('addAssessmentLater');

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
        companyLogoUrl: data.companyLogoUrl || undefined, 
        assessmentId: data.addAssessmentLater ? undefined : (data.assessmentId || undefined), // Clear assessmentId if addAssessmentLater is true
        addAssessmentLater: data.addAssessmentLater,
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
              {form.formState.errors.skillsRequired && <p className="text-sm text-destructive mt-1">{form.formState.errors.skillsRequired.message}</p>}
            </div>

            <Card className="bg-muted/30">
              <CardHeader>
                  <CardTitle className="text-lg">Skill Assessment (Optional)</CardTitle>
                  <CardDescription>You can link an existing skill assessment or add one later.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="assessmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assessment ID</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Enter assessment ID (e.g., python_fundamentals)" 
                          disabled={isSubmitting || addAssessmentLaterValue} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="addAssessmentLater"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            if (checked) {
                              form.setValue('assessmentId', ''); // Clear assessmentId if checkbox is checked
                            }
                          }}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        I will add/create an assessment for this job later.
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <Alert variant="default" className="bg-background">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="text-sm">Note</AlertTitle>
                  <AlertDescription className="text-xs">
                    Currently, you need to manually provide an Assessment ID. A feature to select from existing assessments is planned.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>


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
