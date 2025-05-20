
"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Timer as TimerIcon, Flag, RotateCcw } from "lucide-react";

const formatTime = (timeMs: number): string => {
  const totalSeconds = Math.floor(timeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = Math.floor((timeMs % 1000) / 10); // Show two digits for milliseconds

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`;
};

const Stopwatch = () => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0); // in milliseconds
  const [laps, setLaps] = useState<number[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now() - elapsedTime;
      timerRef.current = setInterval(() => {
        setElapsedTime(Date.now() - startTimeRef.current);
      }, 10); // Update every 10ms for smoother display
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, elapsedTime]);

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleLap = () => {
    if (isRunning) {
      setLaps(prevLaps => [...prevLaps, elapsedTime]);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedTime(0);
    setLaps([]);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  return (
    <div className="flex justify-center py-8">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2">
            <TimerIcon className="h-8 w-8 text-primary" /> Stopwatch
          </CardTitle>
          <CardDescription className="text-md">
            Measure elapsed time with precision.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-6 bg-muted rounded-lg shadow-inner">
            <p className="text-6xl font-mono font-bold text-accent tracking-wider">
              {formatTime(elapsedTime)}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Button 
              onClick={handleStartStop} 
              className={isRunning ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90 text-primary-foreground"}
            >
              {isRunning ? 'Stop' : 'Start'}
            </Button>
            <Button onClick={handleLap} variant="outline" disabled={!isRunning && elapsedTime === 0}>
              <Flag className="mr-1 h-4 w-4"/> Lap
            </Button>
            <Button onClick={handleReset} variant="outline" disabled={isRunning && elapsedTime === 0 && laps.length === 0}>
              <RotateCcw className="mr-1 h-4 w-4"/> Reset
            </Button>
          </div>

          {laps.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground text-center">Laps:</h4>
              <ScrollArea className="h-40 w-full rounded-md border p-2 bg-background shadow-sm">
                <ol className="list-decimal list-inside space-y-1">
                  {laps.map((lapTime, index) => (
                    <li key={index} className="text-sm font-mono flex justify-between items-center px-1 py-0.5 rounded bg-muted/50">
                      <span>Lap {index + 1}:</span>
                      <span>{formatTime(lapTime)}</span>
                    </li>
                  ))}
                </ol>
              </ScrollArea>
            </div>
          )}
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground text-center block">
          <p>Click Start to begin timing. Use Lap to record split times.</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Stopwatch;
