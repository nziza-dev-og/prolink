
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { getAllEvents as fetchEventsFromService } from "@/lib/event-service"; 
import type { Event as EventType } from "@/types";
import { Loader2, PlusCircle } from "lucide-react";
import { useAuth } from '@/context/auth-context';
import EventSidebar from '@/components/events/event-sidebar';
import EventDisplayArea from '@/components/events/event-display-area';
import Link from 'next/link';

export interface ScheduleFilter {
  id: string;
  label: string;
  checked: boolean;
}

export interface CategoryFilter {
  id: string;
  label: string;
  color: string; // e.g., 'bg-red-500'
  checked: boolean;
  count?: number; // Optional: for displaying count next to category
}

export default function EventsPage() {
  const { currentUser, loadingAuth } = useAuth();
  const router = useRouter();
  
  const [allEvents, setAllEvents] = useState<EventType[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventType[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentView, setCurrentView] = useState<'month' | 'week' | 'day'>('week');
  const [displayedMonth, setDisplayedMonth] = useState<Date>(new Date());

  const initialScheduleFilters: ScheduleFilter[] = [
    { id: 'daily_standup', label: 'Daily Standup', checked: false },
    { id: 'weekly_review', label: 'Weekly Review', checked: false },
    { id: 'team_meeting', label: 'Team Meeting', checked: false },
    { id: 'lunch_break', label: 'Lunch Break', checked: false },
    { id: 'client_meeting', label: 'Client Meeting', checked: false },
    { id: 'other_schedule', label: 'Other', checked: false },
  ];
  const [scheduleFilters, setScheduleFilters] = useState<ScheduleFilter[]>(initialScheduleFilters);

  const initialCategoryFilters: CategoryFilter[] = [
    { id: 'work', label: 'Work', color: 'bg-blue-500', checked: true, count: 0 },
    { id: 'personal', label: 'Personal', color: 'bg-green-500', checked: true, count: 0 },
    { id: 'teams', label: 'Teams', color: 'bg-purple-500', checked: true, count: 0 },
    { id: 'project_alpha', label: 'Project Alpha', color: 'bg-red-500', checked: false, count: 0 },
    { id: 'learning', label: 'Learning', color: 'bg-yellow-500', checked: false, count: 0 },
  ];
  const [categoryFilters, setCategoryFilters] = useState<CategoryFilter[]>(initialCategoryFilters);

  useEffect(() => {
    if (!loadingAuth && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, loadingAuth, router]);

  const loadEvents = useCallback(async () => {
    if (currentUser) { 
      setIsLoadingEvents(true);
      try {
        const eventsData = await fetchEventsFromService();
        setAllEvents(eventsData);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setIsLoadingEvents(false);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (!loadingAuth && currentUser) {
        loadEvents();
    }
  }, [currentUser, loadingAuth, loadEvents]);
  
  useEffect(() => {
    // Update category counts
    const newCategoryFilters = categoryFilters.map(catFilter => {
      const count = allEvents.filter(event => 
        event.category?.toLowerCase() === catFilter.id.toLowerCase() || 
        (catFilter.id === 'work' && (!event.category || event.category.toLowerCase() === 'work')) // Example default
      ).length;
      return { ...catFilter, count };
    });
    setCategoryFilters(newCategoryFilters);

    // Apply filters
    const activeScheduleFilterLabels = scheduleFilters.filter(f => f.checked).map(f => f.label.toLowerCase());
    const activeCategoryFilterIds = categoryFilters.filter(f => f.checked).map(f => f.id.toLowerCase());

    const newFilteredEvents = allEvents.filter(event => {
      const eventCategory = event.category?.toLowerCase();
      const eventTitle = event.title?.toLowerCase();

      const categoryMatch = activeCategoryFilterIds.length === 0 || (eventCategory && activeCategoryFilterIds.includes(eventCategory)) || (activeCategoryFilterIds.includes('work') && (!eventCategory || eventCategory === 'work')); // Default "Work" if no specific category

      const scheduleMatch = activeScheduleFilterLabels.length === 0 || activeScheduleFilterLabels.some(sf => eventTitle && eventTitle.includes(sf));
      
      return categoryMatch && scheduleMatch;
    });
    setFilteredEvents(newFilteredEvents);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allEvents, scheduleFilters, categoryFilters]);


  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setDisplayedMonth(date); // Sync sidebar calendar click with main display
    }
  };

  const handleScheduleFilterChange = (id: string) => {
    setScheduleFilters(prev => 
      prev.map(f => f.id === id ? { ...f, checked: !f.checked } : f)
    );
  };

  const handleCategoryFilterChange = (id: string) => {
    setCategoryFilters(prev => 
      prev.map(f => f.id === id ? { ...f, checked: !f.checked } : f)
    );
  };

  if (loadingAuth || (!currentUser && !loadingAuth)) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  if (!currentUser && !loadingAuth) return null;


  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-8rem)] -mx-4 -my-6 md:m-0"> {/* Full height, remove container padding */}
      <EventSidebar
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
        scheduleFilters={scheduleFilters}
        onScheduleFilterChange={handleScheduleFilterChange}
        categoryFilters={categoryFilters}
        onCategoryFilterChange={handleCategoryFilterChange}
        displayedMonth={displayedMonth}
        setDisplayedMonth={setDisplayedMonth}
      />
      <main className="flex-1 flex flex-col bg-background p-4 md:p-6 overflow-hidden">
         <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Calendar</h1>
            <Button asChild>
              <Link href="/events/create"><PlusCircle className="mr-2 h-4 w-4" /> Create Event</Link>
            </Button>
          </div>
        {isLoadingEvents ? (
          <div className="flex-grow flex justify-center items-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <EventDisplayArea
            events={filteredEvents}
            currentView={currentView}
            setCurrentView={setCurrentView}
            selectedDate={selectedDate}
            displayedMonth={displayedMonth}
            setDisplayedMonth={setDisplayedMonth}
          />
        )}
      </main>
    </div>
  );
}
