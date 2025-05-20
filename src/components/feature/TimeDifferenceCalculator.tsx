
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateTime, Duration } from 'luxon';
import { AlertCircle, ArrowRightLeft, Clock10 } from 'lucide-react';
import { timeZoneOptions } from '@/lib/data/timezones';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ResultInfo {
  convertedDateTime: string;
  differenceString: string;
  fromZoneLabel: string;
  toZoneLabel: string;
}

const TimeDifferenceCalculator = () => {
  const [fromZone, setFromZone] = useState<string>('America/New_York');
  const [toZone, setToZone] = useState<string>('Europe/London');
  const [inputDate, setInputDate] = useState<string>('');
  const [inputTime, setInputTime] = useState<string>('');
  const [resultInfo, setResultInfo] = useState<ResultInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sortedTimeZones = [...timeZoneOptions].sort((a, b) => a.label.localeCompare(b.label));

  useEffect(() => {
    // Initialize date and time based on the current 'fromZone'
    const nowInFromZone = DateTime.now().setZone(fromZone);
    setInputDate(nowInFromZone.toISODate() || '');
    setInputTime(nowInFromZone.toFormat('HH:mm'));
    setResultInfo(null); // Clear previous results when fromZone changes
    setError(null);
  }, [fromZone]);

  const handleCalculate = useCallback(() => {
    setError(null);
    setResultInfo(null);

    if (!inputDate || !inputTime || !fromZone || !toZone) {
      setError('Please select valid dates, times, and timezones.');
      return;
    }

    try {
      const fromDateTime = DateTime.fromISO(`${inputDate}T${inputTime}`, { zone: fromZone });
      if (!fromDateTime.isValid) {
        setError(`Invalid date/time for the 'From' timezone. Reason: ${fromDateTime.invalidReason || 'Unknown'}`);
        return;
      }

      const toDateTime = fromDateTime.setZone(toZone);
      if (!toDateTime.isValid) {
        setError(`Could not convert to the 'To' timezone. Reason: ${toDateTime.invalidReason || 'Unknown'}`);
        return;
      }
      
      // Corrected calculation for 'diff'
      // The difference is based on the UTC offsets of the two timezones at that specific instant.
      const offsetDiffMinutes = toDateTime.offset - fromDateTime.offset;
      const diff: Duration = Duration.fromObject({ minutes: offsetDiffMinutes });


      let differenceString = "";
      const totalAbsoluteMinutes = Math.abs(diff.as('minutes'));
      const diffHours = Math.floor(totalAbsoluteMinutes / 60);
      const diffMinutesPart = totalAbsoluteMinutes % 60;

      const fromZoneLabel = sortedTimeZones.find(tz => tz.value === fromZone)?.label.split('(')[0].trim() || fromZone;
      const toZoneLabel = sortedTimeZones.find(tz => tz.value === toZone)?.label.split('(')[0].trim() || toZone;

      if (diff.as('milliseconds') === 0) {
        differenceString = `${toZoneLabel} is the same as ${fromZoneLabel}.`;
      } else {
        const comparison = diff.as('milliseconds') > 0 ? "ahead of" : "behind";
        let parts = [];
        if (diffHours > 0) parts.push(`${diffHours} hour${diffHours !== 1 ? 's' : ''}`);
        if (diffMinutesPart > 0) parts.push(`${diffMinutesPart} minute${diffMinutesPart !== 1 ? 's' : ''}`);
        
        if (parts.length === 0 && diff.as('milliseconds') !== 0) {
             differenceString = `${toZoneLabel} has a negligible time difference with ${fromZoneLabel}.`;
        } else {
            differenceString = `${toZoneLabel} is ${parts.join(' and ')} ${comparison} ${fromZoneLabel}.`;
        }
      }

      setResultInfo({
        convertedDateTime: toDateTime.toFormat("DDDD, HH:mm (ZZZZ)"),
        differenceString,
        fromZoneLabel,
        toZoneLabel,
      });

    } catch (e: any) {
      console.error("Calculation error:", e);
      setError(`An error occurred during calculation: ${e.message}`);
    }
  }, [inputDate, inputTime, fromZone, toZone, sortedTimeZones]);

  const handleSwapTimeZones = () => {
    const tempZone = fromZone;
    setFromZone(toZone);
    setToZone(tempZone);
    // Result will be cleared by useEffect on fromZone change
  };

  // Auto-calculate when inputs change
  useEffect(() => {
    if (inputDate && inputTime && fromZone && toZone) {
        handleCalculate();
    }
  }, [inputDate, inputTime, fromZone, toZone, handleCalculate]);


  return (
    <div className="flex justify-center py-8">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2">
            <Clock10 className="h-8 w-8 text-primary" /> Time Difference Calculator
          </CardTitle>
          <CardDescription className="text-md">
            Instantly find the time difference between two locations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="input-date">Date</Label>
              <Input 
                id="input-date" 
                type="date" 
                value={inputDate}
                onChange={(e) => setInputDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="input-time">Time (in 'From' Timezone)</Label>
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
              <Label htmlFor="from-timezone">From</Label>
              <Select value={fromZone} onValueChange={setFromZone}>
                <SelectTrigger id="from-timezone"><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-60">{sortedTimeZones.map(tz => <SelectItem key={`from-${tz.value}`} value={tz.value}>{tz.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <Button variant="ghost" size="icon" onClick={handleSwapTimeZones} className="mt-2 md:mt-6" aria-label="Swap time zones">
              <ArrowRightLeft className="h-5 w-5 text-primary" />
            </Button>

            <div className="space-y-2 w-full md:w-2/5">
              <Label htmlFor="to-timezone">To</Label>
              <Select value={toZone} onValueChange={setToZone}>
                <SelectTrigger id="to-timezone"><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-60">{sortedTimeZones.map(tz => <SelectItem key={`to-${tz.value}`} value={tz.value}>{tz.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Removed explicit calculate button to favor auto-calculation */}

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {resultInfo && !error && (
            <div className="mt-6 p-4 bg-muted rounded-lg space-y-3 shadow-inner">
              <h3 className="text-lg font-semibold text-center text-primary">Result</h3>
              <p className="text-center">
                When it's <span className="font-medium">{DateTime.fromISO(`${inputDate}T${inputTime}`).toFormat('HH:mm')}</span> on <span className="font-medium">{DateTime.fromISO(inputDate).toFormat('ccc, MMM dd')}</span> in {resultInfo.fromZoneLabel},
              </p>
              <p className="text-center text-xl font-semibold text-accent">
                it will be {resultInfo.convertedDateTime.split(' (')[0]} in {resultInfo.toZoneLabel}.
              </p>
              <p className="text-center text-md text-muted-foreground">({resultInfo.convertedDateTime.split(' (')[1].slice(0,-1)})</p>
              <p className="text-center font-medium mt-2">{resultInfo.differenceString}</p>
            </div>
          )}
          {!resultInfo && !error && (
             <div className="mt-4 p-3 text-center">
               <p className="text-sm text-muted-foreground">Enter details above to see the time difference.</p>
             </div>
           )}

        </CardContent>
        <CardFooter className="text-xs text-muted-foreground text-center block">
          <p>Calculations account for Daylight Saving Time (DST) for the selected date and timezones.</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TimeDifferenceCalculator;

