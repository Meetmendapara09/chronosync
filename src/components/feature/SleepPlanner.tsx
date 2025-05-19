
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateTime } from 'luxon';
import { Bed, AlertCircle } from 'lucide-react';
import { timeZoneOptions } from '@/lib/data/timezones';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface SleepPlanResult {
  localBedtime: string;
  localBedtimeZone: string;
  targetZoneBedtime: string;
  targetZoneWakeUpTime: string;
  targetZoneLabel: string;
}

const SleepPlanner = () => {
  const [targetWakeUpTime, setTargetWakeUpTime] = useState<string>('07:00');
  const [targetTimeZone, setTargetTimeZone] = useState<string>('America/New_York');
  const [sleepDurationHours, setSleepDurationHours] = useState<string>('8');
  const [sleepDurationMinutes, setSleepDurationMinutes] = useState<string>('0');
  
  const [result, setResult] = useState<SleepPlanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentUserTimeZone, setCurrentUserTimeZone] = useState<string>('');

  const sortedTimeZones = [...timeZoneOptions].sort((a, b) => a.label.localeCompare(b.label));

  useEffect(() => {
    setCurrentUserTimeZone(DateTime.local().zoneName || 'your local timezone');
  }, []);

  const handleCalculateSleepPlan = () => {
    setError(null);
    setResult(null);

    const hours = parseInt(targetWakeUpTime.split(':')[0]);
    const minutes = parseInt(targetWakeUpTime.split(':')[1]);

    const durationH = parseInt(sleepDurationHours, 10);
    const durationM = parseInt(sleepDurationMinutes, 10);

    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      setError('Please enter a valid target wake-up time.');
      return;
    }
    if (isNaN(durationH) || isNaN(durationM) || durationH < 0 || durationM < 0 || durationM >= 60 || (durationH === 0 && durationM === 0)) {
      setError('Please enter a valid sleep duration (e.g., 7 hours 30 minutes).');
      return;
    }
    if (!targetTimeZone) {
        setError('Please select a target time zone.');
        return;
    }

    try {
      // Use current date in the target timezone as the base for wake-up time
      // This means if it's 10 PM locally, and target is 7 AM next day in another zone, it calculates correctly.
      const nowInTargetZone = DateTime.now().setZone(targetTimeZone);
      let targetWakeUpDateTime = nowInTargetZone.set({ hour: hours, minute: minutes, second: 0, millisecond: 0 });

      // If the calculated wake-up time in target zone is in the past relative to current time in target zone, 
      // assume user means the next day's wake-up time
      if (targetWakeUpDateTime < nowInTargetZone) {
        targetWakeUpDateTime = targetWakeUpDateTime.plus({ days: 1 });
      }
      
      const targetBedtime = targetWakeUpDateTime.minus({ hours: durationH, minutes: durationM });
      
      const userLocalBedtime = targetBedtime.setZone(currentUserTimeZone);

      const targetZoneInfo = sortedTimeZones.find(tz => tz.value === targetTimeZone);

      setResult({
        localBedtime: userLocalBedtime.toFormat("ccc, MMM dd, HH:mm"),
        localBedtimeZone: currentUserTimeZone,
        targetZoneBedtime: targetBedtime.toFormat("ccc, MMM dd, HH:mm"),
        targetZoneWakeUpTime: targetWakeUpDateTime.toFormat("ccc, MMM dd, HH:mm"),
        targetZoneLabel: targetZoneInfo?.label || targetTimeZone,
      });

    } catch (e: any) {
      console.error("Sleep plan calculation error:", e);
      setError(`An unexpected error occurred during calculation: ${e.message}`);
    }
  };
  
  // Auto-calculate when inputs change
  useEffect(() => {
    if (targetWakeUpTime && targetTimeZone && sleepDurationHours && sleepDurationMinutes) {
      handleCalculateSleepPlan();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetWakeUpTime, targetTimeZone, sleepDurationHours, sleepDurationMinutes, currentUserTimeZone]);


  return (
    <div className="flex justify-center py-8">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2">
            <Bed className="h-8 w-8 text-primary" /> Sleep Planner for Time Zones
          </CardTitle>
          <CardDescription className="text-md">
            Plan your sleep schedule to align with different time zones, perfect for remote work or travel preparation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Target Wake-up Section */}
          <div className="p-4 border rounded-lg shadow-sm space-y-4">
            <h3 className="text-lg font-semibold text-accent">Target Wake-up</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="target-wakeup-time">Wake-up Time</Label>
                <Input id="target-wakeup-time" type="time" value={targetWakeUpTime} onChange={(e) => setTargetWakeUpTime(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target-timezone">Wake-up Time Zone</Label>
                <Select value={targetTimeZone} onValueChange={setTargetTimeZone}>
                  <SelectTrigger id="target-timezone"><SelectValue placeholder="Select target time zone" /></SelectTrigger>
                  <SelectContent className="max-h-60">{sortedTimeZones.map(tz => <SelectItem key={`target-${tz.value}`} value={tz.value}>{tz.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Sleep Duration Section */}
          <div className="p-4 border rounded-lg shadow-sm space-y-4">
            <h3 className="text-lg font-semibold text-accent">Desired Sleep Duration</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sleep-hours">Hours</Label>
                <Input id="sleep-hours" type="number" value={sleepDurationHours} onChange={(e) => setSleepDurationHours(e.target.value)} placeholder="e.g., 8" min="0" max="23" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sleep-minutes">Minutes</Label>
                <Input id="sleep-minutes" type="number" value={sleepDurationMinutes} onChange={(e) => setSleepDurationMinutes(e.target.value)} placeholder="e.g., 0" min="0" max="59" />
              </div>
            </div>
          </div>
          
          {/* The Button is removed as useEffect handles updates, but can be re-added if manual trigger is preferred */}
          {/* <Button onClick={handleCalculateSleepPlan} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-3">
            Calculate Sleep Plan
          </Button> */}

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && !error && (
            <div className="mt-6 p-6 bg-muted rounded-lg space-y-4 shadow-inner">
              <h3 className="text-xl font-bold text-center text-primary mb-3">Your Sleep Plan</h3>
              
              <div>
                <p className="font-medium text-foreground">To wake up at <span className="text-accent font-semibold">{result.targetZoneWakeUpTime}</span> in {result.targetZoneLabel}:</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center md:text-left">
                <div className="p-3 bg-background/50 rounded-md">
                  <p className="text-sm text-muted-foreground">Go to bed in your local time ({result.localBedtimeZone}):</p>
                  <p className="text-xl font-semibold">{result.localBedtime}</p>
                </div>
                <div className="p-3 bg-background/50 rounded-md">
                  <p className="text-sm text-muted-foreground">This corresponds to (in target zone):</p>
                  <p className="text-xl font-semibold">{result.targetZoneBedtime}</p>
                </div>
              </div>
            </div>
          )}
           {!result && !error && (
             <div className="mt-4 p-3 bg-muted rounded-md text-center">
               <p className="text-sm text-muted-foreground">Enter your sleep goals above to see your personalized plan.</p>
             </div>
           )}
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground text-center block">
          <p>All times are calculated based on your inputs and current date. Ensure your device's local time zone is set correctly for accurate local bedtime recommendations.</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SleepPlanner;
