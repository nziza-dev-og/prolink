
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { createEvent } from '@/lib/event-service';
import type { Event as EventType } from '@/types';
import { cn } from '@/lib/utils';
import { FormField } from '@/components/ui/form'; // Added import

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

export default function CreateEventPage() {
  const { currentUser, loadingAuth } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const onSubmit: SubmitHandler<EventFormValues> = async (data) => {
    if (!currentUser) {
      toast({ title: "Authentication Error", description: "You must be logged in to create an event.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);

    const [hours, minutes] = data.eventTime.split(':').map(Number);
    const combinedDateTime = new Date(data.eventDate);
    combinedDateTime.setHours(hours, minutes);

    try {
      const newEventData: Omit<EventType, 'id' | 'createdAt' | 'updatedAt' | 'organizerInfo' | 'attendeesCount'> = {
        organizerId: currentUser.uid,
        title: data.title,
        description: data.description,
        dateTime: combinedDateTime.toISOString(),
        location: data.location,
        isOnline: data.isOnline,
        meetingLink: data.isOnline ? data.meetingLink : undefined,
        coverImageUrl: data.coverImageUrl || undefined,
        category: data.category || undefined,
        tags: data.tags,
      };
      const eventId = await createEvent(newEventData);
      toast({ title: "Event Created", description: "Your event is now scheduled!" });
      router.push(`/events/${eventId}`);
    } catch (error) {
      console.error("Error creating event:", error);
      toast({ title: "Error", description: "Failed to create event. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loadingAuth || !currentUser) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-12rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create a New Event</CardTitle>
          <CardDescription>Fill in the details to schedule your event.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField name="title" control={form.control} render={({ field }) => (
              <div>
                <Label htmlFor="title">Event Title</Label>
                <Input id="title" {...field} disabled={isSubmitting} placeholder="Your event title" />
                {form.formState.errors.title && <p className="text-sm text-destructive mt-1">{form.formState.errors.title.message}</p>}
              </div>
            )} />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField name="eventDate" control={form.control} render={({ field }) => (
                <div>
                  <Label htmlFor="eventDate">Event Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
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
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} // Disable past dates
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  {form.formState.errors.eventDate && <p className="text-sm text-destructive mt-1">{form.formState.errors.eventDate.message}</p>}
                </div>
              )} />

              <FormField name="eventTime" control={form.control} render={({ field }) => (
                <div>
                  <Label htmlFor="eventTime">Event Time (HH:MM)</Label>
                  <Input id="eventTime" type="time" {...field} disabled={isSubmitting} />
                  {form.formState.errors.eventTime && <p className="text-sm text-destructive mt-1">{form.formState.errors.eventTime.message}</p>}
                </div>
              )} />
            </div>

            <FormField name="location" control={form.control} render={({ field }) => (
              <div>
                <Label htmlFor="location">Location</Label>
                <Input id="location" {...field} disabled={isSubmitting} placeholder='e.g., "Online" or "123 Main St, Anytown"' />
                {form.formState.errors.location && <p className="text-sm text-destructive mt-1">{form.formState.errors.location.message}</p>}
              </div>
            )} />
            
            <FormField name="isOnline" control={form.control} render={({ field }) => (
              <div className="flex items-center space-x-2">
                <Checkbox id="isOnline" checked={field.value} onCheckedChange={field.onChange} disabled={isSubmitting} />
                <Label htmlFor="isOnline" className="font-normal">This is an online event</Label>
              </div>
            )} />

            {isOnlineValue && (
              <FormField name="meetingLink" control={form.control} render={({ field }) => (
                <div>
                  <Label htmlFor="meetingLink">Meeting Link (for online events)</Label>
                  <Input id="meetingLink" {...field} disabled={isSubmitting} placeholder="https://zoom.us/j/..." />
                  {form.formState.errors.meetingLink && <p className="text-sm text-destructive mt-1">{form.formState.errors.meetingLink.message}</p>}
                </div>
              )} />
            )}

            <FormField name="description" control={form.control} render={({ field }) => (
              <div>
                <Label htmlFor="description">Event Description</Label>
                <Textarea id="description" {...field} rows={8} className="min-h-[200px]" disabled={isSubmitting} placeholder="Detailed description of your event..." />
                {form.formState.errors.description && <p className="text-sm text-destructive mt-1">{form.formState.errors.description.message}</p>}
              </div>
            )} />

            <FormField name="coverImageUrl" control={form.control} render={({ field }) => (
              <div>
                <Label htmlFor="coverImageUrl">Cover Image URL (Optional)</Label>
                <Input id="coverImageUrl" {...field} disabled={isSubmitting} placeholder="https://example.com/event-cover.png" />
                {form.formState.errors.coverImageUrl && <p className="text-sm text-destructive mt-1">{form.formState.errors.coverImageUrl.message}</p>}
              </div>
            )} />
            
            <FormField name="category" control={form.control} render={({ field }) => (
                <div>
                    <Label htmlFor="category">Category (Optional)</Label>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                        <SelectTrigger id="category">
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="webinar">Webinar</SelectItem>
                            <SelectItem value="conference">Conference</SelectItem>
                            <SelectItem value="workshop">Workshop</SelectItem>
                            <SelectItem value="meetup">Meetup / Networking</SelectItem>
                            <SelectItem value="social">Social Gathering</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                    {form.formState.errors.category && <p className="text-sm text-destructive mt-1">{form.formState.errors.category.message}</p>}
                </div>
            )} />

            <FormField name="tags" control={form.control} render={({ field }) => (
              <div>
                <Label htmlFor="tags">Tags (comma-separated, optional)</Label>
                <Input id="tags" {...field} value={Array.isArray(field.value) ? field.value.join(', ') : field.value} disabled={isSubmitting} placeholder="e.g., Tech, Startups, Marketing" />
                {form.formState.errors.tags && <p className="text-sm text-destructive mt-1">{form.formState.errors.tags.message}</p>}
              </div>
            )} />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Event
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

