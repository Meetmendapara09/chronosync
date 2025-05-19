
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateTime } from 'luxon';
import { AlertCircle, CalendarClock, Info } from 'lucide-react';
import { timeZoneOptions } from '@/lib/data/timezones';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '../ui/skeleton';

interface DstChangeInfo {
  transitionDate: string;
  daysUntil: number;
  changeDescription: string;
  newOffsetShort: string;
  newOffsetLong: string;
}

const DstChangeFinder = () => {
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [dstChangeInfo, setDstChangeInfo] = useState<DstChangeInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [noChangeFound, setNoChangeFound] = useState<boolean>(false);

  const sortedTimeZones = [...timeZoneOptions].sort((a, b) => a.label.localeCompare(b.label));

  const findNextDstChange = useCallback(() => {
    if (!selectedZone) {
      setDstChangeInfo(null);
      setError(null);
      setNoChangeFound(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setDstChangeInfo(null);
    setNoChangeFound(false);

    // Use a timeout to ensure loading state updates before potentially long computation
    setTimeout(() => {
        try {
            const nowInZone = DateTime.now().setZone(selectedZone);
            if (!nowInZone.isValid) {
                setError(`Invalid timezone selected: ${selectedZone}. ${nowInZone.invalidReason || ''}`);
                setIsLoading(false);
                return;
            }

            let initialIsDST = nowInZone.isInDST;
            let initialOffset = nowInZone.offset;
            let transitionFound = false;

            for (let i = 0; i <= 365 * 2; i++) { // Check up to 2 years
                const checkDate = nowInZone.plus({ days: i }).startOf('day'); // Check at the start of the day
                
                // Check for transitions by looking at changes in offset over small intervals
                // This is more robust than just isInDST for some zones.
                const beforePotentialChange = checkDate.plus({ hours: 1 }); // e.g., 1 AM
                const afterPotentialChange = checkDate.plus({ hours: 3 }); // e.g., 3 AM to cross typical 2 AM changes

                if (!beforePotentialChange.isValid || !afterPotentialChange.isValid) continue;

                if (beforePotentialChange.offset !== afterPotentialChange.offset) {
                    // Transition likely happened around this day. Let's pinpoint it.
                    // We find the exact hour of transition by checking each hour
                    let transitionHourDt = checkDate;
                    for (let h = 0; h < 24; h++) {
                        const currentHourDt = checkDate.set({ hour: h });
                        const nextHourDt = checkDate.set({ hour: h + 1 });
                        if (currentHourDt.offset !== nextHourDt.offset) {
                            transitionHourDt = nextHourDt; // The transition happens *at* nextHourDt
                            break;
                        }
                    }
                    
                    const currentIsDST = transitionHourDt.isInDST;
                    const daysUntil = Math.ceil(transitionHourDt.diffNow('days').days);

                    let changeDescription = "";
                    if (currentIsDST && !initialIsDST) {
                        changeDescription = `Enters Daylight Saving Time. Clocks go forward.`;
                    } else if (!currentIsDST && initialIsDST) {
                        changeDescription = `Exits Daylight Saving Time. Clocks go back.`;
                    } else if (transitionHourDt.offset !== initialOffset) { // Offset changed without DST flag (e.g. permanent shift)
                         changeDescription = `Timezone offset changes.`;
                    } else {
                        // DST status is the same, but offset name might have changed or it's a minor adjustment
                        // This case might need more refinement if it occurs
                        changeDescription = `Offset or DST rules change.`;
                    }


                    setDstChangeInfo({
                        transitionDate: transitionHourDt.toFormat("DDDD, HH:mm"),
                        daysUntil: Math.max(0, Math.floor(daysUntil)), // Ensure non-negative
                        changeDescription,
                        newOffsetShort: transitionHourDt.offsetNameShort || '',
                        newOffsetLong: transitionHourDt.offsetNameLong || '',
                    });
                    transitionFound = true;
                    break; 
                }
                // Update initialIsDST and initialOffset for the next day's comparison base if a change occurs
                initialIsDST = afterPotentialChange.isInDST;
                initialOffset = afterPotentialChange.offset;
            }

            if (!transitionFound) {
                setNoChangeFound(true);
            }
        } catch (e: any) {
            console.error("Error finding DST change:", e);
            setError(`Failed to calculate DST change. ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    }, 0);
  }, [selectedZone]);

  useEffect(() => {
    if (selectedZone) {
      findNextDstChange();
    } else {
      // Clear results if no zone is selected
      setDstChangeInfo(null);
      setError(null);
      setNoChangeFound(false);
    }
  }, [selectedZone, findNextDstChange]);

  // Set a default timezone on mount if one isn't selected
  useEffect(() => {
    if (!selectedZone && sortedTimeZones.length > 0) {
      const userLocalZone = DateTime.local().zoneName;
      const defaultZone = sortedTimeZones.find(tz => tz.value === userLocalZone) || sortedTimeZones.find(tz => tz.value === 'America/New_York') || sortedTimeZones[0];
      if (defaultZone) {
        setSelectedZone(defaultZone.value);
      }
    }
  }, [selectedZone, sortedTimeZones]);


  return (
    <div className="flex justify-center py-8">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2">
            <CalendarClock className="h-8 w-8 text-primary" /> DST Change Finder
          </CardTitle>
          <CardDescription className="text-md">
            Find the next upcoming Daylight Saving Time (or standard time) transition for a selected timezone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="timezone-select-dst">Select Timezone</Label>
            <Select value={selectedZone} onValueChange={setSelectedZone}>
              <SelectTrigger id="timezone-select-dst">
                <SelectValue placeholder="Select a timezone" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {sortedTimeZones.map(tz => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* The Button is removed as useEffect handles updates, but can be re-added if manual trigger is preferred */}
          {/* <Button onClick={findNextDstChange} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading || !selectedZone}>
            {isLoading ? 'Checking...' : 'Find Next DST Change'}
          </Button> */}

          {isLoading && (
            <div className="space-y-3 pt-4">
                <Skeleton className="h-6 w-3/4 mx-auto" />
                <Skeleton className="h-5 w-1/2 mx-auto" />
                <Skeleton className="h-5 w-2/3 mx-auto" />
            </div>
          )}

          {error && !isLoading && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {noChangeFound && !isLoading && !error && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>No DST Change Found</AlertTitle>
              <AlertDescription>
                No Daylight Saving Time or significant offset changes found for {timeZoneOptions.find(tz => tz.value === selectedZone)?.label || selectedZone} within the next two years from today.
              </AlertDescription>
            </Alert>
          )}

          {dstChangeInfo && !isLoading && !error && (
            <div className="mt-6 p-4 bg-muted rounded-lg text-center space-y-2 shadow">
              <p className="text-sm text-muted-foreground">Next change for {timeZoneOptions.find(tz => tz.value === selectedZone)?.label || selectedZone}:</p>
              <p className="text-xl font-semibold text-accent">{dstChangeInfo.transitionDate}</p>
              <p className="text-lg">
                ({dstChangeInfo.daysUntil === 0 ? "Today" : `In ${dstChangeInfo.daysUntil} day${dstChangeInfo.daysUntil === 1 ? "" : "s"}`})
              </p>
              <p className="text-md">{dstChangeInfo.changeDescription}</p>
              <p className="text-sm text-muted-foreground">New status: {dstChangeInfo.newOffsetShort} ({dstChangeInfo.newOffsetLong})</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground text-center block">
          <p>DST rules can be complex and may change. Calculations are based on Luxon's current timezone data for up to two years ahead.</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DstChangeFinder;
