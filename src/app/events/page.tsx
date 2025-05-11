
'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
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
  color: string; 
  checked: boolean;
  count?: number; 
}

// Base definitions for categories (without dynamic counts or checked state)
const BASE_CATEGORY_DEFINITIONS: Omit<CategoryFilter, 'count' | 'checked'>[] = [
  { id: 'work', label: 'Work', color: 'bg-blue-500' },
  { id: 'personal', label: 'Personal', color: 'bg-green-500' },
  { id: 'teams', label: 'Teams', color: 'bg-purple-500' },
  { id: 'project_alpha', label: 'Project Alpha', color: 'bg-red-500' },
  { id: 'learning', label: 'Learning', color: 'bg-yellow-500' },
  { id: 'webinar', label: 'Webinar', color: 'bg-teal-500' },
  { id: 'conference', label: 'Conference', color: 'bg-indigo-500' },
  { id: 'workshop', label: 'Workshop', color: 'bg-pink-500' },
  { id: 'meetup', label: 'Meetup / Networking', color: 'bg-orange-500' },
  { id: 'social', label: 'Social Gathering', color: 'bg-cyan-500' },
  { id: 'other', label: 'Other', color: 'bg-gray-500' },
];

const initialCheckedCategoryIds = ['work', 'personal', 'teams', 'webinar', 'conference', 'workshop', 'meetup', 'social', 'other'];


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

  // State for category filters' checked status (id -> boolean)
  const [categoryCheckedState, setCategoryCheckedState] = useState<Record<string, boolean>>(
    () => {
      const initialState: Record<string, boolean> = {};
      BASE_CATEGORY_DEFINITIONS.forEach(def => {
        initialState[def.id] = initialCheckedCategoryIds.includes(def.id);
      });
      return initialState;
    }
  );

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
  
  // Memoized calculation for category counts based on allEvents
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    BASE_CATEGORY_DEFINITIONS.forEach(catDef => {
      counts[catDef.id.toLowerCase()] = allEvents.filter(event => {
        const eventCatLower = event.category?.toLowerCase();
        // Exact match
        if (eventCatLower === catDef.id.toLowerCase()) return true;
        // Default to 'work' if event has no category and current catDef is 'work'
        if (catDef.id === 'work' && !eventCatLower) return true;
        // Default to 'other' if event has a category not in BASE_CATEGORY_DEFINITIONS and current catDef is 'other'
        if (catDef.id === 'other' && eventCatLower && !BASE_CATEGORY_DEFINITIONS.some(d => d.id === eventCatLower)) return true;
        return false;
      }).length;
    });
    return counts;
  }, [allEvents]);

  // Memoized category filters with counts for display in sidebar
  const categoryFiltersForDisplay: CategoryFilter[] = useMemo(() => {
    return BASE_CATEGORY_DEFINITIONS.map(def => ({
      ...def,
      checked: categoryCheckedState[def.id] ?? false,
      count: categoryCounts[def.id.toLowerCase()] || 0,
    }));
  }, [categoryCheckedState, categoryCounts]);

  // useEffect for filtering events based on current filter states
  useEffect(() => {
    const activeScheduleFilterLabels = scheduleFilters.filter(f => f.checked).map(f => f.label.toLowerCase());
    const activeCategoryFilterIds = Object.entries(categoryCheckedState)
      .filter(([, isChecked]) => isChecked)
      .map(([id]) => id.toLowerCase());

    const newFilteredEvents = allEvents.filter(event => {
      const eventCategoryLower = event.category?.toLowerCase();
      const eventTitleLower = event.title?.toLowerCase();

      let categoryMatch = activeCategoryFilterIds.length === 0; // If no category filters active, match all
      if (!categoryMatch) {
        if (eventCategoryLower && activeCategoryFilterIds.includes(eventCategoryLower)) {
            categoryMatch = true;
        } else if (activeCategoryFilterIds.includes('work') && !eventCategoryLower) { // Default to 'work' if event has no category
            categoryMatch = true;
        } else if (activeCategoryFilterIds.includes('other') && eventCategoryLower && !BASE_CATEGORY_DEFINITIONS.some(def => def.id === eventCategoryLower)) { // Default to 'other'
            categoryMatch = true;
        }
      }
      
      const scheduleMatch = activeScheduleFilterLabels.length === 0 || 
        (eventTitleLower && activeScheduleFilterLabels.some(sf => eventTitleLower.includes(sf)));
      
      return categoryMatch && scheduleMatch;
    });
    setFilteredEvents(newFilteredEvents);
  }, [allEvents, scheduleFilters, categoryCheckedState]);


  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setDisplayedMonth(date); 
    }
  };

  const handleScheduleFilterChange = (id: string) => {
    setScheduleFilters(prev => 
      prev.map(f => f.id === id ? { ...f, checked: !f.checked } : f)
    );
  };

  const handleCategoryFilterChange = (id: string) => {
    setCategoryCheckedState(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
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
    <div className="flex flex-col md:flex-row h-[calc(100vh-theme(space.16))] md:h-[calc(100vh-theme(space.20))] lg:h-[calc(100vh-theme(space.24))] xl:h-[calc(100vh-8rem)] -mx-4 -my-6 md:m-0"> {/* Adjusted height based on header */}
      <EventSidebar
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
        scheduleFilters={scheduleFilters}
        onScheduleFilterChange={handleScheduleFilterChange}
        categoryFilters={categoryFiltersForDisplay} // Pass derived data
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

