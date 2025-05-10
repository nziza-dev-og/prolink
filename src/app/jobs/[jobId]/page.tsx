
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getJobById } from '@/lib/job-service';
import { getUserProfile } from '@/lib/user-service'; 
import type { Job, UserProfile } from "@/types";
import { Briefcase, CalendarDays, ExternalLink, Loader2, MapPin, User, CheckCircle } from "lucide-react";
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { checkIfUserApplied } from '@/lib/application-service';


export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.jobId as string;
  const router = useRouter();
  const { toast } = useToast();
  
  const { currentUser, loadingAuth } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [jobPoster, setJobPoster] = useState<UserProfile | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const [checkingAppliedStatus, setCheckingAppliedStatus] = useState(true);

  useEffect(() => {
    if (!loadingAuth && !currentUser) {
        router.push('/login');
    }
  }, [currentUser, loadingAuth, router]);
  
  useEffect(() => {
    async function fetchJobData() {
      if (jobId) {
        setIsLoadingData(true);
        try {
          const jobData = await getJobById(jobId);
          setJob(jobData);
          if (jobData?.authorId) {
            const posterData = await getUserProfile(jobData.authorId);
            setJobPoster(posterData);
          }
        } catch (error) {
          console.error("Failed to fetch job data:", error);
          toast({ title: "Error", description: "Could not load job details.", variant: "destructive" });
        } finally {
          setIsLoadingData(false);
        }
      }
    }
    if (!loadingAuth && currentUser) {
        fetchJobData();
    }
  }, [jobId, loadingAuth, currentUser, toast]);

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
                <Button asChild className="w-full sm:w-auto" disabled={hasApplied || currentUser?.uid === job.authorId}>
                  <Link href={`/jobs/${job.id}/apply`}>
                    {hasApplied ? <CheckCircle className="mr-2 h-4 w-4" /> : <ExternalLink className="mr-2 h-4 w-4" /> }
                    {hasApplied ? "Applied" : "Apply Now"}
                  </Link>
                </Button>
                <Button variant="outline" className="w-full sm:w-auto" disabled>
                    Save Job
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
                <AvatarImage src={jobPoster.profilePictureUrl} alt={jobPoster.firstName} data-ai-hint="user avatar" />
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
