
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { DateTime } from 'luxon';
import { format as formatDateFns } from 'date-fns';

const WorkdayCalculator = () => {
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [businessDaysToAdd, setBusinessDaysToAdd] = useState<number>(5);
  const [resultDate, setResultDate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setStartDate(new Date());
  }, []);

  const handleCalculateWorkday = () => {
    setError(null);
    setResultDate(null);

    if (!startDate || isNaN(businessDaysToAdd) || businessDaysToAdd < 0) {
      setError("Please select a valid start date and enter a non-negative number of business days.");
      return;
    }

    try {
      let currentDate = DateTime.fromJSDate(startDate);
      let daysAdded = 0;
      let actualDaysIterated = 0; // Safety break for very large inputs

      if (businessDaysToAdd === 0) {
        // If start date is a weekend, find next workday
        while (currentDate.weekday === 6 || currentDate.weekday === 7) {
          currentDate = currentDate.plus({ days: 1 });
        }
        setResultDate(currentDate.toFormat('MMMM dd, yyyy (cccc)'));
        return;
      }
      
      while (daysAdded < businessDaysToAdd && actualDaysIterated < (businessDaysToAdd * 2 + 20)) { // Safety break
        currentDate = currentDate.plus({ days: 1 });
        actualDaysIterated++;
        // Luxon weekdays: 1 (Monday) to 7 (Sunday)
        if (currentDate.weekday !== 6 && currentDate.weekday !== 7) {
          daysAdded++;
        }
      }
      
      if(daysAdded === businessDaysToAdd) {
        setResultDate(currentDate.toFormat('MMMM dd, yyyy (cccc)'));
      } else {
        setError("Could not calculate the date within a reasonable limit. Please try a smaller number of business days.");
      }

    } catch (e) {
      console.error("Workday calculation error:", e);
      setError("An error occurred during calculation.");
    }
  };

  useEffect(() => {
    if (startDate && businessDaysToAdd >= 0) {
        handleCalculateWorkday();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, businessDaysToAdd]);

  return (
    <div className="flex justify-center py-8">
      <Card className="w-full max-w-xl shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2">
            <Briefcase className="h-8 w-8 text-primary" /> Workday Calculator
          </CardTitle>
          <CardDescription className="text-md">
            Calculate a future date by adding business days (Mon-Fri).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="start-date-workday">Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="start-date-workday"
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
            <Label htmlFor="business-days">Business Days to Add</Label>
            <Input
              id="business-days"
              type="number"
              value={businessDaysToAdd}
              onChange={(e) => setBusinessDaysToAdd(parseInt(e.target.value, 10) || 0)}
              min="0"
              placeholder="e.g., 5"
            />
          </div>
          
          {/* <Button onClick={handleCalculateWorkday} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            Calculate Future Workday
          </Button> */}

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          {resultDate && !error && (
            <div className="mt-6 p-4 bg-muted rounded-md text-center">
              <p className="text-sm text-muted-foreground">Resulting Workday:</p>
              <p className="text-xl font-semibold text-accent">{resultDate}</p>
            </div>
          )}
           {!resultDate && !error && (
            <p className="text-center text-muted-foreground">Adjust inputs to see the calculated workday.</p>
          )}
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground text-center block">
          <p>This calculation excludes weekends (Saturdays and Sundays). It does not account for public holidays.</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default WorkdayCalculator;
