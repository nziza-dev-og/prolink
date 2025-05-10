
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Briefcase } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { getJobById } from '@/lib/job-service';
import { createApplication, checkIfUserApplied } from '@/lib/application-service';
import type { Job, JobApplication } from '@/types';
import { uploadFile } from '@/lib/storage-service'; 

const applicationFormSchema = z.object({
  applicantName: z.string().min(1, 'Name is required.'),
  applicantEmail: z.string().email('Invalid email address.'),
  resumeUrl: z.string().url('Valid resume URL is required (e.g., Google Drive, Dropbox link).').optional().or(z.literal('')),
  resumeFile: z.instanceof(File).optional(),
  coverLetter: z.string().min(50, 'Cover letter must be at least 50 characters.').max(5000),
}).refine(data => data.resumeUrl || data.resumeFile, {
    message: "Either a resume URL or a resume file is required.",
    path: ["resumeUrl"], // You can also use ["resumeFile"] or a more general path
});

type ApplicationFormValues = z.infer<typeof applicationFormSchema>;

export default function ApplyJobPage() {
  const params = useParams();
  const jobId = params.jobId as string;
  const { currentUser, loadingAuth } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [job, setJob] = useState<Job | null>(null);
  const [isLoadingJob, setIsLoadingJob] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [checkingAppliedStatus, setCheckingAppliedStatus] = useState(true);

  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      applicantName: '',
      applicantEmail: '',
      resumeUrl: '',
      coverLetter: '',
    },
  });

  useEffect(() => {
    if (!loadingAuth && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, loadingAuth, router]);

  useEffect(() => {
    async function fetchJobDetails() {
      if (jobId) {
        setIsLoadingJob(true);
        try {
          const jobData = await getJobById(jobId);
          setJob(jobData);
          if (!jobData) {
            toast({ title: "Job Not Found", description: "This job listing may have been removed.", variant: "destructive" });
            router.push('/jobs');
          }
        } catch (error) {
          toast({ title: "Error", description: "Could not load job details.", variant: "destructive" });
          router.push('/jobs');
        } finally {
          setIsLoadingJob(false);
        }
      }
    }
    fetchJobDetails();
  }, [jobId, router, toast]);

  useEffect(() => {
    if (currentUser && jobId) {
      setCheckingAppliedStatus(true);
      checkIfUserApplied(currentUser.uid, jobId)
        .then(applied => {
          setHasApplied(applied);
          if (applied) {
            toast({ title: "Already Applied", description: "You have already applied for this job.", variant: "default" });
          }
        })
        .catch(() => toast({ title: "Error", description: "Could not check application status.", variant: "destructive" }))
        .finally(() => setCheckingAppliedStatus(false));
    }
  }, [currentUser, jobId, toast]);

  useEffect(() => {
    if (currentUser) {
      form.setValue('applicantName', `${currentUser.firstName} ${currentUser.lastName}`);
      form.setValue('applicantEmail', currentUser.email);
    }
  }, [currentUser, form]);

  const onSubmit: SubmitHandler<ApplicationFormValues> = async (data) => {
    if (!currentUser || !job) {
      toast({ title: "Error", description: "Cannot submit application.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    
    let finalResumeUrl = data.resumeUrl || '';

    try {
      if (data.resumeFile) {
        const filePath = `resumes/${currentUser.uid}/${jobId}/${data.resumeFile.name}`;
        finalResumeUrl = await uploadFile(data.resumeFile, filePath);
      }

      if (!finalResumeUrl) {
        toast({ title: "Resume Required", description: "Please provide a resume URL or upload a file.", variant: "destructive" });
        setIsSubmitting(false);
        return;
      }

      const applicationPayload: Omit<JobApplication, 'id' | 'appliedDate' | 'status'> = {
        jobId: job.id,
        jobTitle: job.title,
        companyName: job.companyName,
        applicantId: currentUser.uid,
        applicantName: data.applicantName,
        applicantEmail: data.applicantEmail,
        resumeUrl: finalResumeUrl,
        coverLetter: data.coverLetter,
      };

      await createApplication(applicationPayload);
      toast({ title: "Application Submitted", description: `Your application for ${job.title} has been sent.` });
      setHasApplied(true); // Update UI to reflect application
      // Optionally redirect: router.push(`/jobs/${job.id}`); or to a confirmation page
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({ title: "Submission Failed", description: "Could not submit your application. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingAuth || isLoadingJob || checkingAppliedStatus) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-12rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!job) {
     return <div className="text-center py-10">Job details could not be loaded.</div>;
  }

  if (hasApplied && !isSubmitting) { // Don't show "Already applied" if currently submitting (to allow success toast)
    return (
        <div className="max-w-2xl mx-auto py-8 text-center">
            <Card>
                <CardHeader>
                    <CardTitle>Already Applied</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>You have already submitted an application for the position of <strong>{job.title}</strong> at <strong>{job.companyName}</strong>.</p>
                    <Button onClick={() => router.push(`/jobs/${jobId}`)} className="mt-4">Back to Job Details</Button>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <Briefcase className="mr-3 h-6 w-6 text-primary" /> Apply for {job.title}
          </CardTitle>
          <CardDescription>At {job.companyName} - {job.location}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="applicantName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl><Input {...field} readOnly disabled className="bg-muted/50" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="applicantEmail" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input {...field} type="email" readOnly disabled className="bg-muted/50" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="resumeUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel>Resume URL</FormLabel>
                  <FormControl><Input {...field} placeholder="https://linkedin.com/in/yourprofile or Google Drive link" disabled={isSubmitting || !!form.watch('resumeFile')} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

               <FormField control={form.control} name="resumeFile" render={({ field: { onChange, value, ...restField } }) => (
                 <FormItem>
                   <FormLabel>Or Upload Resume (PDF, DOC, DOCX)</FormLabel>
                   <FormControl>
                     <Input 
                        type="file" 
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                                onChange(e.target.files[0]);
                                form.setValue('resumeUrl', ''); // Clear URL if file is selected
                            }
                        }}
                        disabled={isSubmitting || !!form.watch('resumeUrl')}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                     />
                    </FormControl>
                   <FormMessage />
                 </FormItem>
               )} />


              <FormField control={form.control} name="coverLetter" render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Letter</FormLabel>
                  <FormControl><Textarea {...field} rows={8} placeholder="Tell us why you're a great fit for this role..." disabled={isSubmitting} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || hasApplied}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {hasApplied ? "Applied" : "Submit Application"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
```