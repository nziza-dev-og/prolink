
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { getEventById, rsvpToEvent, cancelRsvpFromEvent, deleteEvent as deleteEventService } from '@/lib/event-service';
import type { Event as EventType } from "@/types";
import { CalendarClock, ExternalLink, Loader2, MapPin, Tag, Users, Edit, Trash2, Link as LinkIcon, UserCheck, UserX, CalendarPlus } from "lucide-react";
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const router = useRouter();
  const { toast } = useToast();
  
  const { currentUser, loadingAuth } = useAuth();
  const [event, setEvent] = useState<EventType | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isAttending, setIsAttending] = useState(false);
  const [isProcessingRsvp, setIsProcessingRsvp] = useState(false);
  const [isProcessingDelete, setIsProcessingDelete] = useState(false);

  useEffect(() => {
    if (!loadingAuth && !currentUser) {
        router.push('/login');
    }
  }, [currentUser, loadingAuth, router]);
  
  useEffect(() => {
    async function fetchEventData() {
      if (eventId && currentUser) {
        setIsLoadingData(true);
        try {
          const eventData = await getEventById(eventId);
          setEvent(eventData);
          if (eventData && eventData.attendees?.includes(currentUser.uid)) {
            setIsAttending(true);
          } else {
            setIsAttending(false);
          }
        } catch (error) {
          console.error("Failed to fetch event data:", error);
          toast({ title: "Error", description: "Could not load event details.", variant: "destructive" });
        } finally {
          setIsLoadingData(false);
        }
      }
    }
    if (!loadingAuth && currentUser) {
        fetchEventData();
    }
  }, [eventId, loadingAuth, currentUser, toast]);

  const handleRsvpToggle = async () => {
    if (!currentUser || !event) return;
    setIsProcessingRsvp(true);
    try {
      if (isAttending) {
        await cancelRsvpFromEvent(event.id, currentUser.uid);
        toast({ title: "RSVP Cancelled", description: `You are no longer attending ${event.title}.`});
        setEvent(prev => prev ? ({ ...prev, attendeesCount: Math.max(0, prev.attendeesCount -1), attendees: prev.attendees?.filter(uid => uid !== currentUser.uid) }) : null);
      } else {
        await rsvpToEvent(event.id, currentUser.uid);
        toast({ title: "RSVP Successful", description: `You are now attending ${event.title}!`});
        setEvent(prev => prev ? ({ ...prev, attendeesCount: prev.attendeesCount + 1, attendees: [...(prev.attendees || []), currentUser.uid] }) : null);
      }
      setIsAttending(!isAttending);
    } catch (error) {
      console.error("Error processing RSVP:", error);
      toast({ title: "RSVP Error", description: "Could not update your RSVP status.", variant: "destructive" });
    } finally {
      setIsProcessingRsvp(false);
    }
  };

  const handleAddToCalendar = () => {
    toast({ title: "Coming Soon", description: "Functionality to add to calendar will be available soon."});
  };

  const handleDeleteEvent = async () => {
    if (!event) return;
    setIsProcessingDelete(true);
    try {
      await deleteEventService(event.id);
      toast({ title: "Event Deleted", description: `${event.title} has been successfully deleted.` });
      router.push('/events');
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({ title: "Delete Error", description: "Could not delete the event.", variant: "destructive" });
      setIsProcessingDelete(false);
    }
  };

  if (loadingAuth || isLoadingData) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-12rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) {
    return <div className="text-center py-10">Event not found. It might have been removed or the link is incorrect.</div>;
  }

  const eventDate = event.dateTime ? new Date(event.dateTime as string) : null;
  const isOrganizer = currentUser?.uid === event.organizerId;

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <Card>
        {event.coverImageUrl && (
          <div className="relative h-64 w-full rounded-t-lg overflow-hidden">
            <Image src={event.coverImageUrl} alt={`${event.title} cover image`} layout="fill" objectFit="cover" data-ai-hint="event cover banner"/>
          </div>
        )}
        <CardHeader className="pb-4">
          <CardTitle className="text-3xl mb-1">{event.title}</CardTitle>
          {event.organizerInfo && (
            <CardDescription className="text-md">
                Organized by <Link href={`/profile/${event.organizerInfo.uid}`} className="hover:underline text-primary">{event.organizerInfo.firstName} {event.organizerInfo.lastName}</Link>
                {event.organizerInfo.headline && <span className="text-sm text-muted-foreground"> ({event.organizerInfo.headline})</span>}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="md:col-span-2 space-y-2">
                    {eventDate && (
                        <p className="text-foreground flex items-center"><CalendarClock className="mr-2 h-5 w-5 text-primary" /> {format(eventDate, "EEEE, MMMM d, yyyy 'at' h:mm a")}</p>
                    )}
                    <p className="text-foreground flex items-center"><MapPin className="mr-2 h-5 w-5 text-primary" /> {event.location}</p>
                    {event.isOnline && event.meetingLink && (
                         <p className="text-foreground flex items-center">
                            <LinkIcon className="mr-2 h-5 w-5 text-primary" /> 
                            <a href={event.meetingLink} target="_blank" rel="noopener noreferrer" className="hover:underline text-primary break-all">
                                Join Online Event
                            </a>
                        </p>
                    )}
                    {event.category && <p className="text-foreground flex items-center"><Tag className="mr-2 h-5 w-5 text-primary" /> Category: {event.category}</p>}
                </div>
                <div className="flex flex-col space-y-2 items-start md:items-end">
                    <Button onClick={handleRsvpToggle} className="w-full md:w-auto" disabled={isProcessingRsvp || isOrganizer}>
                        {isProcessingRsvp ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 
                         isAttending ? <UserX className="mr-2 h-4 w-4" /> : <UserCheck className="mr-2 h-4 w-4" />}
                        {isAttending ? "Cancel RSVP" : "RSVP / Register"}
                    </Button>
                    <Button variant="outline" className="w-full md:w-auto" onClick={handleAddToCalendar}>
                        <CalendarPlus className="mr-2 h-4 w-4" /> Add to Calendar
                    </Button>
                     {isOrganizer && (
                        <>
                             <Button variant="outline" className="w-full md:w-auto" asChild>
                                <Link href={`/events/${event.id}/edit`}>
                                  <Edit className="mr-2 h-4 w-4" /> Edit Event
                                </Link>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="w-full md:w-auto" disabled={isProcessingDelete}>
                                   {isProcessingDelete ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                  Delete Event
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the event "{event.title}".
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel disabled={isProcessingDelete}>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={handleDeleteEvent} disabled={isProcessingDelete}>
                                    {isProcessingDelete ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Delete"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                        </>
                    )}
                </div>
            </div>

          <Separator className="my-6" />

          <h3 className="text-xl font-semibold mb-3">About this event</h3>
          <div className="prose prose-sm max-w-none text-foreground whitespace-pre-line">
            {event.description}
          </div>

          {event.tags && event.tags.length > 0 && (
            <>
              <Separator className="my-6" />
              <h3 className="text-xl font-semibold mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {event.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Attendees ({event.attendeesCount || 0})</CardTitle>
        </CardHeader>
        <CardContent>
            {/* Placeholder for attendees list - could be fetched from a subcollection */}
            <p className="text-sm text-muted-foreground">Attendee list display is not yet implemented. Displaying count only.</p>
            {event.attendeesCount > 0 && (
                <div className="flex -space-x-2 overflow-hidden mt-2">
                    {/* Example Avatars (replace with actual data if available) */}
                    {Array.from({length: Math.min(event.attendeesCount, 5)}).map((_, i) => (
                         <Avatar key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-background">
                            <AvatarImage src={`https://picsum.photos/seed/attendee${i}/40`} alt="Attendee" data-ai-hint="user avatar small"/>
                            <AvatarFallback>U{i+1}</AvatarFallback>
                        </Avatar>
                    ))}
                    {event.attendeesCount > 5 && <span className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-xs font-medium text-muted-foreground ring-2 ring-background">+{event.attendeesCount - 5}</span>}
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
