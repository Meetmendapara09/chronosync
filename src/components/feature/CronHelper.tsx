
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
// Button component is not used currently, can be removed if not planned for future
// import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Settings2, CalendarClock, Info, CircleHelp } from "lucide-react";
import { timeZoneOptions } from '@/lib/data/timezones';
import { DateTime } from 'luxon';
import * as cronParser from 'cron-parser'; // Changed import
import cronstrue from 'cronstrue';

interface CronParts {
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
}

const CronHelper = () => {
  const [cronParts, setCronParts] = useState<CronParts>({
    minute: '*',
    hour: '*',
    dayOfMonth: '*',
    month: '*',
    dayOfWeek: '*',
  });
  const [fullCronExpression, setFullCronExpression] = useState<string>('* * * * *');
  const [selectedTimeZone, setSelectedTimeZone] = useState<string>('');
  const [humanReadable, setHumanReadable] = useState<string>('');
  const [nextRuns, setNextRuns] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const sortedTimeZones = useMemo(() =>
    [...timeZoneOptions].sort((a, b) => a.label.localeCompare(b.label)),
  []);

  useEffect(() => {
    setSelectedTimeZone(DateTime.local().zoneName || 'Etc/UTC');
  }, []);

  // Update full expression when parts change
  useEffect(() => {
    const { minute, hour, dayOfMonth, month, dayOfWeek } = cronParts;
    setFullCronExpression(`${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`);
  }, [cronParts]);

  // Update parts when full expression changes
  const handleFullCronChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFullExpression = e.target.value;
    setFullCronExpression(newFullExpression);
    const parts = newFullExpression.split(' ');
    if (parts.length === 5) {
      setCronParts({
        minute: parts[0],
        hour: parts[1],
        dayOfMonth: parts[2],
        month: parts[3],
        dayOfWeek: parts[4],
      });
    }
  };

  const handlePartChange = (part: keyof CronParts, value: string) => {
    setCronParts(prev => ({ ...prev, [part]: value }));
  };

  const handleGenerateDetails = useCallback(() => {
    setError(null);
    setHumanReadable('');
    setNextRuns([]);

    if (!fullCronExpression || fullCronExpression.split(' ').length !== 5) {
      setError("Cron expression must have 5 parts (e.g., '* * * * *').");
      return;
    }
    if (!selectedTimeZone) {
      setError("Please select a timezone.");
      return;
    }

    try {
      // Generate human-readable string
      const readableStr = cronstrue.toString(fullCronExpression, { use24HourTimeFormat: true, verbose: true });
      setHumanReadable(readableStr);

      // Calculate next 5 run times
      const options = {
        tz: selectedTimeZone,
        iterator: true
      };
      const interval = cronParser.parseExpression(fullCronExpression, options); // Use imported parseExpression from namespace
      const runs: string[] = [];
      for (let i = 0; i < 5; i++) {
        const next = interval.next() as unknown as { value: { toDate: () => Date } }; // Type assertion needed for iterator value
        if (next.value) {
          runs.push(DateTime.fromJSDate(next.value.toDate()).setZone(selectedTimeZone).toFormat('yyyy-MM-dd HH:mm:ss ZZZZ'));
        } else {
          break; // No more occurrences
        }
      }
      setNextRuns(runs);
       if (runs.length === 0) {
        setHumanReadable(prev => prev + (prev ? " " : "") + "This expression may not have future occurrences or is invalid for the selected timezone.");
      }


    } catch (e: any) {
      console.error("Cron processing error:", e);
      setError(`Error processing cron expression: ${e.message}. Please ensure it's a valid cron string.`);
      setHumanReadable('');
      setNextRuns([]);
    }
  }, [fullCronExpression, selectedTimeZone]);

  useEffect(() => {
    if (fullCronExpression.split(' ').length === 5 && selectedTimeZone) {
      handleGenerateDetails();
    }
  }, [fullCronExpression, selectedTimeZone, handleGenerateDetails]);


  const cronPartLabels: { key: keyof CronParts; label: string; placeholder: string }[] = [
    { key: 'minute', label: 'Minute', placeholder: '0-59' },
    { key: 'hour', label: 'Hour', placeholder: '0-23' },
    { key: 'dayOfMonth', label: 'Day of Month', placeholder: '1-31' },
    { key: 'month', label: 'Month', placeholder: '1-12 or JAN-DEC' },
    { key: 'dayOfWeek', label: 'Day of Week', placeholder: '0-6 or SUN-SAT' },
  ];

  return (
    <div className="flex justify-center py-8">
      <Card className="w-full max-w-3xl shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2">
            <Settings2 className="h-8 w-8 text-primary" /> Cron Expression Helper
          </CardTitle>
          <CardDescription className="text-md">
            Build, visualize, and understand cron expressions for task scheduling.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4 p-4 border rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold text-accent mb-3">Build Your Cron Expression</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {cronPartLabels.map(({ key, label, placeholder }) => (
                <div key={key} className="space-y-1">
                  <Label htmlFor={`cron-${key}`}>{label}</Label>
                  <Input
                    id={`cron-${key}`}
                    value={cronParts[key]}
                    onChange={(e) => handlePartChange(key, e.target.value)}
                    placeholder={placeholder}
                    className="font-mono text-sm"
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-1">
              <Label htmlFor="full-cron-expression">Full Cron Expression</Label>
              <Input
                id="full-cron-expression"
                value={fullCronExpression}
                onChange={handleFullCronChange}
                placeholder="* * * * *"
                className="font-mono text-lg"
              />
            </div>
          </div>

          <div className="space-y-4 p-4 border rounded-lg shadow-sm">
             <h3 className="text-xl font-semibold text-accent mb-3">Interpretation &amp; Next Runs</h3>
            <div className="space-y-2">
                <Label htmlFor="cron-timezone">Timezone for Next Runs</Label>
                <Select value={selectedTimeZone} onValueChange={setSelectedTimeZone}>
                    <SelectTrigger id="cron-timezone">
                    <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                    {sortedTimeZones.map(tz => (
                        <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
            </div>

            {error && (
              <Alert variant="destructive" className="mt-2">
                <CircleHelp className="h-4 w-4" />
                <AlertTitle>Validation Issue</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="mt-4 p-3 bg-muted rounded-md space-y-2">
              <h4 className="font-semibold text-muted-foreground">Human-Readable Description:</h4>
              {humanReadable ? (
                 <p className="text-sm italic">{humanReadable}</p>
              ) : (
                !error && <p className="text-sm italic">Enter a valid cron expression above.</p>
              )}
            </div>

            <div className="mt-4 p-3 bg-muted rounded-md space-y-2">
              <h4 className="font-semibold text-muted-foreground">Upcoming Execution Times ({selectedTimeZone.split('/').pop()?.replace('_', ' ')} Time):</h4>
              {nextRuns.length > 0 ? (
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {nextRuns.map((run, index) => <li key={index} className="font-mono">{run}</li>)}
                </ul>
              ) : (
                 !error && <p className="text-sm italic">Next run times will appear here.</p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground text-center block">
          <p>Standard cron syntax: Minute Hour DayOfMonth Month DayOfWeek. <br/> Use '*' for any value, '*/5' for every 5, '1-10' for a range, '1,2,3' for specific values.</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CronHelper;

