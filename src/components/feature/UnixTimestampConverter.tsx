
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { DateTime } from 'luxon';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react'; // Using Terminal as an icon for dev tool

const UnixTimestampConverter = () => {
  // Timestamp to Date/Time states
  const [timestampInput, setTimestampInput] = useState<string>('');
  const [timestampUnit, setTimestampUnit] = useState<'seconds' | 'milliseconds'>('seconds');
  const [humanReadableResult, setHumanReadableResult] = useState<{ utc: string; local: string } | null>(null);
  const [conversionErrorTsToDate, setConversionErrorTsToDate] = useState<string | null>(null);

  // Date/Time to Timestamp states
  const [dateInput, setDateInput] = useState<string>(DateTime.now().toISODate() || '');
  const [timeInput, setTimeInput] = useState<string>(DateTime.now().toFormat('HH:mm'));
  const [timestampResult, setTimestampResult] = useState<{ seconds: number; milliseconds: number } | null>(null);
  const [conversionErrorDateToTs, setConversionErrorDateToTs] = useState<string | null>(null);
  const [localTimeZone, setLocalTimeZone] = useState<string>('');

  useState(() => {
    setLocalTimeZone(DateTime.local().zoneName || 'Unknown');
  });


  const handleConvertToDateTime = () => {
    setConversionErrorTsToDate(null);
    setHumanReadableResult(null);
    const tsNumber = Number(timestampInput);
    if (isNaN(tsNumber) || timestampInput.trim() === '') {
      setConversionErrorTsToDate('Invalid timestamp. Please enter a number.');
      return;
    }

    try {
      let dt: DateTime;
      if (timestampUnit === 'seconds') {
        dt = DateTime.fromSeconds(tsNumber);
      } else {
        dt = DateTime.fromMillis(tsNumber);
      }

      if (!dt.isValid) {
        setConversionErrorTsToDate(dt.invalidReason || 'Invalid timestamp value.');
        return;
      }

      setHumanReadableResult({
        utc: dt.toUTC().toFormat("yyyy-MM-dd HH:mm:ss 'UTC'"),
        local: dt.toLocal().toFormat("yyyy-MM-dd HH:mm:ss ZZZZ"),
      });
    } catch (error) {
      setConversionErrorTsToDate('Error during conversion.');
      console.error(error);
    }
  };

  const handleConvertToTimestamp = () => {
    setConversionErrorDateToTs(null);
    setTimestampResult(null);
    if (!dateInput || !timeInput) {
      setConversionErrorDateToTs('Please select a valid date and time.');
      return;
    }

    try {
      const dt = DateTime.fromISO(`${dateInput}T${timeInput}`, { zone: 'local' });

      if (!dt.isValid) {
        setConversionErrorDateToTs(dt.invalidReason || 'Invalid date or time input.');
        return;
      }
      
      setTimestampResult({
        seconds: dt.toSeconds(),
        milliseconds: dt.toMillis(),
      });
    } catch (error) {
      setConversionErrorDateToTs('Error during conversion.');
      console.error(error);
    }
  };

  return (
    <div className="flex justify-center py-8">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Unix Timestamp Converter</CardTitle>
          <CardDescription className="text-md">
            Convert Unix timestamps to human-readable dates and vice-versa.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Section 1: Unix Timestamp to Date/Time */}
          <div className="space-y-4 p-4 border rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold text-primary">Timestamp to Date/Time</h3>
            <div className="space-y-2">
              <Label htmlFor="timestamp-input">Unix Timestamp</Label>
              <Input
                id="timestamp-input"
                type="text" // Changed to text to allow for larger numbers and easier validation
                value={timestampInput}
                onChange={(e) => setTimestampInput(e.target.value)}
                placeholder="e.g., 1678886400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timestamp-unit">Unit</Label>
              <Select value={timestampUnit} onValueChange={(value) => setTimestampUnit(value as 'seconds' | 'milliseconds')}>
                <SelectTrigger id="timestamp-unit">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seconds">Seconds</SelectItem>
                  <SelectItem value="milliseconds">Milliseconds</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleConvertToDateTime} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
              Convert to Date/Time
            </Button>
            {conversionErrorTsToDate && (
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Conversion Error</AlertTitle>
                <AlertDescription>{conversionErrorTsToDate}</AlertDescription>
              </Alert>
            )}
            {humanReadableResult && (
              <div className="mt-4 p-3 bg-muted rounded-md space-y-1">
                <p className="text-sm font-medium"><strong>UTC:</strong> {humanReadableResult.utc}</p>
                <p className="text-sm font-medium"><strong>Local:</strong> {humanReadableResult.local}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Section 2: Date/Time to Unix Timestamp */}
          <div className="space-y-4 p-4 border rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold text-primary">Date/Time to Unix Timestamp</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date-input">Date</Label>
                <Input
                  id="date-input"
                  type="date"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time-input">Time</Label>
                <Input
                  id="time-input"
                  type="time"
                  value={timeInput}
                  step="1" // Allow seconds input
                  onChange={(e) => setTimeInput(e.target.value)}
                />
              </div>
            </div>
             <p className="text-xs text-muted-foreground">
                Input uses your local timezone: {localTimeZone}
            </p>
            <Button onClick={handleConvertToTimestamp} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
              Convert to Unix Timestamp
            </Button>
            {conversionErrorDateToTs && (
               <Alert variant="destructive">
                 <Terminal className="h-4 w-4" />
                 <AlertTitle>Conversion Error</AlertTitle>
                 <AlertDescription>{conversionErrorDateToTs}</AlertDescription>
               </Alert>
            )}
            {timestampResult && (
              <div className="mt-4 p-3 bg-muted rounded-md space-y-1">
                <p className="text-sm font-medium"><strong>Seconds:</strong> {timestampResult.seconds}</p>
                <p className="text-sm font-medium"><strong>Milliseconds:</strong> {timestampResult.milliseconds}</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground text-center block">
          <p>All date/time conversions are handled using Luxon.</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default UnixTimestampConverter;
