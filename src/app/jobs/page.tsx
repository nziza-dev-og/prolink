
'use client';

import { useEffect, useState, useCallback }
from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAllJobs as fetchJobsFromService } from "@/lib/job-service";
import type { Job } from "@/types";
import { Bookmark, Briefcase, CheckCircle, ListFilter, Loader2, MapPin, Search, Settings2, DollarSign, Users, Clock, CalendarCheck, ExternalLink, Award, ClipboardList, Building, GraduationCap, Layers, Filter, SlidersHorizontal, BookmarkCheck } from "lucide-react";
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';
import { formatDistanceToNowStrict, format } from 'date-fns';

function JobCardNew({ job, currentUserSavedJobs }: { job: Job, currentUserSavedJobs?: string[] }) {
  const isSaved = currentUserSavedJobs?.includes(job.id) || false;

  const postedDate = job.postedDate ? new Date(job.postedDate as string) : null;
  let postedAgo = 'N/A';
  if (postedDate) {
    try {
      postedAgo = formatDistanceToNowStrict(postedDate, { addSuffix: true });
    } catch (e) {
      console.warn("Error formatting date:", e);
      postedAgo = format(postedDate, "PP"); // Fallback to simple date format
    }
  }
  
  // Placeholders for data not in current Job type
  const applicantsCount = job.applicationsCount || Math.floor(Math.random() * 100) + 1; // Mock
  const salaryRange = "USD $1200 - $4000"; // Mock
  const experienceYears = "1 - 3 years"; // Mock
  const companySize = "10 - 50 Employees"; // Mock
  const educationLevel = "Bachelor of Information..."; // Mock
  const validUntil = "Valid until May 12"; // Mock


  return (
    <Card className="hover:shadow-lg transition-shadow flex flex-col">
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            {job.companyLogoUrl ?
              <Image src={job.companyLogoUrl} alt={`${job.companyName} logo`} width={40} height={40} className="rounded-sm h-10 w-10 object-contain" data-ai-hint="company logo small" /> :
              <div className="h-10 w-10 bg-muted rounded-sm flex items-center justify-center"><Briefcase className="h-5 w-5 text-muted-foreground" /></div>
            }
            <div>
              <CardTitle className="text-md font-semibold">{job.title}</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">{job.companyName} <CheckCircle className="h-3 w-3 inline text-blue-500" /></CardDescription>
            </div>
          </div>
          <div className="flex space-x-1">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" disabled title={isSaved ? "Job Saved" : "Save Job (disabled)"}>
              {isSaved ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" asChild>
              <Link href={`/jobs/${job.id}`} target="_blank"><ExternalLink className="h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-2 text-xs text-muted-foreground flex-grow">
        <div className="flex items-center"><Users className="h-3.5 w-3.5 mr-1.5 text-green-500" /> <span className="font-medium text-green-600">{applicantsCount} Applicants</span></div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
          <div className="flex items-center"><MapPin className="h-3.5 w-3.5 mr-1.5" /> {job.location}</div>
          <div className="flex items-center"><Briefcase className="h-3.5 w-3.5 mr-1.5" /> {job.employmentType}</div>
          <div className="flex items-center"><DollarSign className="h-3.5 w-3.5 mr-1.5" /> {salaryRange}</div>
          <div className="flex items-center"><Clock className="h-3.5 w-3.5 mr-1.5" /> {experienceYears}</div>
          <div className="flex items-center"><Building className="h-3.5 w-3.5 mr-1.5" /> {companySize}</div>
          <div className="flex items-center"><GraduationCap className="h-3.5 w-3.5 mr-1.5" /> {educationLevel}</div>
          <div className="flex items-center"><Clock className="h-3.5 w-3.5 mr-1.5" /> Posted {postedAgo}</div>
          <div className="flex items-center"><CalendarCheck className="h-3.5 w-3.5 mr-1.5" /> {validUntil}</div>
        </div>
      </CardContent>
      <CardFooter className="p-4 flex space-x-2">
        <Button className="flex-1 bg-gray-800 hover:bg-gray-900 text-white dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-gray-300" asChild>
          <Link href={`/jobs/${job.id}/apply`}>Apply for this job</Link>
        </Button>
        <Button variant="outline" className="flex-1" asChild>
          <Link href={`/jobs/${job.id}`}>See more details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

const popularSearches = ["Developers", "Data mining", "Product designer"];
const ALL_LOCATIONS_VALUE = "all_locations";
const ALL_JOB_TYPES_VALUE = "All";
const ALL_INDUSTRIES_VALUE = "All";
const ANY_EXPERIENCE_VALUE = "any";


export default function JobsPage() {
  const { currentUser, loadingAuth } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [locationSearch, setLocationSearch] = useState(ALL_LOCATIONS_VALUE);
  const [jobTypeFilter, setJobTypeFilter] = useState(ALL_JOB_TYPES_VALUE);
  const [industryFilter, setIndustryFilter] = useState('Technology'); // Default to Technology
  const [experienceFilter, setExperienceFilter] = useState(ANY_EXPERIENCE_VALUE);
  const [sortBy, setSortBy] = useState('Newest');

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

    if (locationSearch.trim() && locationSearch !== ALL_LOCATIONS_VALUE) {
      const lowerLocationSearch = locationSearch.toLowerCase();
      tempJobs = tempJobs.filter(job =>
        job.location.toLowerCase().includes(lowerLocationSearch)
      );
    }
    
    if (jobTypeFilter !== ALL_JOB_TYPES_VALUE) {
        tempJobs = tempJobs.filter(job => job.employmentType === jobTypeFilter);
    }

    // Placeholder for industry and experience filtering as data is not available in Job type
    // For industry, we'll assume it's a direct match if the filter isn't "All".
    // This would need a proper 'industry' field in the Job type and data.
    if (industryFilter !== ALL_INDUSTRIES_VALUE) {
       // tempJobs = tempJobs.filter(job => job.industry?.toLowerCase() === industryFilter.toLowerCase()); // Example
    }
    
    // Placeholder for experience filtering
    if (experienceFilter !== ANY_EXPERIENCE_VALUE) {
        // Example: map experienceFilter value ("0-1years") to a range and filter
        // tempJobs = tempJobs.filter(job => checkExperienceMatch(job, experienceFilter));
    }


    // Sorting
    if (sortBy === 'Newest') {
        tempJobs.sort((a, b) => new Date(b.postedDate as string).getTime() - new Date(a.postedDate as string).getTime());
    } else if (sortBy === 'Relevant') {
        // Placeholder for relevance sorting, could be based on match score with search/filters
    } else if (sortBy === 'SalaryHigh') {
        // Placeholder: tempJobs.sort((a,b) => (b.salaryMax || 0) - (a.salaryMin || 0));
    } else if (sortBy === 'SalaryLow') {
        // Placeholder: tempJobs.sort((a,b) => (a.salaryMin || Infinity) - (b.salaryMax || Infinity));
    }


    setFilteredJobs(tempJobs);
  }, [jobs, searchTerm, locationSearch, jobTypeFilter, industryFilter, experienceFilter, sortBy]);


  if (loadingAuth || (!currentUser && !loadingAuth)) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-12rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  if (!currentUser) return null;

  return (
    <div className="space-y-8 py-6">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-12 px-6 rounded-lg shadow-lg text-center">
        <h1 className="text-4xl font-bold mb-3">Empowering Your Career Growth</h1>
        <p className="text-lg text-purple-100 max-w-2xl mx-auto">Explore job listings, track applications, and advance your professional journey.</p>
      </section>

      {/* Search and Filter Section */}
      <section className="bg-card p-4 sm:p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div className="relative col-span-1 md:col-span-2 lg:col-span-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                type="search"
                placeholder="Search by title, skill, or company..."
                className="pl-10 h-11 text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
            <div>
                <Select value={locationSearch} onValueChange={setLocationSearch}>
                    <SelectTrigger className="h-10 text-sm">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground"/>
                        Location: {locationSearch === ALL_LOCATIONS_VALUE ? 'All' : locationSearch}
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ALL_LOCATIONS_VALUE}>All</SelectItem>
                        <SelectItem value="USA">USA</SelectItem>
                        <SelectItem value="Remote">Remote</SelectItem>
                        <SelectItem value="New York, NY">New York, NY</SelectItem>
                        <SelectItem value="San Francisco, CA">San Francisco, CA</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <div>
                <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
                    <SelectTrigger className="h-10 text-sm"><Briefcase className="h-4 w-4 mr-2 text-muted-foreground"/>Job Type: {jobTypeFilter}</SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ALL_JOB_TYPES_VALUE}>All Types</SelectItem>
                        <SelectItem value="Full-time">Full-time</SelectItem>
                        <SelectItem value="Part-time">Part-time</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                        <SelectItem value="Internship">Internship</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <div>
                <Select value={industryFilter} onValueChange={setIndustryFilter}>
                    <SelectTrigger className="h-10 text-sm"><Layers className="h-4 w-4 mr-2 text-muted-foreground"/>Industry: {industryFilter === ALL_INDUSTRIES_VALUE ? 'All' : industryFilter}</SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ALL_INDUSTRIES_VALUE}>All Industries</SelectItem>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                         {/* Add more industries */}
                    </SelectContent>
                </Select>
            </div>
             <div>
                <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                    <SelectTrigger className="h-10 text-sm"><Award className="h-4 w-4 mr-2 text-muted-foreground"/>Experience: {experienceFilter === ANY_EXPERIENCE_VALUE ? 'Any' : experienceFilter.replace('-', ' ')}</SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ANY_EXPERIENCE_VALUE}>Any</SelectItem>
                        <SelectItem value="0-1years">0-1 years</SelectItem>
                        <SelectItem value="1-2years">1-2 years</SelectItem>
                        <SelectItem value="3-5years">3-5 years</SelectItem>
                        <SelectItem value="5+years">5+ years</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <div>
                <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="h-10 text-sm"><Filter className="h-4 w-4 mr-2 text-muted-foreground"/>Sort by: {sortBy}</SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Newest">Newest</SelectItem>
                        <SelectItem value="Relevant">Relevant</SelectItem>
                        <SelectItem value="SalaryHigh">Salary (High-Low)</SelectItem>
                         <SelectItem value="SalaryLow">Salary (Low-High)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Popular search:</span>
                {popularSearches.map(tag => (
                    <Button key={tag} variant="ghost" size="sm" className="px-2 py-1 h-auto text-primary hover:bg-primary/10" onClick={() => setSearchTerm(tag)}>
                    {tag}
                    </Button>
                ))}
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
                 <Button variant="outline" className="w-full sm:w-auto h-10"><SlidersHorizontal className="h-4 w-4 mr-2"/>More option</Button>
                 <Button className="w-full sm:w-auto h-10 bg-primary hover:bg-primary/90">Search</Button>
            </div>
        </div>
      </section>

      {/* Job Listings Section */}
      <section>
        {isLoadingJobs ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : filteredJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredJobs.map((job) => (
              <JobCardNew key={job.id} job={job} currentUserSavedJobs={currentUser.savedJobs} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-10 text-center">
              <p className="text-muted-foreground">No jobs found matching your criteria. Try broadening your search!</p>
            </CardContent>
          </Card>
        )}
         {/* Load more functionality can be added later */}
         {!isLoadingJobs && filteredJobs.length > 0 && jobs.length > filteredJobs.length && (
          <div className="text-center mt-8">
            <Button variant="outline" disabled>Load more jobs</Button>
          </div>
        )}
      </section>
    </div>
  );
}
