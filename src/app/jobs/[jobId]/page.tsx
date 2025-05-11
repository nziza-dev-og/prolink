
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getJobById, addUserIdToJobSavedBy, removeUserIdFromJobSavedBy } from '@/lib/job-service';
import { getUserProfile, saveJobToProfile, unsaveJobFromProfile } from '@/lib/user-service'; 
import type { Job, UserProfile } from "@/types";
import { Briefcase, CalendarDays, ExternalLink, Loader2, MapPin, User, CheckCircle, Bookmark, BookmarkCheck, ListChecks, Info } from "lucide-react"; // Added ListChecks, Info
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { checkIfUserApplied } from '@/lib/application-service';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.jobId as string;
  const router = useRouter();
  const { toast } = useToast();
  
  const { currentUser, loadingAuth, refetchUserProfile } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [jobPoster, setJobPoster] = useState<UserProfile | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const [checkingAppliedStatus, setCheckingAppliedStatus] = useState(true);
  const [isJobSaved, setIsJobSaved] = useState(false);
  const [isProcessingSave, setIsProcessingSave] = useState(false);

  useEffect(() => {
    if (!loadingAuth && !currentUser) {
        router.push('/login');
    }
  }, [currentUser, loadingAuth, router]);
  
  const fetchJobDetails = useCallback(async () => {
    if (jobId) {
      setIsLoadingData(true);
      try {
        const jobData = await getJobById(jobId);
        setJob(jobData);
        if (jobData?.authorId) {
          const posterData = await getUserProfile(jobData.authorId);
          setJobPoster(posterData);
        }
        if (currentUser && jobData) {
          setIsJobSaved(Array.isArray(currentUser.savedJobs) && currentUser.savedJobs.includes(jobData.id));
        }
      } catch (error) {
        console.error("Failed to fetch job data:", error);
        toast({ title: "Error", description: "Could not load job details.", variant: "destructive" });
      } finally {
        setIsLoadingData(false);
      }
    }
  }, [jobId, currentUser, toast]);

  useEffect(() => {
    if (!loadingAuth) {
      fetchJobDetails();
    }
  }, [loadingAuth, fetchJobDetails]);

  useEffect(() => {
    if (currentUser && jobId && !loadingAuth) {
      setCheckingAppliedStatus(true);
      checkIfUserApplied(currentUser.uid, jobId)
        .then(applied => {
          setHasApplied(applied);
        })
        .catch(() => { /* silently fail or show subtle error */ })
        .finally(() => setCheckingAppliedStatus(false));
    }
  }, [currentUser, jobId, loadingAuth]);

  useEffect(() => {
    if (currentUser && job) {
        setIsJobSaved(Array.isArray(currentUser.savedJobs) && currentUser.savedJobs.includes(job.id));
    }
  }, [currentUser, job, currentUser?.savedJobs]);

  const handleSaveToggle = async () => {
    if (!currentUser || !job) {
      toast({ title: "Action Failed", description: "Please login to save jobs.", variant: "destructive"});
      return;
    }
    setIsProcessingSave(true);
    try {
      if (isJobSaved) {
        await unsaveJobFromProfile(currentUser.uid, job.id);
        await removeUserIdFromJobSavedBy(job.id, currentUser.uid); 
        toast({ title: "Job Unsaved", description: `${job.title} removed from your saved jobs.` });
        setIsJobSaved(false);
        setJob(prevJob => prevJob ? ({ ...prevJob, savedBy: prevJob.savedBy?.filter(uid => uid !== currentUser.uid) }) : null);

      } else {
        await saveJobToProfile(currentUser.uid, job.id);
        await addUserIdToJobSavedBy(job.id, currentUser.uid); 
        toast({ title: "Job Saved!", description: `${job.title} added to your saved jobs.` });
        setIsJobSaved(true);
        setJob(prevJob => prevJob ? ({ ...prevJob, savedBy: [...(prevJob.savedBy || []), currentUser.uid] }) : null);
      }
      await refetchUserProfile(); 
    } catch (error) {
      console.error("Error toggling save job:", error);
      toast({ title: "Error", description: "Could not update save status.", variant: "destructive" });
    } finally {
      setIsProcessingSave(false);
    }
  };

  if (loadingAuth || isLoadingData || checkingAppliedStatus) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-12rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!job) {
    return <div className="text-center py-10">Job not found. It might have been removed or the link is incorrect.</div>;
  }

  const isJobPoster = currentUser?.uid === job.authorId;

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start">
            <div>
                <CardTitle className="text-3xl mb-1">{job.title}</CardTitle>
                <CardDescription className="text-md">
                    <Link href={`/company/${job.companyName}`} className="hover:underline text-primary">{job.companyName}</Link>
                    <span className="mx-1.5">•</span>{job.location}
                    <span className="mx-1.5">•</span>{job.employmentType}
                </CardDescription>
            </div>
            {job.companyLogoUrl && (
                 <Image src={job.companyLogoUrl} alt={`${job.companyName} logo`} width={64} height={64} className="rounded-md object-contain mt-2 sm:mt-0" data-ai-hint="company logo medium"/>
            )}
          </div>
           <p className="text-sm text-muted-foreground pt-2">
            <CalendarDays className="inline h-4 w-4 mr-1.5 relative -top-px" />
            Posted on {new Date(job.postedDate as string).toLocaleDateString()}
          </p>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col sm:flex-row gap-2 mb-6">
                <Button 
                  asChild 
                  className="w-full sm:w-auto" 
                  disabled={hasApplied || isJobPoster}
                  title={isJobPoster ? "You cannot apply to your own job posting." : (hasApplied ? "You have already applied." : "Apply for this job")}
                >
                  <Link href={`/jobs/${job.id}/apply`}>
                    {hasApplied ? <CheckCircle className="mr-2 h-4 w-4" /> : <ExternalLink className="mr-2 h-4 w-4" /> }
                    {hasApplied ? "Applied" : "Apply Now"}
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto" 
                  onClick={handleSaveToggle}
                  disabled={isProcessingSave || isJobPoster}
                  title={isJobPoster ? "You cannot save your own job posting." : (isJobSaved ? "Unsave this job" : "Save this job")}
                >
                  {isProcessingSave ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 
                   isJobSaved ? <BookmarkCheck className="mr-2 h-4 w-4 text-primary" /> : <Bookmark className="mr-2 h-4 w-4" />
                  }
                  {isJobSaved ? "Saved" : "Save Job"}
                </Button>
            </div>

          <Separator className="my-6" />

          <h3 className="text-xl font-semibold mb-3">Job Description</h3>
          <div className="prose prose-sm max-w-none text-foreground whitespace-pre-line">
            {job.description}
          </div>

          {job.skillsRequired && job.skillsRequired.length > 0 && (
            <>
              <Separator className="my-6" />
              <h3 className="text-xl font-semibold mb-3">Skills Required</h3>
              <div className="flex flex-wrap gap-2">
                {job.skillsRequired.map(skill => (
                  <span key={skill} className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </>
          )}

          {(job.assessmentId || job.addAssessmentLater) && (
             <>
              <Separator className="my-6" />
              <h3 className="text-xl font-semibold mb-3">Skill Assessment</h3>
              {job.assessmentId ? (
                <Alert>
                    <ListChecks className="h-4 w-4" />
                    <AlertTitle>Assessment Linked</AlertTitle>
                    <AlertDescription>
                        This job has an associated skill assessment. Assessment ID: <strong>{job.assessmentId}</strong>. 
                        {/* Future: You might be prompted to take it during application. */}
                        <Button variant="link" className="p-0 h-auto ml-2" asChild disabled>
                          <Link href={`/jobs/skill-assessments/view/${job.assessmentId}`}>View Assessment Details (Coming Soon)</Link>
                        </Button>
                    </AlertDescription>
                </Alert>
              ) : job.addAssessmentLater ? (
                <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300">
                    <Info className="h-4 w-4 !text-blue-700 dark:!text-blue-300" />
                    <AlertTitle>Assessment Information</AlertTitle>
                    <AlertDescription>
                        The poster plans to add a skill assessment for this job soon.
                    </AlertDescription>
                </Alert>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      {jobPoster && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">About the Poster</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center space-x-4">
            <Link href={`/profile/${jobPoster.uid}`}>
                <Avatar className="h-16 w-16">
                <AvatarImage src={jobPoster.profilePictureUrl} alt={jobPoster.firstName || ''} data-ai-hint="user avatar"/>
                <AvatarFallback>{jobPoster.firstName?.charAt(0)}{jobPoster.lastName?.charAt(0)}</AvatarFallback>
                </Avatar>
            </Link>
            <div>
              <Link href={`/profile/${jobPoster.uid}`} className="text-md font-semibold hover:underline">
                {jobPoster.firstName} {jobPoster.lastName}
              </Link>
              <p className="text-sm text-muted-foreground">{jobPoster.headline}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
