
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Plane, ArrowRight, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { DateTime, DurationObjectUnits } from 'luxon';
import { format as formatDateFns } from 'date-fns';
import { timeZoneOptions } from '@/lib/data/timezones';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface TravelResult {
  departureDateTime: string;
  departureZoneLabel: string;
  arrivalDateTime: string;
  arrivalZoneLabel: string;
  timeAdjustmentInfo: string;
  flightDurationFormatted: string;
}

const TravelTimeAssistant = () => {
  const [departureZone, setDepartureZone] = useState<string>('America/New_York');
  const [arrivalZone, setArrivalZone] = useState<string>('Europe/London');
  const [departureDate, setDepartureDate] = useState<Date | undefined>();
  const [departureTime, setDepartureTime] = useState<string>('');
  const [flightHours, setFlightHours] = useState<string>('8');
  const [flightMinutes, setFlightMinutes] = useState<string>('0');
  
  const [result, setResult] = useState<TravelResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sortedTimeZones = [...timeZoneOptions].sort((a, b) => a.label.localeCompare(b.label));

  useEffect(() => {
    // Initialize date and time on client-side to avoid hydration issues
    const now = DateTime.now().setZone(departureZone);
    setDepartureDate(now.toJSDate());
    setDepartureTime(now.toFormat('HH:mm'));
  }, [departureZone]);


  const handleCalculate = () => {
    setError(null);
    setResult(null);

    if (!departureDate || !departureTime || departureZone === arrivalZone) {
      setError('Please select a valid departure date, time, and ensure departure and arrival zones are different.');
      return;
    }

    const hours = parseInt(flightHours, 10);
    const minutes = parseInt(flightMinutes, 10);

    if (isNaN(hours) || isNaN(minutes) || hours < 0 || minutes < 0 || minutes >= 60) {
      setError('Please enter a valid flight duration (non-negative hours, minutes 0-59).');
      return;
    }

    try {
      const departureDateString = DateTime.fromJSDate(departureDate).toISODate();
      if (!departureDateString) {
        setError('Invalid departure date selected.');
        return;
      }
      
      const departureDateTime = DateTime.fromISO(`${departureDateString}T${departureTime}`, { zone: departureZone });

      if (!departureDateTime.isValid) {
        setError(`Invalid departure date or time for ${departureZone}. Reason: ${departureDateTime.invalidReason}`);
        return;
      }

      const flightDuration: DurationObjectUnits = { hours, minutes };
      const arrivalDateTimeUTC = departureDateTime.plus(flightDuration);
      const arrivalDateTimeInArrivalZone = arrivalDateTimeUTC.setZone(arrivalZone);

      if (!arrivalDateTimeInArrivalZone.isValid) {
        setError(`Could not calculate arrival time in ${arrivalZone}. Reason: ${arrivalDateTimeInArrivalZone.invalidReason}`);
        return;
      }

      // Time adjustment calculation
      const departureOffsetMinutes = departureDateTime.offset;
      const arrivalOffsetMinutes = arrivalDateTimeInArrivalZone.offset;
      const offsetDiffMinutes = arrivalOffsetMinutes - departureOffsetMinutes;
      const offsetDiffHours = offsetDiffMinutes / 60;
      
      let timeAdjustmentInfo = '';
      if (offsetDiffHours === 0) {
        timeAdjustmentInfo = 'No significant time adjustment due to timezone change (excluding flight time).';
      } else if (offsetDiffHours > 0) {
        timeAdjustmentInfo = `You will effectively "lose" ${Math.abs(offsetDiffHours)} hour(s) due to the time zone change.`;
      } else {
        timeAdjustmentInfo = `You will effectively "gain" ${Math.abs(offsetDiffHours)} hour(s) due to the time zone change.`;
      }
      
      const departureZoneData = timeZoneOptions.find(tz => tz.value === departureZone);
      const arrivalZoneData = timeZoneOptions.find(tz => tz.value === arrivalZone);

      setResult({
        departureDateTime: departureDateTime.toFormat("DDDD, HH:mm"),
        departureZoneLabel: departureZoneData?.label || departureZone,
        arrivalDateTime: arrivalDateTimeInArrivalZone.toFormat("DDDD, HH:mm"),
        arrivalZoneLabel: arrivalZoneData?.label || arrivalZone,
        timeAdjustmentInfo,
        flightDurationFormatted: `${hours}h ${minutes}m`
      });

    } catch (e: any) {
      console.error("Calculation error:", e);
      setError(`An unexpected error occurred: ${e.message}`);
    }
  };

  return (
    <div className="flex justify-center py-8">
      <Card className="w-full max-w-3xl shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2">
            <Plane className="h-8 w-8 text-primary" /> Travel Time Zone Assistant
          </CardTitle>
          <CardDescription className="text-md">
            Plan your journey across time zones. Input your flight details to see local departure/arrival times and time adjustments.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Departure Section */}
          <div className="p-4 border rounded-lg shadow-sm space-y-4">
            <h3 className="text-lg font-semibold text-accent">Departure Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="departure-zone">Departure Zone</Label>
                <Select value={departureZone} onValueChange={setDepartureZone}>
                  <SelectTrigger id="departure-zone"><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-60">{sortedTimeZones.map(tz => <SelectItem key={`dep-${tz.value}`} value={tz.value}>{tz.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="departure-date">Departure Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button id="departure-date" variant="outline" className={cn("w-full justify-start text-left font-normal", !departureDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {departureDate ? formatDateFns(departureDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={departureDate} onSelect={setDepartureDate} initialFocus /></PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="departure-time">Departure Time</Label>
              <Input id="departure-time" type="time" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} />
            </div>
          </div>

          {/* Arrival Section */}
          <div className="p-4 border rounded-lg shadow-sm space-y-4">
            <h3 className="text-lg font-semibold text-accent">Arrival Details</h3>
            <div className="space-y-2">
                <Label htmlFor="arrival-zone">Arrival Zone</Label>
                <Select value={arrivalZone} onValueChange={setArrivalZone}>
                  <SelectTrigger id="arrival-zone"><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-60">{sortedTimeZones.map(tz => <SelectItem key={`arr-${tz.value}`} value={tz.value}>{tz.label}</SelectItem>)}</SelectContent>
                </Select>
            </div>
          </div>

          {/* Flight Duration Section */}
          <div className="p-4 border rounded-lg shadow-sm space-y-4">
            <h3 className="text-lg font-semibold text-accent">Flight Duration</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="flight-hours">Hours</Label>
                <Input id="flight-hours" type="number" value={flightHours} onChange={(e) => setFlightHours(e.target.value)} placeholder="e.g., 8" min="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="flight-minutes">Minutes</Label>
                <Input id="flight-minutes" type="number" value={flightMinutes} onChange={(e) => setFlightMinutes(e.target.value)} placeholder="e.g., 30" min="0" max="59" />
              </div>
            </div>
          </div>
          
          <Button onClick={handleCalculate} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-3">
            Calculate Travel Times
          </Button>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="mt-6 p-6 bg-muted rounded-lg space-y-4 shadow-inner">
              <h3 className="text-xl font-bold text-center text-primary mb-3">Travel Summary</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center text-center md:text-left">
                <div className="md:col-span-1">
                  <p className="font-semibold text-lg">{result.departureZoneLabel}</p>
                  <p className="text-2xl">{result.departureDateTime.split(', ')[1]}</p>
                  <p className="text-sm text-muted-foreground">{result.departureDateTime.split(', ')[0]}</p>
                </div>
                <div className="flex flex-col items-center md:col-span-1">
                   <ArrowRight className="h-8 w-8 text-muted-foreground my-2 md:my-0 transform md:rotate-0 rotate-90" />
                   <p className="text-sm font-medium mt-1">Flight: {result.flightDurationFormatted}</p>
                </div>
                <div className="md:col-span-1 md:text-right">
                  <p className="font-semibold text-lg">{result.arrivalZoneLabel}</p>
                  <p className="text-2xl">{result.arrivalDateTime.split(', ')[1]}</p>
                  <p className="text-sm text-muted-foreground">{result.arrivalDateTime.split(', ')[0]}</p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t text-center">
                <p className="font-medium text-foreground">{result.timeAdjustmentInfo}</p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground text-center block">
          <p>All times are calculated based on your inputs. Ensure accuracy of dates, times, and flight duration. Timezone data powered by Luxon.</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TravelTimeAssistant;
