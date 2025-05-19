
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateTime } from 'luxon';
import { AlertCircle, PhoneCall } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from '@/lib/utils';
import { timeZoneOptions } from '@/lib/data/timezones';

interface TimeSlot {
  referenceHour: number; 
  timeInZone1: string;
  timeInZone2: string;
  isZone1Working: boolean;
  isZone2Working: boolean;
  isOverlap: boolean;
  zone1Label: string;
  zone2Label: string;
}

const WORK_HOUR_START = 9;
const WORK_HOUR_END = 17; 

const BestTimeToCall = () => {
  const [zone1, setZone1] = useState<string>('America/New_York');
  const [zone2, setZone2] = useState<string>('Europe/London');
  const [overlapSlots, setOverlapSlots] = useState<TimeSlot[]>([]);
  const [error, setError] = useState<string | null>(null);

  const sortedTimeZones = [...timeZoneOptions].sort((a,b) => a.label.localeCompare(b.label));

  const findTimes = () => {
    setError(null);
    if (!zone1 || !zone2) {
      setError("Please select two time zones.");
      setOverlapSlots([]);
      return;
    }
    if (zone1 === zone2) {
      setError("Please select two different time zones.");
      setOverlapSlots([]);
      return;
    }

    const slots: TimeSlot[] = [];
    const today = DateTime.now(); 
    const zone1Data = timeZoneOptions.find(tz => tz.value === zone1);
    const zone2Data = timeZoneOptions.find(tz => tz.value === zone2);

    if (!zone1Data || !zone2Data) {
        setError("Invalid timezone selection.");
        setOverlapSlots([]);
        return;
    }

    for (let hour = 0; hour < 24; hour++) {
      const dtZone1 = today.setZone(zone1).set({ hour: hour, minute: 0, second: 0, millisecond: 0 });
      const dtZone2 = dtZone1.setZone(zone2);

      const isZone1Working = dtZone1.hour >= WORK_HOUR_START && dtZone1.hour < WORK_HOUR_END;
      const isZone2Working = dtZone2.hour >= WORK_HOUR_START && dtZone2.hour < WORK_HOUR_END;
      const isOverlap = isZone1Working && isZone2Working;

      slots.push({
        referenceHour: hour,
        timeInZone1: dtZone1.toFormat('HH:mm'),
        timeInZone2: dtZone2.toFormat('HH:mm'),
        isZone1Working,
        isZone2Working,
        isOverlap,
        zone1Label: zone1Data.label.split('(')[0].trim(),
        zone2Label: zone2Data.label.split('(')[0].trim(),
      });
    }
    setOverlapSlots(slots);
  };

  useEffect(() => {
    findTimes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zone1, zone2]); 

  return (
    <div className="flex justify-center py-8">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2">
            <PhoneCall className="h-8 w-8 text-primary" /> Best Time to Call
          </CardTitle>
          <CardDescription className="text-md">
            Find the best overlapping working hours (9 AM - 5 PM local time) between two locations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="zone1-select">Location 1</Label>
              <Select value={zone1} onValueChange={(value) => { setZone1(value); }}>
                <SelectTrigger id="zone1-select">
                  <SelectValue placeholder="Select first location" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {sortedTimeZones.map(tz => (
                    <SelectItem key={`zone1-${tz.value}`} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="zone2-select">Location 2</Label>
              <Select value={zone2} onValueChange={(value) => { setZone2(value); }}>
                <SelectTrigger id="zone2-select">
                  <SelectValue placeholder="Select second location" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {sortedTimeZones.map(tz => (
                    <SelectItem key={`zone2-${tz.value}`} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Button is removed as useEffect handles updates, but can be re-added if manual trigger is preferred */}
          {/* <Button onClick={findTimes} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            Find Optimal Times
          </Button> */}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {overlapSlots.length > 0 && !error && (
            <div className="mt-6 space-y-3">
              <h3 className="text-xl font-semibold text-center">
                Suggested Calling Times ({overlapSlots[0]?.zone1Label} & {overlapSlots[0]?.zone2Label})
              </h3>
              <p className="text-sm text-muted-foreground text-center">
                Times are shown based on a 24-hour cycle for {overlapSlots[0]?.zone1Label}. Green indicates overlapping work hours.
              </p>
              <div className="max-h-[400px] overflow-y-auto rounded-md border">
                <Table>
                  <TableHeader className="sticky top-0 bg-card z-10">
                    <TableRow>
                      <TableHead className="w-1/3 text-center">{overlapSlots[0]?.zone1Label}</TableHead>
                      <TableHead className="w-1/3 text-center">{overlapSlots[0]?.zone2Label}</TableHead>
                      <TableHead className="w-1/3 text-center">Overlap</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overlapSlots.map(slot => (
                      <TableRow key={slot.referenceHour} className={cn(slot.isOverlap && "bg-green-100 dark:bg-green-800/30")}>
                        <TableCell className={cn("text-center font-medium", slot.isZone1Working ? "text-foreground" : "text-muted-foreground opacity-70")}>
                          {slot.timeInZone1}
                        </TableCell>
                        <TableCell className={cn("text-center font-medium", slot.isZone2Working ? "text-foreground" : "text-muted-foreground opacity-70")}>
                          {slot.timeInZone2}
                        </TableCell>
                        <TableCell className="text-center">
                          {slot.isOverlap ? (
                            <span className="font-semibold text-green-600 dark:text-green-400">Yes</span>
                          ) : (
                            <span className="text-red-600 dark:text-red-400">No</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground text-center block">
          <p>Working hours are assumed to be 9:00 AM to 5:00 PM in local times. Tool considers current date for DST.</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default BestTimeToCall;
