
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Settings2, CalendarClock, Info, CircleHelp } from "lucide-react";
import { timeZoneOptions } from '@/lib/data/timezones';
import { DateTime } from 'luxon';

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

  // Basic update of parts when full expression changes (can be enhanced with validation)
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
    } else {
      // Could add validation/error feedback here
    }
  };

  const handlePartChange = (part: keyof CronParts, value: string) => {
    setCronParts(prev => ({ ...prev, [part]: value }));
  };

  const handleGenerateDetails = () => {
    setError(null);
    setHumanReadable('');
    setNextRuns([]);

    // Placeholder for actual cron parsing and generation logic
    // This is where libraries like 'cron-parser' and 'cronstrue' would be used.
    setHumanReadable(
      "Human-readable description will appear here. (Requires 'cronstrue' library integration)"
    );
    
    const placeholderRuns = [];
    if (selectedTimeZone) {
        try {
            let baseTime = DateTime.now().setZone(selectedTimeZone);
            if (!baseTime.isValid) {
                placeholderRuns.push(`Invalid timezone selected: ${selectedTimeZone}`);
            } else {
                for (let i = 1; i <= 5; i++) {
                    placeholderRuns.push(
                        `Next run ${i} (example): ${baseTime.plus({ minutes: i * 5 }).toFormat('yyyy-MM-dd HH:mm:ss ZZZZ')}`
                    );
                }
            }
        } catch (e) {
             placeholderRuns.push(`Error with timezone: ${selectedTimeZone}`);
        }
    } else {
         placeholderRuns.push("Select a timezone to see example next run times.");
    }


    setNextRuns([
      ...placeholderRuns,
      "Actual next run times require 'cron-parser' library integration.",
    ]);

    if (!fullCronExpression.match(/^(\*|([0-9,-/]+))\s+(\*|([0-9,-/]+))\s+(\*|([0-9,-/]+))\s+(\*|([0-9,-/]+|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec))\s+(\*|([0-9,-/]+|sun|mon|tue|wed|thu|fri|sat))$/i)) {
       setError("Cron expression format seems invalid. Please check standard cron syntax (5 parts). For example: * * * * * or 0 0 1 * *");
    }
  };
  
  useEffect(() => {
    if(fullCronExpression.split(' ').length === 5) {
        handleGenerateDetails();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullCronExpression, selectedTimeZone]);


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
              <Alert variant="destructive">
                <CircleHelp className="h-4 w-4" />
                <AlertTitle>Validation Issue</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="mt-4 p-3 bg-muted rounded-md space-y-2">
              <h4 className="font-semibold text-muted-foreground">Human-Readable Description:</h4>
              <p className="text-sm italic">{humanReadable || "Enter a cron expression above."}</p>
              {!humanReadable.toLowerCase().includes("require") && (
                  <Alert variant="default" className="mt-2">
                      <Info className="h-4 w-4" />
                      <AlertTitle>Note</AlertTitle>
                      <AlertDescription>
                          For accurate human-readable descriptions, integrate a library like <code className="font-mono text-xs bg-gray-200 dark:bg-gray-700 p-0.5 rounded">cronstrue</code>.
                      </AlertDescription>
                  </Alert>
              )}
            </div>

            <div className="mt-4 p-3 bg-muted rounded-md space-y-2">
              <h4 className="font-semibold text-muted-foreground">Upcoming Execution Times (Local to Selected Timezone):</h4>
              {nextRuns.length > 0 ? (
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {nextRuns.map((run, index) => <li key={index} className="font-mono">{run}</li>)}
                </ul>
              ) : (
                <p className="text-sm italic">Next run times will appear here.</p>
              )}
               {!nextRuns.some(run => run.toLowerCase().includes("require")) && nextRuns.length > 0 && (
                  <Alert variant="default" className="mt-2">
                      <Info className="h-4 w-4" />
                      <AlertTitle>Note</AlertTitle>
                      <AlertDescription>
                          For precise scheduling and calculation of next run times, integrate a library like <code className="font-mono text-xs bg-gray-200 dark:bg-gray-700 p-0.5 rounded">cron-parser</code>.
                      </AlertDescription>
                  </Alert>
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
