
"use client";

import { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { DateTime, Duration } from 'luxon';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, Globe, Download, FileText, ShieldCheck, Info, TimerIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from "@/hooks/use-toast";


interface EventDetails {
  name: string;
  utcStart: DateTime;
  originalZone: string;
  durationHours: number;
  durationMinutes: number;
  description?: string;
}

const ViewEventContent = () => {
  const searchParams = useSearchParams();
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
  const [viewerLocalStartTime, setViewerLocalStartTime] = useState<string | null>(null);
  const [viewerLocalEndTime, setViewerLocalEndTime] = useState<string | null>(null);
  const [originalEventStartTime, setOriginalEventStartTime] = useState<string | null>(null);
  const [originalEventEndTime, setOriginalEventEndTime] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewerTimeZone, setViewerTimeZone] = useState<string>('');
  const { toast } = useToast();
  const eventCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const name = searchParams.get('name');
    const dtISO = searchParams.get('dt'); // UTC ISO String
    const origZone = searchParams.get('origZone');
    const durHStr = searchParams.get('durH');
    const durMStr = searchParams.get('durM');
    const desc = searchParams.get('desc');

    if (typeof window !== 'undefined') {
      setViewerTimeZone(DateTime.local().zoneName || 'your local timezone');
    }

    if (!name || !dtISO || !origZone || durHStr === null || durMStr === null) {
      setError("Event details are missing or invalid in the link. Required: name, dt, origZone, durH, durM.");
      return;
    }

    const durationHours = parseInt(durHStr, 10);
    const durationMinutes = parseInt(durMStr, 10);

    if (isNaN(durationHours) || isNaN(durationMinutes) || durationHours < 0 || durationMinutes < 0 || durationMinutes >= 60 || (durationHours === 0 && durationMinutes === 0)) {
        setError("Invalid event duration in link.");
        return;
    }

    try {
      const utcStart = DateTime.fromISO(dtISO, { zone: 'utc' });
      if (!utcStart.isValid) {
        setError(`Invalid event date/time in link. Reason: ${utcStart.invalidReason || 'Unknown'}`);
        return;
      }
      
      const eventDuration = Duration.fromObject({ hours: durationHours, minutes: durationMinutes });
      const utcEnd = utcStart.plus(eventDuration);

      setEventDetails({ 
        name, 
        utcStart, 
        originalZone: origZone,
        durationHours,
        durationMinutes,
        description: desc || undefined 
      });

      const viewerLocalDtStart = utcStart.setZone(DateTime.local().zoneName);
      const viewerLocalDtEnd = utcEnd.setZone(DateTime.local().zoneName);
      setViewerLocalStartTime(viewerLocalDtStart.toFormat("DDDD, HH:mm"));
      setViewerLocalEndTime(viewerLocalDtEnd.toFormat("HH:mm (ZZZZ)"));
      
      const originalLocalDtStart = utcStart.setZone(origZone);
      const originalLocalDtEnd = utcEnd.setZone(origZone);
      setOriginalEventStartTime(originalLocalDtStart.toFormat("DDDD, HH:mm"));
      setOriginalEventEndTime(originalLocalDtEnd.toFormat("HH:mm (ZZZZ)"));

    } catch (e) {
      console.error("Error parsing event details:", e);
      setError("Could not load event details from the link.");
    }
  }, [searchParams]);

  const generateICSData = () => {
    if (!eventDetails) return null;
    const { name, utcStart, durationHours, durationMinutes, description } = eventDetails;
    const eventDuration = Duration.fromObject({ hours: durationHours, minutes: durationMinutes });
    const utcEnd = utcStart.plus(eventDuration); 

    const formatDateForICS = (dt: DateTime) => dt.toFormat("yyyyMMdd'T'HHmmss'Z'");

    const uid = `chronosync-${utcStart.toMillis()}@chronosync.app`; 

    let icsContentArray = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ChronoSync//EventScheduler//EN',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${DateTime.now().toUTC().toFormat("yyyyMMdd'T'HHmmss'Z'")}`,
      `DTSTART:${formatDateForICS(utcStart)}`,
      `DTEND:${formatDateForICS(utcEnd)}`,
      `SUMMARY:${name}`,
    ];
    if (description) {
        // Escape special characters for ICS description
        const escapedDescription = description
            .replace(/\\/g, '\\\\')
            .replace(/;/g, '\\;')
            .replace(/,/g, '\\,')
            .replace(/\n/g, '\\n');
        icsContentArray.push(`DESCRIPTION:${escapedDescription}`);
    }
    icsContentArray.push(
      'END:VEVENT',
      'END:VCALENDAR'
    );

    return encodeURIComponent(icsContentArray.join('\r\n'));
  };

  const googleCalendarLink = () => {
    if (!eventDetails) return "#";
    const { name, utcStart, durationHours, durationMinutes, description, originalZone } = eventDetails;
    const eventDuration = Duration.fromObject({ hours: durationHours, minutes: durationMinutes });
    const utcEnd = utcStart.plus(eventDuration);

    const formatForGoogle = (dt: DateTime) => dt.toFormat("yyyyMMdd'T'HHmmss'Z'");
    
    let detailsContent = `Event scheduled via ChronoSync.`;
    if (originalEventStartTime) {
      detailsContent += `\nOriginal time in ${originalZone}: ${originalEventStartTime.split(', ')[1]} - ${originalEventEndTime?.split(' (')[0] || ''}`;
    }
    if (description) {
        detailsContent += `\n\nDescription:\n${description}`;
    }


    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: name,
      dates: `${formatForGoogle(utcStart)}/${formatForGoogle(utcEnd)}`,
      details: detailsContent,
      ctz: 'UTC' 
    });
    return `https://www.google.com/calendar/render?${params.toString()}`;
  };

  const handleDownloadPdf = async () => {
    if (!eventCardRef.current) {
      toast({
        title: "Error",
        description: "Could not find event content to export.",
        variant: "destructive",
      });
      return;
    }
    if (!eventDetails) {
        toast({
            title: "Error",
            description: "Event details not loaded yet.",
            variant: "destructive",
        });
        return;
    }

    toast({
      title: "Generating PDF...",
      description: "Please wait a moment.",
    });

    try {
      const canvas = await html2canvas(eventCardRef.current, {
        scale: 2, 
        useCORS: true, 
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px', 
        format: [canvas.width, canvas.height] 
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${eventDetails.name.replace(/\s+/g, '_').toLowerCase()}_event_details.pdf`);
      
      toast({
        title: "PDF Generated!",
        description: "Your event details PDF has been downloaded.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "PDF Generation Failed",
        description: "There was an error creating the PDF. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  if (error) {
    return (
      <Alert variant="destructive" className="my-8">
        <Info className="h-4 w-4" />
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
         <Skeleton className="h-10 w-full mt-2" />
      </div>
    );
  }
  
  const formattedDuration = Duration.fromObject({ hours: eventDetails.durationHours, minutes: eventDetails.durationMinutes}).toHuman({ unitDisplay: 'short' });

  return (
    <div ref={eventCardRef} className="p-2">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2">
          <CalendarDays className="h-8 w-8 text-primary" /> {eventDetails.name}
        </CardTitle>
        <CardDescription className="text-md flex flex-col items-center gap-1">
          <span>Event details shown in your local time ({viewerTimeZone}).</span>
          <span className="flex items-center gap-1 text-sm"><ShieldCheck className="h-4 w-4 text-green-600" /> This link is private; event data is in the URL, not stored by us.</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-muted rounded-lg shadow">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-1">
              <Clock className="h-5 w-5 text-accent" /> Your Local Time
            </h3>
            <p className="text-xl">
              {viewerLocalStartTime ? viewerLocalStartTime.split(', ')[1] : 'Calculating...'} - {viewerLocalEndTime ? viewerLocalEndTime.split(' (')[0] : ''}
            </p>
            <p className="text-sm text-muted-foreground">{viewerLocalStartTime ? viewerLocalStartTime.split(', ')[0] : ''} ({viewerTimeZone})</p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg shadow">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-1">
              <Globe className="h-5 w-5 text-secondary-foreground" /> Original Event Time
            </h3>
             <p className="text-xl">
                {originalEventStartTime ? originalEventStartTime.split(', ')[1] : 'Calculating...'} - {originalEventEndTime ? originalEventEndTime.split(' (')[0] : ''}
            </p>
            <p className="text-sm text-muted-foreground">{originalEventStartTime ? originalEventStartTime.split(', ')[0] : ''} ({eventDetails.originalZone})</p>
          </div>
        </div>

        <div className="p-4 bg-muted/20 rounded-lg shadow">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-1">
                <TimerIcon className="h-5 w-5 text-primary" /> Duration
            </h3>
            <p className="text-md">{formattedDuration}</p>
        </div>

        {eventDetails.description && (
            <div className="p-4 bg-muted/20 rounded-lg shadow">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-1">
                    <Info className="h-5 w-5 text-primary" /> Description
                </h3>
                <p className="text-md whitespace-pre-wrap">{eventDetails.description}</p>
            </div>
        )}


        <div className="space-y-3 pt-4">
            <h4 className="text-lg font-medium text-center mb-2">Add to Calendar / Export:</h4>
            <Button asChild variant="outline" className="w-full">
                <a href={googleCalendarLink()} target="_blank" rel="noopener noreferrer">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><path d="M8 14h.01"></path><path d="M12 14h.01"></path><path d="M16 14h.01"></path><path d="M8 18h.01"></path><path d="M12 18h.01"></path><path d="M16 18h.01"></path></svg>
                Add to Google Calendar
                </a>
            </Button>
            <Button asChild variant="outline" className="w-full">
                <a href={`data:text/calendar;charset=utf8,${generateICSData()}`} download={`${eventDetails.name.replace(/\s+/g, '_').toLowerCase()}.ics`}>
                <Download className="mr-2 h-4 w-4" />
                Download ICS File (for Outlook, Apple Calendar, etc.)
                </a>
            </Button>
            <Button variant="outline" className="w-full" onClick={handleDownloadPdf}>
                <FileText className="mr-2 h-4 w-4" />
                Download as PDF
            </Button>
        </div>

      </CardContent>
      <CardFooter className="text-xs text-muted-foreground text-center block">
        <p className="flex items-center justify-center gap-1">
            <ShieldCheck className="h-3 w-3 text-green-600" /> 
            Your privacy is respected. Event data is part of the link and not stored on our servers.
        </p>
      </CardFooter>
    </div>
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
      <Skeleton className="h-16 w-full mt-4" /> {/* Placeholder for duration */}
      <Skeleton className="h-20 w-full mt-2" /> {/* Placeholder for description */}
      <div className="space-y-3 pt-4">
        <Skeleton className="h-6 w-1/3 mx-auto mb-2" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </CardContent>
     <CardFooter className="text-xs text-muted-foreground text-center block">
        <Skeleton className="h-3 w-3/4 mx-auto" />
    </CardFooter>
  </>
);

