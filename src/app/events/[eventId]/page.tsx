
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
import { CalendarClock, Edit, Trash2, Link as LinkIcon, UserCheck, UserX, CalendarPlus, Users, MapPin, UserCircle2 } from "lucide-react";
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
        setEvent(prev => prev ? ({ ...prev, attendeesCount: Math.max(0, (prev.attendeesCount || 0) -1), attendees: prev.attendees?.filter(uid => uid !== currentUser.uid) }) : null);
      } else {
        await rsvpToEvent(event.id, currentUser.uid);
        toast({ title: "RSVP Successful", description: `You are now attending ${event.title}!`});
        setEvent(prev => prev ? ({ ...prev, attendeesCount: (prev.attendeesCount || 0) + 1, attendees: [...(prev.attendees || []), currentUser.uid] }) : null);
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
    if (!event || !currentUser || event.organizerId !== currentUser.uid) {
        toast({ title: "Unauthorized", description: "You cannot delete this event.", variant: "destructive" });
        return;
    }
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

  const eventDate = event.dateTime ? parseISO(event.dateTime as string) : null;
  const isOrganizer = currentUser?.uid === event.organizerId;

  return (
    <div className="max-w-6xl mx-auto py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
      {event.coverImageUrl && (
        <div className="relative h-60 md:h-80 lg:h-96 w-full mb-8 rounded-lg overflow-hidden shadow-lg">
          <Image src={event.coverImageUrl} alt={`${event.title} cover image`} layout="fill" objectFit="cover" data-ai-hint="event cover banner"/>
        </div>
      )}

      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
          {event.title}
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-lg text-muted-foreground">
          Join us for an exciting event: {event.category ? `${event.category}.` : ''} {event.isOnline ? "Online." : `At ${event.location}.`}
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-3 lg:gap-x-12">
        {/* Main Content Area (Left) */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-primary/10 border-primary/30">
              <CardHeader>
                <CardTitle className="text-lg text-primary flex items-center">
                  <CalendarClock className="mr-2 h-5 w-5" /> Event Start
                </CardTitle>
              </CardHeader>
              <CardContent className="text-primary-foreground/80 dark:text-primary-foreground/70">
                {eventDate ? (
                  <>
                    <p>{format(eventDate, "h:mm a")}</p>
                    <p>{format(eventDate, "EEEE, MMMM d, yyyy")}</p>
                  </>
                ) : <p>Date TBD</p>}
              </CardContent>
            </Card>

            <Card className="bg-secondary">
              <CardHeader>
                <CardTitle className="text-lg text-secondary-foreground flex items-center">
                  <UserCircle2 className="mr-2 h-5 w-5" /> Event Organiser
                </CardTitle>
              </CardHeader>
              <CardContent className="text-secondary-foreground/80">
                {event.organizerInfo ? (
                  <>
                    <Link href={`/profile/${event.organizerInfo.uid}`} className="font-semibold hover:underline block">
                      {event.organizerInfo.firstName} {event.organizerInfo.lastName}
                    </Link>
                    <p className="text-xs truncate">{event.organizerInfo.headline || 'ProLink User'}</p>
                  </>
                ) : <p>Organizer TBD</p>}
              </CardContent>
            </Card>

            <Card className="bg-accent/10 border-accent/30">
              <CardHeader>
                <CardTitle className="text-lg text-accent-foreground flex items-center">
                  <MapPin className="mr-2 h-5 w-5" /> Event Venue
                </CardTitle>
              </CardHeader>
              <CardContent className="text-accent-foreground/80 dark:text-accent-foreground/70">
                <p>{event.location}</p>
                {event.isOnline && event.meetingLink && (
                  <a href={event.meetingLink} target="_blank" rel="noopener noreferrer" className="text-xs hover:underline break-all text-primary">
                    Join Online Meeting
                  </a>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">About {event.title}</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none text-foreground whitespace-pre-line">
              <p>{event.description}</p>
              <div className="my-6 rounded-lg overflow-hidden shadow-md">
                <Image src="https://picsum.photos/seed/eventcontent2/800/400" alt="Illustrative image for event content" width={800} height={400} className="w-full h-auto object-cover" data-ai-hint="event meeting"/>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Attendees ({event.attendeesCount || 0})</CardTitle>
            </CardHeader>
            <CardContent>
                {event.attendeesCount > 0 ? (
                    <div className="flex -space-x-2 overflow-hidden mt-2">
                        {Array.from({length: Math.min(event.attendeesCount || 0, 5)}).map((_, i) => (
                             <Avatar key={`attendee-avatar-${i}`} className="inline-block h-10 w-10 rounded-full ring-2 ring-background">
                                <AvatarImage src={`https://picsum.photos/seed/attendee${event.id}${i}/40`} alt="Attendee" data-ai-hint="user avatar small"/>
                                <AvatarFallback>A{i+1}</AvatarFallback>
                            </Avatar>
                        ))}
                        {(event.attendeesCount || 0) > 5 && <span className="flex items-center justify-center h-10 w-10 rounded-full bg-muted text-xs font-medium text-muted-foreground ring-2 ring-background">+{ (event.attendeesCount || 0) - 5}</span>}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">No attendees yet. Be the first to RSVP!</p>
                )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar (Right) */}
        <aside className="lg:col-span-1 space-y-8 mt-8 lg:mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={handleRsvpToggle} className="w-full" disabled={isProcessingRsvp || isOrganizer}>
                  {isProcessingRsvp ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 
                   isAttending ? <UserX className="mr-2 h-4 w-4" /> : <UserCheck className="mr-2 h-4 w-4" />}
                  {isAttending ? "Cancel RSVP" : "RSVP / Register"}
              </Button>
              <Button variant="outline" className="w-full" onClick={handleAddToCalendar}>
                  <CalendarPlus className="mr-2 h-4 w-4" /> Add to Calendar
              </Button>
              {isOrganizer && (
                  <>
                       <Button variant="outline" className="w-full" asChild>
                          <Link href={`/events/${event.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" /> Edit Event
                          </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" className="w-full" disabled={isProcessingDelete}>
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
            </CardContent>
          </Card>
          
          {event.tags && event.tags.length > 0 && (
            <Card>
                <CardHeader><CardTitle className="text-lg">Tags</CardTitle></CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {event.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 text-xs bg-secondary text-secondary-foreground rounded-full">
                            {tag}
                        </span>
                        ))}
                    </div>
                </CardContent>
            </Card>
           )}

          <Card>
            <CardHeader>
              <CardTitle>Register to Event (Public)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">If you are not a platform member, use this placeholder form. (This form is not functional)</p>
              <div className="space-y-1">
                <Label htmlFor="guest-name">Name</Label>
                <Input id="guest-name" placeholder="Your name" disabled/>
              </div>
              <div className="space-y-1">
                <Label htmlFor="guest-email">Email</Label>
                <Input id="guest-email" type="email" placeholder="Your email" disabled/>
              </div>
              <div className="space-y-1">
                <Label htmlFor="guest-phone">Phone number</Label>
                <Input id="guest-phone" type="tel" placeholder="Your phone" disabled/>
              </div>
              <Button className="w-full" disabled>Register</Button>
            </CardContent>
          </Card>


          <Card>
            <CardHeader>
              <CardTitle>Recommended</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { title: "Tech Meetup SF", date: "Oct 15, 2024", imgSeed: "techmeetup", hint:"conference team" },
                { title: "Marketing Workshop", date: "Nov 02, 2024", imgSeed: "marketingworkshop", hint:"workshop presentation" }
              ].map((item, i) => (
                <Link href="#" key={i} className="block group">
                  <div className="flex items-start space-x-3 p-3 border rounded-lg hover:shadow-lg transition-shadow bg-card hover:bg-muted/50">
                    <Image src={`https://picsum.photos/seed/${item.imgSeed}/100/75`} alt={item.title} width={80} height={60} className="rounded-md object-cover flex-shrink-0" data-ai-hint={item.hint}/>
                    <div>
                      <h4 className="font-semibold text-sm group-hover:text-primary group-hover:underline">{item.title}</h4>
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">An engaging session about the future of technology and networking opportunities.</p>
                    </div>
                  </div>
                </Link>
              ))}
              <Button variant="link" className="w-full text-primary p-0 mt-2" disabled>
                View More Recommendations
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
