
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { getEventById, updateEvent } from '@/lib/event-service';
import type { Event as EventType } from '@/types';
import { cn } from '@/lib/utils';

const eventFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.').max(150),
  description: z.string().min(20, 'Description must be at least 20 characters.').max(5000),
  eventDate: z.date({ required_error: "Event date is required." }),
  eventTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)."),
  location: z.string().min(3, 'Location is required (e.g., "Online" or address).').max(200),
  isOnline: z.boolean().default(false),
  meetingLink: z.string().url("Must be a valid URL.").optional().or(z.literal('')),
  coverImageUrl: z.string().url("Must be a valid URL.").optional().or(z.literal('')),
  category: z.string().optional(),
  tags: z.string().optional().transform(val => val ? val.split(',').map(s => s.trim()).filter(s => s) : []),
}).refine(data => !data.isOnline || (data.isOnline && data.meetingLink), {
  message: "Meeting link is required for online events.",
  path: ["meetingLink"],
});

type EventFormValues = z.infer<typeof eventFormSchema>;

export default function EditEventPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const { currentUser, loadingAuth } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingEvent, setIsLoadingEvent] = useState(true);
  const [eventData, setEventData] = useState<EventType | null>(null);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: '',
      description: '',
      eventDate: undefined,
      eventTime: '10:00',
      location: '',
      isOnline: false,
      meetingLink: '',
      coverImageUrl: '',
      category: '',
      tags: [],
    },
  });

  const isOnlineValue = form.watch('isOnline');

  useEffect(() => {
    if (!loadingAuth && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, loadingAuth, router]);

  useEffect(() => {
    async function fetchEvent() {
      if (eventId && currentUser) {
        setIsLoadingEvent(true);
        try {
          const fetchedEvent = await getEventById(eventId);
          if (fetchedEvent) {
            if (fetchedEvent.organizerId !== currentUser.uid) {
              toast({ title: "Unauthorized", description: "You are not authorized to edit this event.", variant: "destructive"});
              router.push(`/events/${eventId}`);
              return;
            }
            setEventData(fetchedEvent);
            const eventDateTime = parseISO(fetchedEvent.dateTime as string);
            form.reset({
              title: fetchedEvent.title,
              description: fetchedEvent.description,
              eventDate: eventDateTime,
              eventTime: format(eventDateTime, "HH:mm"),
              location: fetchedEvent.location,
              isOnline: fetchedEvent.isOnline,
              meetingLink: fetchedEvent.meetingLink || '',
              coverImageUrl: fetchedEvent.coverImageUrl || '',
              category: fetchedEvent.category || '',
              tags: Array.isArray(fetchedEvent.tags) ? fetchedEvent.tags.join(', ') : (fetchedEvent.tags || ''),
            });
          } else {
            toast({ title: "Error", description: "Event not found.", variant: "destructive" });
            router.push('/events');
          }
        } catch (error) {
          console.error("Error fetching event for edit:", error);
          toast({ title: "Error", description: "Could not load event details for editing.", variant: "destructive" });
        } finally {
          setIsLoadingEvent(false);
        }
      }
    }
    if (!loadingAuth && currentUser) {
      fetchEvent();
    }
  }, [eventId, currentUser, loadingAuth, router, toast, form]);


  const onSubmit: SubmitHandler<EventFormValues> = async (data) => {
    if (!currentUser || !eventData) {
      toast({ title: "Error", description: "Cannot update event.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);

    const [hours, minutes] = data.eventTime.split(':').map(Number);
    const combinedDateTime = new Date(data.eventDate);
    combinedDateTime.setHours(hours, minutes);

    try {
      const updatedEventData: Partial<Omit<EventType, 'id' | 'organizerId' | 'organizerInfo' | 'createdAt' | 'attendeesCount'>> = {
        title: data.title,
        description: data.description,
        dateTime: combinedDateTime.toISOString(),
        location: data.location,
        isOnline: data.isOnline,
        meetingLink: data.isOnline ? data.meetingLink : undefined,
        coverImageUrl: data.coverImageUrl || undefined,
        category: data.category || undefined,
        tags: typeof data.tags === 'string' ? data.tags.split(',').map(s => s.trim()).filter(s => s) : data.tags,
      };
      await updateEvent(eventData.id, updatedEventData);
      toast({ title: "Event Updated", description: "Your event has been successfully updated." });
      router.push(`/events/${eventData.id}`);
    } catch (error) {
      console.error("Error updating event:", error);
      toast({ title: "Error", description: "Failed to update event. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loadingAuth || isLoadingEvent || (!currentUser && !loadingAuth) ) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-12rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!eventData || eventData.organizerId !== currentUser?.uid) {
      // This case should ideally be handled by redirects in useEffect, but as a fallback:
      return <div className="text-center py-10">Error loading event data or unauthorized.</div>;
  }


  return (
    <div className="max-w-3xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Edit Event</CardTitle>
          <CardDescription>Update the details for your event: {eventData.title}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField name="title" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Title</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isSubmitting} placeholder="Your event title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField name="eventDate" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                              disabled={isSubmitting}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField name="eventTime" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Time (HH:MM)</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField name="location" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isSubmitting} placeholder='e.g., "Online" or "123 Main St, Anytown"' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField name="isOnline" control={form.control} render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isSubmitting} />
                  </FormControl>
                  <FormLabel className="font-normal">This is an online event</FormLabel>
                </FormItem>
              )} />

              {isOnlineValue && (
                <FormField name="meetingLink" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meeting Link (for online events)</FormLabel>
                    <FormControl>
                       <Input {...field} disabled={isSubmitting} placeholder="https://zoom.us/j/..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              )}

              <FormField name="description" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={8} className="min-h-[200px]" disabled={isSubmitting} placeholder="Detailed description of your event..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField name="coverImageUrl" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Image URL (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isSubmitting} placeholder="https://example.com/event-cover.png" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField name="category" control={form.control} render={({ field }) => (
                  <FormItem>
                      <FormLabel>Category (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                        <FormControl>
                          <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                          <SelectContent>
                              <SelectItem value="webinar">Webinar</SelectItem>
                              <SelectItem value="conference">Conference</SelectItem>
                              <SelectItem value="workshop">Workshop</SelectItem>
                              <SelectItem value="meetup">Meetup / Networking</SelectItem>
                              <SelectItem value="social">Social Gathering</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                      </Select>
                      <FormMessage />
                  </FormItem>
              )} />

              <FormField name="tags" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags (comma-separated, optional)</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isSubmitting} placeholder="e.g., Tech, Startups, Marketing" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Event
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
