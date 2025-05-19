
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, LinkIcon, CalendarPlus, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { DateTime } from 'luxon';
import { format as formatDateFns } from 'date-fns';
import { timeZoneOptions } from '@/lib/data/timezones';
import { useToast } from "@/hooks/use-toast";

const EventScheduler = () => {
  const [eventName, setEventName] = useState<string>('');
  const [eventDate, setEventDate] = useState<Date | undefined>();
  const [eventTime, setEventTime] = useState<string>('10:00');
  const [eventTimeZone, setEventTimeZone] = useState<string>('');
  const [shareableLink, setShareableLink] = useState<string | null>(null);
  const { toast } = useToast();

  const sortedTimeZones = [...timeZoneOptions].sort((a, b) => a.label.localeCompare(b.label));

  useEffect(() => {
    // Set initial timezone to user's local timezone
    setEventTimeZone(DateTime.local().zoneName || '');
  }, []);

  const handleGenerateLink = () => {
    if (!eventName || !eventDate || !eventTime || !eventTimeZone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all event details.",
        variant: "destructive",
      });
      setShareableLink(null);
      return;
    }

    try {
      const eventDateStr = DateTime.fromJSDate(eventDate).toISODate();
      if (!eventDateStr) {
        toast({ title: "Invalid Date", description: "The selected date is invalid.", variant: "destructive" });
        return;
      }
      const localDateTime = DateTime.fromISO(`${eventDateStr}T${eventTime}`, { zone: eventTimeZone });

      if (!localDateTime.isValid) {
        toast({
          title: "Invalid Date/Time",
          description: localDateTime.invalidReason || "Please check the date, time, and timezone.",
          variant: "destructive",
        });
        setShareableLink(null);
        return;
      }

      const utcDateTime = localDateTime.toUTC();
      const linkParams = new URLSearchParams({
        name: eventName,
        dt: utcDateTime.toISO()!, // Store as UTC ISO string
        origZone: eventTimeZone,
      });

      // Ensure window is defined before constructing URL (for Next.js SSR/client consistency)
      if (typeof window !== 'undefined') {
        const newLink = `${window.location.origin}/view-event?${linkParams.toString()}`;
        setShareableLink(newLink);
        toast({
          title: "Link Generated!",
          description: "Your shareable event link is ready.",
        });
      }

    } catch (error) {
      console.error("Error generating link:", error);
      toast({
        title: "Error",
        description: "Could not generate the event link. Please try again.",
        variant: "destructive",
      });
      setShareableLink(null);
    }
  };

  const handleCopyToClipboard = () => {
    if (shareableLink) {
      navigator.clipboard.writeText(shareableLink)
        .then(() => {
          toast({ description: "Link copied to clipboard!" });
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
          toast({ description: "Failed to copy link.", variant: "destructive" });
        });
    }
  };

  return (
    <div className="flex justify-center py-8">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2">
            <CalendarPlus className="h-8 w-8 text-primary" /> Privacy-First Event Scheduler
          </CardTitle>
          <CardDescription className="text-md flex flex-col items-center gap-1">
            <span>Create an event and get a shareable link. Event details are stored in the link itself.</span>
            <span className="flex items-center gap-1 text-sm"><ShieldCheck className="h-4 w-4 text-green-600" /> No data is stored on our servers.</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="event-name">Event Name</Label>
            <Input
              id="event-name"
              placeholder="e.g., Team Meeting"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="event-date">Event Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="event-date"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !eventDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {eventDate ? formatDateFns(eventDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={eventDate}
                    onSelect={setEventDate}
                    initialFocus
                    disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1))} // Allow today, disable past
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-time">Event Time</Label>
              <Input
                id="event-time"
                type="time"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-timezone">Your Event's Time Zone</Label>
            <Select value={eventTimeZone} onValueChange={setEventTimeZone}>
              <SelectTrigger id="event-timezone">
                <SelectValue placeholder="Select event time zone" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {sortedTimeZones.map(tz => (
                  <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleGenerateLink} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            Create Event & Get Link
          </Button>

          {shareableLink && (
            <div className="mt-6 p-4 bg-muted rounded-md space-y-3">
              <Label htmlFor="shareable-link-output">Shareable Link:</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="shareable-link-output"
                  type="text"
                  value={shareableLink}
                  readOnly
                  className="bg-background"
                />
                <Button variant="outline" size="icon" onClick={handleCopyToClipboard} title="Copy link">
                  <LinkIcon className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Share this link with attendees. It will automatically display the event in their local time.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground text-center block">
          <p className="flex items-center justify-center gap-1">
            <ShieldCheck className="h-3 w-3 text-green-600" /> 
            Your privacy matters: Event information is encoded in the link and not stored on our servers.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default EventScheduler;
