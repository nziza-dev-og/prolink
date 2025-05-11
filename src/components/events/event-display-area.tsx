
'use client';

import type { Event as EventType } from "@/types";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths, startOfWeek, addDays, isSameMonth, isSameDay, parseISO, getHours, getMinutes, isWithinInterval } from 'date-fns';
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Link from "next/link";
import { ScrollArea } from "../ui/scroll-area";

interface EventDisplayAreaProps {
  events: EventType[];
  currentView: 'month' | 'week' | 'day';
  setCurrentView: (view: 'month' | 'week' | 'day') => void;
  selectedDate: Date;
  displayedMonth: Date;
  setDisplayedMonth: (date: Date) => void;
}

interface CalendarEventItemProps {
  event: EventType;
  view: 'month' | 'week' | 'day';
}

const CalendarEventItem: React.FC<CalendarEventItemProps> = ({ event, view }) => {
  const eventDateTime = parseISO(event.dateTime as string);
  const eventTime = format(eventDateTime, 'p');
  // Placeholder for attendee avatars
  const mockAttendees = event.attendees?.slice(0,3) || []; 

  // Basic color coding based on category or title (example)
  let eventColor = 'bg-primary/10 border-primary/50'; // Default
  if (event.category?.toLowerCase() === 'personal') eventColor = 'bg-green-500/10 border-green-500/50';
  else if (event.category?.toLowerCase() === 'work') eventColor = 'bg-blue-500/10 border-blue-500/50';
  else if (event.category?.toLowerCase() === 'teams') eventColor = 'bg-purple-500/10 border-purple-500/50';

  return (
    <Link href={`/events/${event.id}`} className={cn("block p-2 rounded-md shadow-sm hover:shadow-md transition-shadow border-l-4", eventColor)}>
      <h4 className="text-xs font-semibold truncate">{event.title}</h4>
      <p className="text-xs text-muted-foreground">{eventTime}</p>
      {mockAttendees.length > 0 && view !== 'month' && (
        <div className="flex -space-x-1 mt-1">
          {mockAttendees.map((attendeeId, index) => (
            <Avatar key={index} className="h-4 w-4 border-2 border-background rounded-full">
              {/* In real app, fetch attendee profile picture */}
              <AvatarImage src={`https://picsum.photos/seed/${attendeeId.substring(0,5)}/20`} data-ai-hint="user avatar tiny" />
              <AvatarFallback className="text-[8px]">A{index}</AvatarFallback>
            </Avatar>
          ))}
          {event.attendeesCount > 3 && <span className="text-[10px] text-muted-foreground pl-1.5 pt-px">+{event.attendeesCount-3}</span>}
        </div>
      )}
    </Link>
  );
};


export default function EventDisplayArea({
  events,
  currentView,
  setCurrentView,
  selectedDate,
  displayedMonth,
  setDisplayedMonth,
}: EventDisplayAreaProps) {

  const handlePrevMonth = () => setDisplayedMonth(subMonths(displayedMonth, 1));
  const handleNextMonth = () => setDisplayedMonth(addMonths(displayedMonth, 1));
  const handleToday = () => {
    const today = new Date();
    setDisplayedMonth(today);
    // If onDateChange prop existed: onDateChange(today);
  };

  const renderCalendarGrid = () => {
    if (currentView === 'month') {
      const monthStart = startOfWeek(new Date(displayedMonth.getFullYear(), displayedMonth.getMonth(), 1), { weekStartsOn: 1 });
      const days = Array.from({ length: 35 }).map((_, i) => addDays(monthStart, i)); // 5 weeks
      return (
        <div className="grid grid-cols-7 border-t border-r">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
            <div key={day} className="p-2 text-xs font-medium text-center border-b border-l text-muted-foreground">{day}</div>
          ))}
          {days.map(day => {
            const dayEvents = events.filter(event => isSameDay(parseISO(event.dateTime as string), day));
            return (
              <div
                key={day.toString()}
                className={cn(
                  "h-24 border-b border-l p-1 overflow-hidden relative",
                  !isSameMonth(day, displayedMonth) && "bg-muted/30 text-muted-foreground/50",
                  isSameDay(day, new Date()) && "bg-primary/5"
                )}
              >
                <span className={cn("text-xs absolute top-1 right-1", isSameDay(day, selectedDate) && "font-bold text-primary")}>{format(day, 'd')}</span>
                <ScrollArea className="h-full pt-4">
                    <div className="space-y-1">
                    {dayEvents.slice(0,2).map(event => (
                        <CalendarEventItem key={event.id} event={event} view="month"/>
                    ))}
                    {dayEvents.length > 2 && <p className="text-[10px] text-muted-foreground text-center mt-0.5">+{dayEvents.length-2} more</p>}
                    </div>
                </ScrollArea>
              </div>
            );
          })}
        </div>
      );
    } else if (currentView === 'week') {
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday
      const daysOfWeek = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));
      const hours = Array.from({ length: 24 }).map((_, i) => i); // 0-23

      return (
        <div className="flex flex-col flex-grow overflow-hidden">
          <div className="grid grid-cols-[auto_repeat(7,1fr)] border-t border-r sticky top-0 bg-background z-10">
            <div className="p-2 text-xs font-medium text-center border-b border-l text-muted-foreground w-16">Time</div>
            {daysOfWeek.map(day => (
              <div key={day.toISOString()} className="p-2 text-xs font-medium text-center border-b border-l text-muted-foreground">
                {format(day, 'EEE')} <span className={cn(isSameDay(day, new Date()) && "text-primary font-bold")}>{format(day, 'd')}</span>
              </div>
            ))}
          </div>
          <ScrollArea className="flex-grow">
            <div className="grid grid-cols-[auto_repeat(7,1fr)]">
              <div className="col-start-1 row-start-1 grid divide-y">
                {hours.map(hour => (
                  <div key={`time-${hour}`} className="h-16 border-l p-1 pt-0 text-right text-[10px] text-muted-foreground w-16 relative -top-1.5">
                    {hour > 0 ? `${format(new Date(0,0,0,hour), 'ha')}` : ''}
                  </div>
                ))}
              </div>
              {daysOfWeek.map((day, dayIndex) => (
                <div key={day.toISOString()} className="col-start-auto row-start-1 grid divide-y border-l">
                  {hours.map((hour) => {
                    const hourStart = new Date(day);
                    hourStart.setHours(hour, 0, 0, 0);
                    const hourEnd = new Date(day);
                    hourEnd.setHours(hour, 59, 59, 999);
                    
                    const eventsInHour = events.filter(event => {
                      const eventDate = parseISO(event.dateTime as string);
                      return isSameDay(eventDate, day) && getHours(eventDate) === hour;
                    });

                    return (
                      <div key={`${day.toISOString()}-${hour}`} className="h-16 p-0.5 relative">
                        {eventsInHour.map(event => {
                            const eventStartMinutes = getMinutes(parseISO(event.dateTime as string));
                            const topPosition = (eventStartMinutes / 60) * 100; // Percentage from top of hour cell
                           return (
                            <div key={event.id} className="absolute w-[calc(100%-4px)] left-[2px] z-10" style={{top: `${topPosition}%`}}>
                                <CalendarEventItem event={event} view="week"/>
                            </div>
                           )
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      );
    }
    // TODO: Implement 'day' view
    return <div className="p-4 text-center text-muted-foreground">Day view coming soon.</div>;
  };

  return (
    <div className="flex flex-col h-full">
      <header className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={handlePrevMonth}><ChevronLeft className="h-5 w-5" /></Button>
          <h2 className="text-xl font-semibold w-32 text-center">{format(displayedMonth, 'MMMM yyyy')}</h2>
          <Button variant="ghost" size="icon" onClick={handleNextMonth}><ChevronRight className="h-5 w-5" /></Button>
          <Button variant="outline" size="sm" onClick={handleToday} className="ml-2">Today</Button>
        </div>
        <div className="space-x-1 bg-muted p-0.5 rounded-md">
          <Button variant={currentView === 'day' ? 'default' : 'ghost'} size="sm" onClick={() => setCurrentView('day')} className="text-xs">Day</Button>
          <Button variant={currentView === 'week' ? 'default' : 'ghost'} size="sm" onClick={() => setCurrentView('week')} className="text-xs">Week</Button>
          <Button variant={currentView === 'month' ? 'default' : 'ghost'} size="sm" onClick={() => setCurrentView('month')} className="text-xs">Month</Button>
        </div>
      </header>
      <div className="flex-grow overflow-auto border rounded-lg">
        {renderCalendarGrid()}
      </div>
    </div>
  );
}
