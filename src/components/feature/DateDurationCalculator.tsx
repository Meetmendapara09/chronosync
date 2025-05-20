
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, CalendarRange } from "lucide-react";
import { cn } from "@/lib/utils";
import { DateTime, Duration } from 'luxon';
import { format as formatDateFns } from 'date-fns';

interface DurationResult {
  years: number;
  months: number;
  weeks: number;
  days: number;
  totalDays: number;
}

const DateDurationCalculator = () => {
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [durationResult, setDurationResult] = useState<DurationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const today = new Date();
    setStartDate(today);
    setEndDate(DateTime.fromJSDate(today).plus({ days: 7 }).toJSDate());
  }, []);

  const handleCalculateDuration = () => {
    setError(null);
    setDurationResult(null);

    if (!startDate || !endDate) {
      setError("Please select both a start and an end date.");
      return;
    }

    let startDt = DateTime.fromJSDate(startDate).startOf('day');
    let endDt = DateTime.fromJSDate(endDate).startOf('day');

    if (endDt < startDt) {
      setError("End date cannot be earlier than the start date.");
      return;
    }
    if (startDt.equals(endDt)) {
        setDurationResult({ years: 0, months: 0, weeks: 0, days: 0, totalDays: 0 });
        return;
    }

    try {
      // Calculate total days first for one metric
      const totalDays = Math.floor(endDt.diff(startDt, 'days').days);

      // For a more human-readable breakdown (years, months, weeks, days)
      // Luxon's diff with multiple units can be complex for this exact breakdown.
      // A common approach is iterative or by calculating larger units first.
      
      let tempStartDate = startDt;
      let years = 0;
      let months = 0;
      let daysRemaining = totalDays;

      // Calculate years
      while(tempStartDate.plus({ years: 1 }) <= endDt) {
        tempStartDate = tempStartDate.plus({ years: 1 });
        years++;
      }

      // Calculate months
      while(tempStartDate.plus({ months: 1 }) <= endDt) {
        tempStartDate = tempStartDate.plus({ months: 1 });
        months++;
      }
      
      // Calculate remaining days for weeks and days
      daysRemaining = Math.floor(endDt.diff(tempStartDate, 'days').days);

      const weeks = Math.floor(daysRemaining / 7);
      const days = daysRemaining % 7;

      setDurationResult({
        years,
        months,
        weeks,
        days,
        totalDays
      });

    } catch (e) {
      console.error("Duration calculation error:", e);
      setError("An error occurred while calculating the duration.");
    }
  };
  
  useEffect(() => {
    if (startDate && endDate) {
        handleCalculateDuration();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  const formatResult = (result: DurationResult): string => {
    const parts: string[] = [];
    if (result.years > 0) parts.push(`${result.years} year${result.years > 1 ? 's' : ''}`);
    if (result.months > 0) parts.push(`${result.months} month${result.months > 1 ? 's' : ''}`);
    if (result.weeks > 0) parts.push(`${result.weeks} week${result.weeks > 1 ? 's' : ''}`);
    if (result.days > 0) parts.push(`${result.days} day${result.days > 1 ? 's' : ''}`);
    
    if (parts.length === 0 && result.totalDays === 0) return "0 days";
    if (parts.length === 0 && result.totalDays > 0) return `${result.totalDays} day${result.totalDays > 1 ? 's' : ''}`;

    return parts.join(', ');
  };


  return (
    <div className="flex justify-center py-8">
      <Card className="w-full max-w-xl shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2">
            <CalendarRange className="h-8 w-8 text-primary" /> Date Duration Calculator
          </CardTitle>
          <CardDescription className="text-md">
            Calculate the exact duration between two dates.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="start-date"
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? formatDateFns(startDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="end-date"
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? formatDateFns(endDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          {/* <Button onClick={handleCalculateDuration} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            Calculate Duration
          </Button> */}

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          {durationResult && !error && (
            <div className="mt-6 p-4 bg-muted rounded-md text-center space-y-2">
              <p className="text-sm text-muted-foreground">Duration:</p>
              <p className="text-2xl font-semibold text-accent">{formatResult(durationResult)}</p>
              <p className="text-sm text-muted-foreground">(Total: {durationResult.totalDays} day{durationResult.totalDays === 1 ? '' : 's'})</p>
            </div>
          )}
          {!durationResult && !error && (
            <p className="text-center text-muted-foreground">Select dates to see the duration.</p>
          )}
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground text-center block">
          <p>Calculations are inclusive of the start date and exclusive of the end date for "total days". The breakdown aims for human-readable units.</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DateDurationCalculator;
