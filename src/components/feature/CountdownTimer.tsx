"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { DateTime, Duration } from 'luxon';
import { format as formatDateFns } from 'date-fns'; // for initial display in PopoverTrigger

const CountdownTimer = () => {
  const [targetDate, setTargetDate] = useState<Date | undefined>();
  const [targetTime, setTargetTime] = useState<string>('12:00');
  const [eventName, setEventName] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<Duration | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && targetDate) {
      interval = setInterval(() => {
        const targetDateTimeStr = `${DateTime.fromJSDate(targetDate).toISODate()}T${targetTime}`;
        const targetLuxonDate = DateTime.fromISO(targetDateTimeStr);
        
        if (!targetLuxonDate.isValid) {
            setTimeLeft(null); // or some error state
            setIsRunning(false);
            return;
        }
        
        const now = DateTime.now();
        const diff = targetLuxonDate.diff(now, ['days', 'hours', 'minutes', 'seconds', 'milliseconds']);

        if (diff.valueOf() <= 0) {
          setTimeLeft(Duration.fromMillis(0));
          setIsRunning(false);
          if(interval) clearInterval(interval);
        } else {
          setTimeLeft(diff);
        }
      }, 1000);
    } else if (!isRunning && interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, targetDate, targetTime]);

  const handleStartCountdown = () => {
    if (targetDate) {
      setIsRunning(true);
    } else {
      alert("Please select a target date and time.");
    }
  };

  const handleResetCountdown = () => {
    setIsRunning(false);
    setTimeLeft(null);
    setTargetDate(undefined);
    setTargetTime('12:00');
    setEventName('');
  };
  
  const formatDuration = (duration: Duration | null): string => {
    if (!duration) return "00:00:00:00";
    const days = Math.floor(duration.as('days'));
    const hours = Math.floor(duration.as('hours') % 24);
    const minutes = Math.floor(duration.as('minutes') % 60);
    const seconds = Math.floor(duration.as('seconds') % 60);
    return `${String(days).padStart(2, '0')}:${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };


  return (
    <div className="flex justify-center py-8">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Countdown Timer</CardTitle>
          <CardDescription className="text-md">
            Set a live countdown to your important future dates and times.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="event-name">Event Name (Optional)</Label>
            <Input 
              id="event-name" 
              placeholder="e.g., New Year's Eve" 
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target-date">Target Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="target-date"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !targetDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {targetDate ? formatDateFns(targetDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={targetDate}
                    onSelect={setTargetDate}
                    initialFocus
                    disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} // Disable past dates
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="target-time">Target Time</Label>
              <Input 
                id="target-time" 
                type="time" 
                value={targetTime}
                onChange={(e) => setTargetTime(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <Button onClick={handleStartCountdown} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isRunning || !targetDate}>
              {isRunning ? 'Counting Down...' : 'Start Countdown'}
            </Button>
            <Button onClick={handleResetCountdown} variant="outline" className="flex-1">
              Reset
            </Button>
          </div>

          {timeLeft && (
            <div className="mt-6 p-6 bg-muted rounded-lg text-center">
              {eventName && <p className="text-lg font-medium text-muted-foreground mb-2">Countdown to: <span className="text-accent font-semibold">{eventName}</span></p>}
              <p className="text-4xl md:text-5xl font-mono font-bold text-primary tracking-wider">
                {formatDuration(timeLeft)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Days : Hours : Minutes : Seconds</p>
            </div>
          )}
           {isRunning && !timeLeft && targetDate && (
             <div className="mt-6 p-6 bg-muted rounded-lg text-center">
              <p className="text-lg font-medium">Initializing countdown...</p>
             </div>
           )}
        </CardContent>
         <CardFooter className="text-xs text-muted-foreground text-center block">
          <p>Select a future date and time to begin the countdown.</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CountdownTimer;
