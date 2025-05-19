
"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { DateTime } from 'luxon';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, Globe, Download } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from '@/components/ui/skeleton';

interface EventDetails {
  name: string;
  utcStart: DateTime;
  originalZone: string;
  // durationMinutes?: number; // For future use
}

const ViewEventContent = () => {
  const searchParams = useSearchParams();
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
  const [viewerLocalTime, setViewerLocalTime] = useState<string | null>(null);
  const [originalEventTime, setOriginalEventTime] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewerTimeZone, setViewerTimeZone] = useState<string>('');

  useEffect(() => {
    const name = searchParams.get('name');
    const dtISO = searchParams.get('dt'); // UTC ISO String
    const origZone = searchParams.get('origZone');

    if (typeof window !== 'undefined') {
      setViewerTimeZone(DateTime.local().zoneName || 'your local timezone');
    }

    if (!name || !dtISO || !origZone) {
      setError("Event details are missing or invalid in the link.");
      return;
    }

    try {
      const utcStart = DateTime.fromISO(dtISO, { zone: 'utc' });
      if (!utcStart.isValid) {
        setError(`Invalid event date/time in link. Reason: ${utcStart.invalidReason || 'Unknown'}`);
        return;
      }

      setEventDetails({ name, utcStart, originalZone: origZone });

      const viewerLocalDt = utcStart.setZone(DateTime.local().zoneName);
      setViewerLocalTime(viewerLocalDt.toFormat("DDDD, HH:mm (ZZZZ)"));
      
      const originalLocalDt = utcStart.setZone(origZone);
      setOriginalEventTime(originalLocalDt.toFormat("DDDD, HH:mm (ZZZZ)"));

    } catch (e) {
      console.error("Error parsing event details:", e);
      setError("Could not load event details from the link.");
    }
  }, [searchParams]);

  const generateICSData = () => {
    if (!eventDetails) return null;
    const { name, utcStart } = eventDetails;
    // Assuming a 1-hour duration for simplicity in this version
    const utcEnd = utcStart.plus({ hours: 1 }); 

    const formatDateForICS = (dt: DateTime) => dt.toFormat("yyyyMMdd'T'HHmmss'Z'");

    const uid = `chronosync-${utcStart.toMillis()}@example.com`; // Basic UID

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ChronoSync//EventScheduler//EN',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${DateTime.now().toUTC().toFormat("yyyyMMdd'T'HHmmss'Z'")}`,
      `DTSTART:${formatDateForICS(utcStart)}`,
      `DTEND:${formatDateForICS(utcEnd)}`,
      `SUMMARY:${name}`,
      `DESCRIPTION:Event scheduled via ChronoSync. Original time: ${originalEventTime || 'N/A'}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
    return encodeURIComponent(icsContent);
  };

  const googleCalendarLink = () => {
    if (!eventDetails) return "#";
    const { name, utcStart } = eventDetails;
    const utcEnd = utcStart.plus({ hours: 1 }); // Assuming 1-hour duration

    const formatForGoogle = (dt: DateTime) => dt.toFormat("yyyyMMdd'T'HHmmss'Z'");

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: name,
      dates: `${formatForGoogle(utcStart)}/${formatForGoogle(utcEnd)}`,
      details: `Event scheduled via ChronoSync.\nOriginal time in ${eventDetails.originalZone}: ${originalEventTime || 'N/A'}`,
      ctz: 'UTC' // Important: dates are in UTC
    });
    return `https://www.google.com/calendar/render?${params.toString()}`;
  };
  
  if (error) {
    return (
      <Alert variant="destructive" className="my-8">
        <CalendarDays className="h-4 w-4" />
        <AlertTitle>Error Loading Event</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!eventDetails) {
    return (
      <div className="space-y-4 py-8">
        <Skeleton className="h-8 w-3/4 mx-auto" />
        <Skeleton className="h-6 w-1/2 mx-auto" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
        <Skeleton className="h-10 w-full mt-4" />
         <Skeleton className="h-10 w-full mt-2" />
      </div>
    );
  }

  return (
    <>
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2">
          <CalendarDays className="h-8 w-8 text-primary" /> {eventDetails.name}
        </CardTitle>
        <CardDescription className="text-md">
          Event details shown in your local time ({viewerTimeZone}).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-muted rounded-lg shadow">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-1">
              <Clock className="h-5 w-5 text-accent" /> Your Local Time
            </h3>
            <p className="text-2xl">{viewerLocalTime ? viewerLocalTime.split(', ')[1]?.split(' (')[0] : 'Calculating...'}</p>
            <p className="text-sm text-muted-foreground">{viewerLocalTime ? viewerLocalTime.split(', ')[0] : ''} ({viewerTimeZone})</p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg shadow">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-1">
              <Globe className="h-5 w-5 text-secondary-foreground" /> Original Event Time
            </h3>
            <p className="text-2xl">{originalEventTime ? originalEventTime.split(', ')[1]?.split(' (')[0] : 'Calculating...'}</p>
            <p className="text-sm text-muted-foreground">{originalEventTime ? originalEventTime.split(', ')[0] : ''} ({eventDetails.originalZone})</p>
          </div>
        </div>

        <div className="space-y-3 pt-4">
            <h4 className="text-lg font-medium text-center mb-2">Add to Calendar:</h4>
            <Button asChild variant="outline" className="w-full">
                <a href={googleCalendarLink()} target="_blank" rel="noopener noreferrer">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><path d="M8 14h.01"></path><path d="M12 14h.01"></path><path d="M16 14h.01"></path><path d="M8 18h.01"></path><path d="M12 18h.01"></path><path d="M16 18h.01"></path></svg>
                Add to Google Calendar
                </a>
            </Button>
            <Button asChild variant="outline" className="w-full">
                <a href={`data:text/calendar;charset=utf8,${generateICSData()}`} download={`${eventDetails.name}.ics`}>
                <Download className="mr-2 h-4 w-4" />
                Download ICS File
                </a>
            </Button>
        </div>

      </CardContent>
      <CardFooter className="text-xs text-muted-foreground text-center block">
        <p>Time conversions are powered by Luxon. Ensure your device's time and timezone are set correctly for accurate local display.</p>
      </CardFooter>
    </>
  );
};

// Wrap ViewEventContent with Suspense for useSearchParams
export default function ViewEvent() {
  return (
    <div className="flex justify-center py-8">
      <Card className="w-full max-w-xl shadow-xl">
        <Suspense fallback={<ViewEventLoadingState />}>
          <ViewEventContent />
        </Suspense>
      </Card>
    </div>
  );
}

const ViewEventLoadingState = () => (
  <>
    <CardHeader className="text-center">
      <Skeleton className="h-8 w-3/4 mx-auto mb-2" />
      <Skeleton className="h-4 w-1/2 mx-auto" />
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
      <div className="space-y-3 pt-4">
        <Skeleton className="h-6 w-1/3 mx-auto mb-2" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </CardContent>
     <CardFooter className="text-xs text-muted-foreground text-center block">
        <Skeleton className="h-3 w-3/4 mx-auto" />
    </CardFooter>
  </>
);
