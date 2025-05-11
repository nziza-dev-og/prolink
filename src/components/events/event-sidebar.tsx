
'use client';

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { ScheduleFilter, CategoryFilter } from "@/app/events/page";
import { ChevronDown, ChevronUp, CalendarDays, ListFilter, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import * as Accordion from "@radix-ui/react-accordion";

interface EventSidebarProps {
  selectedDate: Date;
  onDateChange: (date: Date | undefined) => void;
  scheduleFilters: ScheduleFilter[];
  onScheduleFilterChange: (id: string) => void;
  categoryFilters: CategoryFilter[];
  onCategoryFilterChange: (id: string) => void;
  displayedMonth: Date;
  setDisplayedMonth: (date: Date) => void;
}

export default function EventSidebar({
  selectedDate,
  onDateChange,
  scheduleFilters,
  onScheduleFilterChange,
  categoryFilters,
  onCategoryFilterChange,
  displayedMonth,
  setDisplayedMonth
}: EventSidebarProps) {

  return (
    <aside className="w-full md:w-72 lg:w-80 border-b md:border-b-0 md:border-r bg-card text-card-foreground flex-shrink-0 flex flex-col overflow-y-auto">
      <ScrollArea className="flex-grow">
        <div className="p-4 space-y-6">
          {/* Placeholder for "All Calendar" dropdown */}
          <div className="mb-2">
             <Button variant="ghost" className="w-full justify-between text-left h-auto py-2 px-3">
                <div className="flex items-center">
                    <CalendarDays className="mr-2 h-5 w-5 text-primary" />
                    <div>
                        <span className="font-semibold block">All Calendar</span>
                        <span className="text-xs text-muted-foreground">Personal, Teams</span>
                    </div>
                </div>
                <ChevronDown className="h-4 w-4" />
            </Button>
          </div>

          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onDateChange}
            month={displayedMonth}
            onMonthChange={setDisplayedMonth}
            className="rounded-md border shadow-sm mx-auto"
            classNames={{
                caption_label: "text-sm font-medium",
                head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
                cell: "h-8 w-8 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100",
                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
            }}
          />

          <Separator />

          <Accordion.Root type="multiple" defaultValue={['schedule', 'categories']} className="w-full">
            <Accordion.Item value="schedule">
              <Accordion.Trigger className="flex w-full items-center justify-between py-2 text-sm font-medium hover:underline [&[data-state=open]>svg:last-child]:rotate-180">
                <div className="flex items-center">
                    <ListFilter className="mr-2 h-4 w-4 text-primary" /> My Schedule
                </div>
                <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
              </Accordion.Trigger>
              <Accordion.Content className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                <div className="space-y-2 pt-2 pl-1">
                  {scheduleFilters.map(filter => (
                    <div key={filter.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`schedule-${filter.id}`}
                        checked={filter.checked}
                        onCheckedChange={() => onScheduleFilterChange(filter.id)}
                      />
                      <Label htmlFor={`schedule-${filter.id}`} className="text-xs font-normal cursor-pointer">
                        {filter.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </Accordion.Content>
            </Accordion.Item>

            <Separator className="my-3" />

            <Accordion.Item value="categories">
               <Accordion.Trigger className="flex w-full items-center justify-between py-2 text-sm font-medium hover:underline [&[data-state=open]>svg:last-child]:rotate-180">
                 <div className="flex items-center">
                    <Tag className="mr-2 h-4 w-4 text-primary" /> Categories
                </div>
                <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
              </Accordion.Trigger>
              <Accordion.Content className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                <div className="space-y-2 pt-2 pl-1">
                  {categoryFilters.map(filter => (
                    <div key={filter.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${filter.id}`}
                          checked={filter.checked}
                          onCheckedChange={() => onCategoryFilterChange(filter.id)}
                          className={`data-[state=checked]:${filter.color} border-gray-400`}
                        />
                        <Label htmlFor={`category-${filter.id}`} className="text-xs font-normal cursor-pointer flex items-center">
                           <span className={`w-2.5 h-2.5 rounded-full mr-2 ${filter.checked ? filter.color : 'bg-muted'}`}></span>
                          {filter.label}
                        </Label>
                      </div>
                      <span className="text-xs text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-sm">{filter.count || 0}</span>
                    </div>
                  ))}
                </div>
              </Accordion.Content>
            </Accordion.Item>
          </Accordion.Root>
        </div>
      </ScrollArea>
    </aside>
  );
}
