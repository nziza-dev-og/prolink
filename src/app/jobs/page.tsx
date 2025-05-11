
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAllJobs as fetchJobsFromService } from "@/lib/job-service"; 
import type { Job } from "@/types";
import { Bookmark, Briefcase, CheckCircle, ListFilter, Loader2, MapPin, Search, Settings2, StickyNote, BookmarkCheck, X } from "lucide-react";
import { useAuth } from '@/context/auth-context';

function JobCard({ job, currentUserSavedJobs }: { job: Job, currentUserSavedJobs?: string[] }) {
  const isSaved = currentUserSavedJobs?.includes(job.id) || false;
  
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row space-x-4 items-start p-4">
        {job.companyLogoUrl ? 
          <Image src={job.companyLogoUrl} alt={`${job.companyName} logo`} width={48} height={48} className="rounded-sm h-12 w-12 object-contain" data-ai-hint="company logo small" /> :
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
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" disabled title={isSaved ? "Job Saved" : "Save Job (disabled on list view)"}> 
          {isSaved ? <BookmarkCheck className="h-5 w-5 text-primary" /> : <Bookmark className="h-5 w-5" />}
        </Button>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <p className="text-sm line-clamp-3 mb-2">{job.description}</p>
        {job.skillsRequired && job.skillsRequired.length > 0 && (
           <div className="text-xs text-muted-foreground flex items-center">
            <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
            Skills: {job.skillsRequired.join(', ')}
           </div>
        )}
      </CardContent>
      <CardFooter className="px-4 pb-4">
        <Button className="w-full sm:w-auto" asChild>
          <Link href={`/jobs/${job.id}`}>View Job</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function JobsPage() {
  const { currentUser, loadingAuth } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [datePostedFilter, setDatePostedFilter] = useState('any');
  const [experienceLevelFilter, setExperienceLevelFilter] = useState('any');

  useEffect(() => {
    if (!loadingAuth && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, loadingAuth, router]);

  useEffect(() => {
    async function loadJobs() {
      if (currentUser) { 
        setIsLoadingJobs(true);
        try {
          const jobsData = await fetchJobsFromService();
          setJobs(jobsData);
          setFilteredJobs(jobsData); // Initialize filteredJobs with all jobs
        } catch (error) {
          console.error("Error fetching jobs:", error);
        } finally {
          setIsLoadingJobs(false);
        }
      }
    }
    if (!loadingAuth && currentUser) {
        loadJobs();
    }
  }, [currentUser, loadingAuth]);

  useEffect(() => {
    let tempJobs = [...jobs];

    if (searchTerm.trim()) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        tempJobs = tempJobs.filter(job =>
            job.title.toLowerCase().includes(lowerSearchTerm) ||
            job.companyName.toLowerCase().includes(lowerSearchTerm) ||
            (job.skillsRequired && job.skillsRequired.some(skill => skill.toLowerCase().includes(lowerSearchTerm))) ||
            job.description.toLowerCase().includes(lowerSearchTerm)
        );
    }

    if (locationSearch.trim()) {
        const lowerLocationSearch = locationSearch.toLowerCase();
        tempJobs = tempJobs.filter(job =>
            job.location.toLowerCase().includes(lowerLocationSearch)
        );
    }

    if (datePostedFilter !== 'any') {
        const now = new Date();
        let dateThreshold = new Date(now); // Create a new Date object to avoid modifying 'now'

        switch (datePostedFilter) {
            case 'past_24h':
                dateThreshold.setDate(now.getDate() - 1);
                break;
            case 'past_week':
                dateThreshold.setDate(now.getDate() - 7);
                break;
            case 'past_month':
                dateThreshold.setDate(now.getDate() - 30);
                break;
        }
        tempJobs = tempJobs.filter(job => {
            const postedDate = new Date(job.postedDate as string);
            return postedDate >= dateThreshold;
        });
    }
    
    // Note: Experience level filtering is not implemented as `Job` type doesn't have `experienceLevel`.
    // if (experienceLevelFilter !== 'any' && job.experienceLevel) { // Example
    //    tempJobs = tempJobs.filter(job => job.experienceLevel === experienceLevelFilter);
    // }

    setFilteredJobs(tempJobs);
  }, [jobs, searchTerm, locationSearch, datePostedFilter, experienceLevelFilter]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setLocationSearch('');
    setDatePostedFilter('any');
    setExperienceLevelFilter('any');
  };

  if (loadingAuth || (!currentUser && !loadingAuth)) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-12rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  if (!currentUser) return null;

  const hasActiveFilters = searchTerm.trim() || locationSearch.trim() || datePostedFilter !== 'any' || experienceLevelFilter !== 'any';

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
      <aside className="md:col-span-1 space-y-4 md:sticky top-20 order-1 md:order-none">
        <Card>
          <CardContent className="p-4 space-y-2">
            <Button variant="ghost" className="w-full justify-start text-md font-normal" disabled>
              <Bookmark className="mr-3 h-5 w-5 text-muted-foreground" /> My jobs
            </Button>
            <Button variant="ghost" className="w-full justify-start text-md font-normal" disabled>
              <StickyNote className="mr-3 h-5 w-5 text-muted-foreground" /> Preferences
            </Button>
            <Button variant="ghost" className="w-full justify-start text-md font-normal" disabled>
              <CheckCircle className="mr-3 h-5 w-5 text-muted-foreground" /> Skill assessments
            </Button>
             <Button variant="ghost" className="w-full justify-start text-md font-normal" disabled>
              <Settings2 className="mr-3 h-5 w-5 text-muted-foreground" /> Interview prep
            </Button>
          </CardContent>
        </Card>
        <Button className="w-full" asChild>
          <Link href="/jobs/post">Post a free job</Link>
        </Button>
      </aside>

      <section className="md:col-span-3 space-y-6 order-2 md:order-none">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-grow">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="search" 
                  placeholder="Search by title, skill, or company" 
                  className="pl-8" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative flex-grow">
                <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="search" 
                  placeholder="City, state, or zip code" 
                  className="pl-8" 
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                />
              </div>
              {/* The Search button is less critical now with reactive filtering, but kept for UI consistency.
                  It doesn't need an onClick if filtering is purely reactive.
              */}
              <Button className="w-full sm:w-auto">Search</Button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" disabled><ListFilter className="mr-2 h-4 w-4" />All Filters</Button>
                <Select value={datePostedFilter} onValueChange={setDatePostedFilter}>
                    <SelectTrigger className="w-auto h-9 text-sm">
                        <SelectValue placeholder="Date Posted" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="any">Any time</SelectItem>
                        <SelectItem value="past_24h">Past 24 hours</SelectItem>
                        <SelectItem value="past_week">Past week</SelectItem>
                        <SelectItem value="past_month">Past month</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={experienceLevelFilter} onValueChange={setExperienceLevelFilter}>
                    <SelectTrigger className="w-auto h-9 text-sm">
                        <SelectValue placeholder="Experience Level" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="any">Any level</SelectItem>
                        <SelectItem value="entry">Entry Level</SelectItem>
                        <SelectItem value="mid">Mid Level</SelectItem>
                        <SelectItem value="senior">Senior Level</SelectItem>
                    </SelectContent>
                </Select>
                 <Button 
                    variant="outline" 
                    size="sm" 
                    className={hasActiveFilters ? "text-primary border-primary hover:bg-primary/10" : ""}
                    onClick={handleClearFilters}
                    disabled={!hasActiveFilters}
                 >
                    <X className="mr-2 h-4 w-4" />Clear Filters
                </Button>
            </div>
          </CardContent>
        </Card>

        {isLoadingJobs ? (
            <div className="flex justify-center items-center py-10">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        ) : (
          <div>
            <div className="flex justify-between items-baseline mb-4">
              <h2 className="text-xl font-semibold">Job Listings</h2>
              {hasActiveFilters && <p className="text-sm text-muted-foreground">{filteredJobs.length} result(s)</p>}
            </div>
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <JobCard key={job.id} job={job} currentUserSavedJobs={currentUser.savedJobs} />
              ))}
            </div>
          </div>
        )}
        
        {!isLoadingJobs && filteredJobs.length === 0 && (
          <Card>
            <CardContent className="p-10 text-center">
              <p className="text-muted-foreground">
                {hasActiveFilters ? "No jobs match your current filters." : "No jobs found."}
              </p>
              {hasActiveFilters && <Button variant="link" onClick={handleClearFilters} className="mt-2">Clear filters</Button>}
            </CardContent>
          </Card>
        )}

        {/* Load more functionality can be added later */}
        {/* {!isLoadingJobs && filteredJobs.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline" disabled>Load more jobs</Button>
          </div>
        )} */}
      </section>
    </div>
  );
}
