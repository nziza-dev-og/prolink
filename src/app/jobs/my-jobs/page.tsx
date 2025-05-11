
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getApplicationsByUserId } from '@/lib/application-service';
import { getJobsByIds, getJobById } from '@/lib/job-service'; // Assuming getJobsByIds exists or create it
import type { Job, JobApplication } from "@/types";
import { Briefcase, CalendarDays, CheckCircle, ExternalLink, Loader2, MapPin, PackageOpen } from "lucide-react";
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

function AppliedJobCard({ application }: { application: JobApplication }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{application.jobTitle}</CardTitle>
        <CardDescription>{application.companyName}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Applied on: {format(new Date(application.appliedDate as string), "PPP")}
        </p>
        <p className="text-sm capitalize">Status: <span className="font-medium">{application.status}</span></p>
      </CardContent>
      <CardFooter>
        <Button size="sm" asChild variant="outline">
          <Link href={`/jobs/${application.jobId}`}>View Job Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function SavedJobCard({ job }: { job: Job }) {
   return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row space-x-4 items-start p-4">
        {job.companyLogoUrl ? 
          <Image src={job.companyLogoUrl} alt={`${job.companyName} logo`} width={48} height={48} className="rounded-sm h-12 w-12 object-contain" data-ai-hint="company logo small"/> :
          <div className="h-12 w-12 bg-muted rounded-sm flex items-center justify-center"><Briefcase className="h-6 w-6 text-muted-foreground"/></div>
        }
        <div className="flex-grow">
          <Link href={`/jobs/${job.id}`} className="hover:underline">
            <CardTitle className="text-lg">{job.title}</CardTitle>
          </Link>
          <CardDescription className="text-sm">
            {job.companyName} <span className="mx-1">•</span> {job.location} <span className="mx-1">•</span> {job.employmentType}
          </CardDescription>
          <p className="text-xs text-muted-foreground mt-1">Posted {new Date(job.postedDate as string).toLocaleDateString()}</p>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <p className="text-sm line-clamp-3 mb-2">{job.description}</p>
      </CardContent>
      <CardFooter className="px-4 pb-4">
        <Button className="w-full sm:w-auto" asChild>
          <Link href={`/jobs/${job.id}`}>View Job</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}


export default function MyJobsPage() {
  const { currentUser, loadingAuth } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [appliedJobs, setAppliedJobs] = useState<JobApplication[]>([]);
  const [savedJobsDetails, setSavedJobsDetails] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loadingAuth && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, loadingAuth, router]);

  useEffect(() => {
    async function loadMyJobsData() {
      if (currentUser) {
        setIsLoading(true);
        try {
          // Fetch applied jobs
          const applications = await getApplicationsByUserId(currentUser.uid);
          setAppliedJobs(applications);

          // Fetch saved jobs
          if (currentUser.savedJobs && currentUser.savedJobs.length > 0) {
            const fetchedSavedJobs = await getJobsByIds(currentUser.savedJobs);
            setSavedJobsDetails(fetchedSavedJobs);
          } else {
            setSavedJobsDetails([]);
          }

        } catch (error) {
          console.error("Error fetching my jobs data:", error);
          toast({ title: "Error", description: "Could not load your job activity.", variant: "destructive" });
        } finally {
          setIsLoading(false);
        }
      }
    }
    if (!loadingAuth && currentUser) {
      loadMyJobsData();
    }
  }, [currentUser, loadingAuth, toast]);

  if (loadingAuth || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-12rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!currentUser) return null;

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">My Jobs</h1>
      <Tabs defaultValue="applied" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-1/2">
          <TabsTrigger value="applied">Applied Jobs ({appliedJobs.length})</TabsTrigger>
          <TabsTrigger value="saved">Saved Jobs ({savedJobsDetails.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="applied">
          {appliedJobs.length === 0 ? (
            <Card className="mt-4">
              <CardContent className="p-10 text-center text-muted-foreground">
                <PackageOpen className="h-12 w-12 mx-auto mb-4 text-primary" data-ai-hint="empty state box"/>
                You haven&apos;t applied to any jobs yet.
                <Button asChild className="mt-4 block mx-auto w-fit">
                    <Link href="/jobs">Find Jobs</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {appliedJobs.map((app) => (
                <AppliedJobCard key={app.id} application={app} />
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="saved">
           {savedJobsDetails.length === 0 ? (
             <Card className="mt-4">
               <CardContent className="p-10 text-center text-muted-foreground">
                 <PackageOpen className="h-12 w-12 mx-auto mb-4 text-primary" data-ai-hint="empty state box"/>
                 You haven&apos;t saved any jobs yet.
                  <Button asChild className="mt-4 block mx-auto w-fit">
                    <Link href="/jobs">Find Jobs</Link>
                  </Button>
               </CardContent>
             </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {savedJobsDetails.map((job) => (
                <SavedJobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
