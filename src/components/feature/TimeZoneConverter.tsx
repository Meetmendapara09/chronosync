
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateTime } from 'luxon';
import { ArrowRightLeft } from 'lucide-react';
import { timeZoneOptions } from '@/lib/data/timezones';


const TimeZoneConverter = () => {
  const [fromTimeZone, setFromTimeZone] = useState<string>('America/New_York');
  const [toTimeZone, setToTimeZone] = useState<string>('Europe/London');
  const [inputTime, setInputTime] = useState<string>('');
  const [convertedTime, setConvertedTime] = useState<string | null>(null);
  const [currentDateTime, setCurrentDateTime] = useState<string>('');

  useEffect(() => {
    const now = DateTime.now().setZone(fromTimeZone);
    setInputTime(now.toFormat('HH:mm'));
    setCurrentDateTime(now.toFormat('yyyy-MM-dd'));
  }, [fromTimeZone]);

  const handleConvert = () => {
    if (!inputTime || !currentDateTime) {
      setConvertedTime('Please enter a valid date and time.');
      return;
    }

    try {
      const dateTimeStr = `${currentDateTime}T${inputTime}`;
      const fromDt = DateTime.fromISO(dateTimeStr, { zone: fromTimeZone });

      if (!fromDt.isValid) {
        setConvertedTime('Invalid input time or date format.');
        return;
      }

      const toDt = fromDt.setZone(toTimeZone);
      setConvertedTime(toDt.toFormat('HH:mm, MMM dd, yyyy ZZZZ'));
    } catch (error) {
      console.error("Conversion error:", error);
      setConvertedTime('Error during conversion.');
    }
  };

  const handleSwapTimeZones = () => {
    setFromTimeZone(toTimeZone);
    setToTimeZone(fromTimeZone);
    // Optionally, re-trigger conversion or clear results
    setConvertedTime(null); 
    // Re-initialize current date/time based on the new fromTimeZone
    const now = DateTime.now().setZone(toTimeZone); // toTimeZone is the new fromTimeZone
    setInputTime(now.toFormat('HH:mm'));
    setCurrentDateTime(now.toFormat('yyyy-MM-dd'));
  };
  
  const sortedTimeZones = [...timeZoneOptions].sort((a, b) => a.label.localeCompare(b.label));

  return (
    <div className="flex justify-center py-8">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Time Zone Converter</CardTitle>
          <CardDescription className="text-md">
            Convert time across different time zones seamlessly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="current-date">Date</Label>
              <Input 
                id="current-date" 
                type="date" 
                value={currentDateTime}
                onChange={(e) => setCurrentDateTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="input-time">Time</Label>
              <Input 
                id="input-time" 
                type="time" 
                value={inputTime}
                onChange={(e) => setInputTime(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-2 w-full md:w-2/5">
              <Label htmlFor="from-timezone">From Time Zone</Label>
              <Select value={fromTimeZone} onValueChange={setFromTimeZone}>
                <SelectTrigger id="from-timezone">
                  <SelectValue placeholder="Select from time zone" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {sortedTimeZones.map(tz => (
                    <SelectItem key={`from-${tz.value}`} value={tz.value}>{tz.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button variant="ghost" size="icon" onClick={handleSwapTimeZones} className="mt-4 md:mt-6" aria-label="Swap time zones">
              <ArrowRightLeft className="h-5 w-5 text-primary" />
            </Button>

            <div className="space-y-2 w-full md:w-2/5">
              <Label htmlFor="to-timezone">To Time Zone</Label>
              <Select value={toTimeZone} onValueChange={setToTimeZone}>
                <SelectTrigger id="to-timezone">
                  <SelectValue placeholder="Select to time zone" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {sortedTimeZones.map(tz => (
                    <SelectItem key={`to-${tz.value}`} value={tz.value}>{tz.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button onClick={handleConvert} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            Convert Time
          </Button>

          {convertedTime && (
            <div className="mt-6 p-4 bg-muted rounded-md text-center">
              <p className="text-sm text-muted-foreground">Converted Time:</p>
              <p className="text-xl font-semibold text-accent">{convertedTime}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground text-center block">
          <p>Time conversion is performed using Luxon and respects Daylight Saving Time (DST) rules for the selected date.</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TimeZoneConverter;
