"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { DateTime, DurationObjectUnits } from 'luxon';
import { format as formatDateFns } from 'date-fns'; // for initial display in PopoverTrigger


const DateCalculator = () => {
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [operation, setOperation] = useState<'add' | 'subtract'>('add');
  const [durationValue, setDurationValue] = useState<number>(1);
  const [durationUnit, setDurationUnit] = useState<keyof DurationObjectUnits>('days');
  const [resultDate, setResultDate] = useState<string | null>(null);

  const handleCalculate = () => {
    if (!startDate || isNaN(durationValue) || durationValue < 0) {
      setResultDate('Please provide a valid start date and a non-negative duration.');
      return;
    }

    try {
      let startDt = DateTime.fromJSDate(startDate);
      const durationObj: DurationObjectUnits = { [durationUnit]: durationValue };
      
      let endDt;
      if (operation === 'add') {
        endDt = startDt.plus(durationObj);
      } else {
        endDt = startDt.minus(durationObj);
      }
      
      setResultDate(endDt.toFormat('MMMM dd, yyyy (cccc)'));
    } catch (error) {
      console.error("Date calculation error:", error);
      setResultDate('Error during calculation.');
    }
  };

  const durationUnits: { value: keyof DurationObjectUnits; label: string }[] = [
    { value: 'days', label: 'Days' },
    { value: 'weeks', label: 'Weeks' },
    { value: 'months', label: 'Months' },
    { value: 'years', label: 'Years' },
  ];

  return (
    <div className="flex justify-center py-8">
      <Card className="w-full max-w-xl shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Date Calculator</CardTitle>
          <CardDescription className="text-md">
            Add or subtract durations from a specific date.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="start-date">Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="start-date"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? formatDateFns(startDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="operation">Operation</Label>
              <Select value={operation} onValueChange={(value) => setOperation(value as 'add' | 'subtract')}>
                <SelectTrigger id="operation">
                  <SelectValue placeholder="Select operation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Add (+)</SelectItem>
                  <SelectItem value="subtract">Subtract (-)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration-value">Duration</Label>
              <Input 
                id="duration-value" 
                type="number" 
                value={durationValue}
                onChange={(e) => setDurationValue(parseInt(e.target.value, 10) || 0)}
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration-unit">Unit</Label>
              <Select value={durationUnit} onValueChange={(value) => setDurationUnit(value as keyof DurationObjectUnits)}>
                <SelectTrigger id="duration-unit">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {durationUnits.map(unit => (
                    <SelectItem key={unit.value} value={unit.value}>{unit.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button onClick={handleCalculate} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            Calculate Date
          </Button>

          {resultDate && (
            <div className="mt-6 p-4 bg-muted rounded-md text-center">
              <p className="text-sm text-muted-foreground">Resulting Date:</p>
              <p className="text-xl font-semibold text-accent">{resultDate}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground text-center block">
          <p>Calculations are performed using the Luxon library.</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DateCalculator;
