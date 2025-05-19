
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateTime } from 'luxon';
import { ArrowRightLeft } from 'lucide-react';

const timeZoneOptions = [
  // North America
  { value: 'America/New_York', label: 'New York (EST/EDT)' },
  { value: 'America/Chicago', label: 'Chicago (CST/CDT)' },
  { value: 'America/Denver', label: 'Denver (MST/MDT)' },
  { value: 'America/Phoenix', label: 'Phoenix (MST)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)' },
  { value: 'America/Anchorage', label: 'Anchorage (AKST/AKDT)' },
  { value: 'America/Honolulu', label: 'Honolulu (HST)' },
  { value: 'America/Toronto', label: 'Toronto (EST/EDT)' },
  { value: 'America/Vancouver', label: 'Vancouver (PST/PDT)' },
  { value: 'America/Mexico_City', label: 'Mexico City (CST/CDT)' },
  { value: 'America/Edmonton', label: 'Edmonton (MST/MDT)' },
  { value: 'America/Winnipeg', label: 'Winnipeg (CST/CDT)' },
  { value: 'America/Halifax', label: 'Halifax (AST/ADT)' },
  // South America
  { value: 'America/Sao_Paulo', label: 'São Paulo (BRT/BRST)' },
  { value: 'America/Buenos_Aires', label: 'Buenos Aires (ART)' },
  { value: 'America/Bogota', label: 'Bogotá (COT)' },
  { value: 'America/Lima', label: 'Lima (PET)' },
  { value: 'America/Caracas', label: 'Caracas (VET)' },
  { value: 'America/Santiago', label: 'Santiago (CLT/CLST)' },
  // Europe
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
  { value: 'Europe/Madrid', label: 'Madrid (CET/CEST)' },
  { value: 'Europe/Rome', label: 'Rome (CET/CEST)' },
  { value: 'Europe/Moscow', label: 'Moscow (MSK)' },
  { value: 'Europe/Istanbul', label: 'Istanbul (TRT)' },
  { value: 'Europe/Kiev', label: 'Kyiv (EET/EEST)' },
  { value: 'Europe/Lisbon', label: 'Lisbon (WET/WEST)' },
  { value: 'Europe/Athens', label: 'Athens (EET/EEST)' },
  // Africa
  { value: 'Africa/Cairo', label: 'Cairo (EET)' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg (SAST)' },
  { value: 'Africa/Nairobi', label: 'Nairobi (EAT)' },
  { value: 'Africa/Lagos', label: 'Lagos (WAT)' },
  { value: 'Africa/Casablanca', label: 'Casablanca (WEST/WET)' },
  { value: 'Africa/Algiers', label: 'Algiers (CET)' },
  // Asia
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Karachi', label: 'Karachi (PKT)' },
  { value: 'Asia/Kolkata', label: 'Kolkata (IST)' },
  { value: 'Asia/Dhaka', label: 'Dhaka (BST)' },
  { value: 'Asia/Bangkok', label: 'Bangkok (ICT)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong (HKT)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Seoul', label: 'Seoul (KST)' },
  { value: 'Asia/Jerusalem', label: 'Jerusalem (IST/IDT)' },
  { value: 'Asia/Riyadh', label: 'Riyadh (AST)' },
  { value: 'Asia/Tehran', label: 'Tehran (IRST/IRDT)' },
  // Australia & Oceania
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
  { value: 'Australia/Melbourne', label: 'Melbourne (AEST/AEDT)' },
  { value: 'Australia/Perth', label: 'Perth (AWST)' },
  { value: 'Australia/Adelaide', label: 'Adelaide (ACST/ACDT)' },
  { value: 'Australia/Brisbane', label: 'Brisbane (AEST)' },
  { value: 'Pacific/Auckland', label: 'Auckland (NZST/NZDT)' },
  { value: 'Pacific/Fiji', label: 'Fiji (FJT)' },
  { value: 'Pacific/Honolulu', label: 'Honolulu (HST)' }, // Repeated for clarity, same as America/Honolulu
  // UTC
  { value: 'UTC', label: 'UTC' },
  { value: 'GMT', label: 'GMT (Greenwich Mean Time)'}
];


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
  };

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
                <SelectContent>
                  {timeZoneOptions.map(tz => (
                    <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
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
                <SelectContent>
                  {timeZoneOptions.map(tz => (
                    <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
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
          <p>Current time is based on your system settings or the selected 'From' time zone.</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TimeZoneConverter;
