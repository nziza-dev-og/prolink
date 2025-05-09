
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllEvents as fetchEventsFromService } from "@/lib/event-service"; 
import type { Event as EventType } from "@/types";
import { CalendarClock, Loader2, MapPin, Users, Link as LinkIcon } from "lucide-react";
import { useAuth } from '@/context/auth-context';
import { format } from 'date-fns';

function EventCard({ event }: { event: EventType }) {
  const eventDate = event.dateTime ? new Date(event.dateTime as string) : null;
  return (
    <Card className="hover:shadow-lg transition-shadow flex flex-col">
      <CardHeader className="p-4">
        {event.coverImageUrl && (
          <div className="relative h-40 w-full mb-3 rounded-t-md overflow-hidden">
            <Image src={event.coverImageUrl} alt={`${event.title} cover`} layout="fill" objectFit="cover" data-ai-hint="event cover image"/>
          </div>
        )}
        <Link href={`/events/${event.id}`} className="hover:underline">
          <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
        </Link>
        <CardDescription className="text-sm mt-1">
          {event.organizerInfo ? (
            <span>By <Link href={`/profile/${event.organizerInfo.uid}`} className="text-primary hover:underline">{event.organizerInfo.firstName} {event.organizerInfo.lastName}</Link></span>
          ) : (
            <span>By Unknown Organizer</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-3 flex-grow">
        {eventDate && (
          <p className="text-sm text-muted-foreground mb-1 flex items-center">
            <CalendarClock className="mr-2 h-4 w-4" /> {format(eventDate, "EEE, MMM d, yyyy 'at' h:mm a")}
          </p>
        )}
        <p className="text-sm text-muted-foreground mb-2 flex items-center">
          <MapPin className="mr-2 h-4 w-4" /> {event.location} {event.isOnline && event.meetingLink && <LinkIcon className="ml-2 h-4 w-4 text-primary"/>}
        </p>
        <p className="text-sm line-clamp-3 text-foreground/80">{event.description}</p>
      </CardContent>
      <CardFooter className="px-4 pb-4 flex justify-between items-center">
        <span className="text-xs text-muted-foreground flex items-center">
            <Users className="mr-1 h-4 w-4"/> {event.attendeesCount || 0} attending
        </span>
        <Button size="sm" asChild>
          <Link href={`/events/${event.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function EventsPage() {
  const { currentUser, loadingAuth } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<EventType[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  useEffect(() => {
    if (!loadingAuth && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, loadingAuth, router]);

  useEffect(() => {
    async function loadEvents() {
      if (currentUser) { 
        setIsLoadingEvents(true);
        try {
          const eventsData = await fetchEventsFromService();
          setEvents(eventsData);
        } catch (error) {
          console.error("Error fetching events:", error);
        } finally {
          setIsLoadingEvents(false);
        }
      }
    }
    if (!loadingAuth && currentUser) {
        loadEvents();
    }
  }, [currentUser, loadingAuth]);

  if (loadingAuth || (!currentUser && !loadingAuth)) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-12rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  if (!currentUser) return null;

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Upcoming Events</h1>
        <Button asChild>
          <Link href="/events/create">Create Event</Link>
        </Button>
      </div>

      {isLoadingEvents ? (
        <div className="flex justify-center items-center py-10">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center">
            <p className="text-muted-foreground">No events found. Why not create one?</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
      
      {!isLoadingEvents && events.length > 0 && (
        <div className="text-center mt-8">
          <Button variant="outline" disabled>Load more events</Button>
        </div>
      )}
    </div>
  );
}
