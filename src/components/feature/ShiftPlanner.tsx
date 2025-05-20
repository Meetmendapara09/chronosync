
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateTime, Duration } from 'luxon';
import { CalendarIcon, Briefcase, AlertCircle, Clock4 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format as formatDateFns } from 'date-fns';
import { timeZoneOptions, type TimeZoneOption } from '@/lib/data/timezones';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ScheduleEntry {
  date: string;
  dayOfWeek: string;
  localStatus: string;
  localShiftTimes?: string;
  additionalStatus?: string;
  additionalShiftTimes?: string;
}

const ShiftPlanner = () => {
  const [localTimeZone, setLocalTimeZone] = useState<string>('');
  const [shiftStartTimeLocal, setShiftStartTimeLocal] = useState<string>('09:00');
  const [shiftDurationHours, setShiftDurationHours] = useState<string>('8');
  const [shiftDurationMinutes, setShiftDurationMinutes] = useState<string>('0');
  const [daysOn, setDaysOn] = useState<string>('5');
  const [daysOff, setDaysOff] = useState<string>('2');
  const [referenceStartDate, setReferenceStartDate] = useState<Date | undefined>();
  const [numWeeksToDisplay, setNumWeeksToDisplay] = useState<string>('4');
  const [additionalTimeZone, setAdditionalTimeZone] = useState<string | undefined>(undefined);

  const [scheduleResults, setScheduleResults] = useState<ScheduleEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const sortedTimeZones = useMemo(() =>
    [...timeZoneOptions].sort((a, b) => a.label.localeCompare(b.label)),
  []);

  useEffect(() => {
    setLocalTimeZone(DateTime.local().zoneName || 'America/New_York');
    setReferenceStartDate(new Date());
  }, []);

  const handleCalculateSchedule = useCallback(() => {
    setError(null);
    setScheduleResults([]);

    if (!localTimeZone || !shiftStartTimeLocal || !referenceStartDate) {
      setError("Please fill in all required fields: local timezone, shift start time, and reference start date.");
      return;
    }

    const durationH = parseInt(shiftDurationHours, 10);
    const durationM = parseInt(shiftDurationMinutes, 10);
    const dOn = parseInt(daysOn, 10);
    const dOff = parseInt(daysOff, 10);
    const weeks = parseInt(numWeeksToDisplay, 10);

    if (isNaN(durationH) || durationH < 0 || isNaN(durationM) || durationM < 0 || durationM >= 60) {
      setError("Invalid shift duration. Hours must be non-negative, minutes 0-59.");
      return;
    }
    if (durationH === 0 && durationM === 0) {
        setError("Shift duration cannot be zero.");
        return;
    }
    if (isNaN(dOn) || dOn <= 0) {
      setError("Invalid 'Days On'. Must be a positive number.");
      return;
    }
    if (isNaN(dOff) || dOff < 0) { // Days off can be 0 for continuous work
      setError("Invalid 'Days Off'. Must be a non-negative number.");
      return;
    }
    if (isNaN(weeks) || weeks <= 0) {
      setError("Invalid 'Number of Weeks to Display'. Must be a positive number.");
      return;
    }

    try {
      const results: ScheduleEntry[] = [];
      let currentDayLuxon = DateTime.fromJSDate(referenceStartDate, { zone: localTimeZone }).startOf("day");
      const cycleLength = dOn + dOff;
      const totalDaysToDisplay = weeks * 7;

      for (let i = 0; i < totalDaysToDisplay; i++) {
        const dayInCycle = i % cycleLength; // Assumes referenceStartDate is day 0 of an "on" cycle
        const isWorkDay = dayInCycle < dOn;

        let localStatus = "Off Day";
        let localShiftTimes = "";
        let additionalStatus: string | undefined = "Off Day";
        let additionalShiftTimes: string | undefined = "";

        if (isWorkDay) {
          const [startH, startM] = shiftStartTimeLocal.split(':').map(Number);
          const localShiftStart = currentDayLuxon.set({ hour: startH, minute: startM });
          const localShiftEnd = localShiftStart.plus({ hours: durationH, minutes: durationM });
          
          localStatus = "Working";
          localShiftTimes = `${localShiftStart.toFormat('HH:mm')} - ${localShiftEnd.toFormat('HH:mm')}`;
          if (localShiftEnd.day !== localShiftStart.day) {
            localShiftTimes += ` (+${localShiftEnd.diff(localShiftStart, 'days').days.toFixed(0)}d)`;
          }


          if (additionalTimeZone) {
            const additionalShiftStart = localShiftStart.setZone(additionalTimeZone);
            const additionalShiftEnd = localShiftEnd.setZone(additionalTimeZone);
            additionalStatus = "Working";
            additionalShiftTimes = `${additionalShiftStart.toFormat('HH:mm')} - ${additionalShiftEnd.toFormat('HH:mm')}`;
            if (additionalShiftEnd.day !== additionalShiftStart.day) {
                 additionalShiftTimes += ` (+${additionalShiftEnd.diff(additionalShiftStart, 'days').days.toFixed(0)}d)`;
            }
          } else {
            additionalStatus = undefined;
            additionalShiftTimes = undefined;
          }
        } else {
            if (!additionalTimeZone) {
                additionalStatus = undefined;
                additionalShiftTimes = undefined;
            }
        }

        results.push({
          date: currentDayLuxon.toFormat('MMM dd, yyyy'),
          dayOfWeek: currentDayLuxon.toFormat('cccc'),
          localStatus,
          localShiftTimes,
          additionalStatus,
          additionalShiftTimes,
        });

        currentDayLuxon = currentDayLuxon.plus({ days: 1 });
      }
      setScheduleResults(results);

    } catch (e: any) {
      console.error("Schedule calculation error:", e);
      setError(`An error occurred: ${e.message}`);
    }
  }, [localTimeZone, shiftStartTimeLocal, shiftDurationHours, shiftDurationMinutes, daysOn, daysOff, referenceStartDate, numWeeksToDisplay, additionalTimeZone]);

  return (
    <div className="flex justify-center py-8">
      <Card className="w-full max-w-4xl shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2">
            <Clock4 className="h-8 w-8 text-primary" /> Shift Work Viewer
          </CardTitle>
          <CardDescription className="text-md">
            Visualize your recurring shift schedule in your local timezone and optionally compare with another.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Column 1 */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="local-timezone">Your Local Timezone</Label>
                <Select value={localTimeZone} onValueChange={setLocalTimeZone}>
                  <SelectTrigger id="local-timezone"><SelectValue placeholder="Select local timezone" /></SelectTrigger>
                  <SelectContent className="max-h-60">{sortedTimeZones.map(tz => <SelectItem key={`local-${tz.value}`} value={tz.value}>{tz.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="shift-start-time">Shift Start Time (Local)</Label>
                <Input id="shift-start-time" type="time" value={shiftStartTimeLocal} onChange={(e) => setShiftStartTimeLocal(e.target.value)} />
              </div>
               <div className="space-y-2">
                <Label htmlFor="reference-start-date">Reference Cycle Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button id="reference-start-date" variant="outline" className={cn("w-full justify-start text-left font-normal", !referenceStartDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {referenceStartDate ? formatDateFns(referenceStartDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={referenceStartDate} onSelect={setReferenceStartDate} initialFocus /></PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground">The first day of an "On" period.</p>
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Shift Duration</Label>
                <div className="flex gap-2">
                  <Input type="number" value={shiftDurationHours} onChange={e => setShiftDurationHours(e.target.value)} placeholder="Hours" min="0" />
                  <Input type="number" value={shiftDurationMinutes} onChange={e => setShiftDurationMinutes(e.target.value)} placeholder="Mins" min="0" max="59" />
                </div>
              </div>
               <div className="space-y-2">
                <Label>Work Pattern</Label>
                <div className="flex gap-2 items-center">
                  <Input type="number" value={daysOn} onChange={e => setDaysOn(e.target.value)} placeholder="Days On" min="1" />
                  <span className="text-muted-foreground">On /</span>
                  <Input type="number" value={daysOff} onChange={e => setDaysOff(e.target.value)} placeholder="Days Off" min="0" />
                  <span className="text-muted-foreground">Off</span>
                </div>
              </div>
               <div className="space-y-2">
                <Label htmlFor="additional-timezone">Optional: View in Additional Timezone</Label>
                <Select value={additionalTimeZone} onValueChange={(val) => setAdditionalTimeZone(val === 'none' ? undefined : val)}>
                  <SelectTrigger id="additional-timezone"><SelectValue placeholder="Select timezone or None" /></SelectTrigger>
                  <SelectContent className="max-h-60">
                    <SelectItem value="none">None</SelectItem>
                    {sortedTimeZones.filter(tz => tz.value !== localTimeZone).map(tz => <SelectItem key={`add-${tz.value}`} value={tz.value}>{tz.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Column 3 */}
            <div className="space-y-4 md:col-span-2 lg:col-span-1">
              <div className="space-y-2">
                <Label htmlFor="num-weeks">Number of Weeks to Display</Label>
                <Input id="num-weeks" type="number" value={numWeeksToDisplay} onChange={e => setNumWeeksToDisplay(e.target.value)} placeholder="e.g., 4" min="1" />
              </div>
               <Button onClick={handleCalculateSchedule} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-auto py-3">
                Generate Schedule
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {scheduleResults.length > 0 && !error && (
            <div className="mt-6 space-y-3">
              <h3 className="text-xl font-semibold text-center">Generated Shift Schedule</h3>
              <div className="max-h-[600px] overflow-auto rounded-md border">
                <Table>
                  <TableHeader className="sticky top-0 bg-card z-10">
                    <TableRow>
                      <TableHead className="min-w-[150px]">Date</TableHead>
                      <TableHead className="min-w-[120px]">Day</TableHead>
                      <TableHead className="min-w-[200px]">Local Timezone ({localTimeZone.split('/').pop()?.replace('_', ' ')})</TableHead>
                      {additionalTimeZone && <TableHead className="min-w-[200px]">Additional Timezone ({additionalTimeZone.split('/').pop()?.replace('_', ' ')})</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scheduleResults.map((entry, index) => (
                      <TableRow key={index} className={cn(entry.localStatus !== "Working" && "bg-muted/30")}>
                        <TableCell className="font-medium">{entry.date}</TableCell>
                        <TableCell>{entry.dayOfWeek}</TableCell>
                        <TableCell className={cn(entry.localStatus === "Working" ? "text-green-600 dark:text-green-400" : "text-orange-600 dark:text-orange-400")}>
                            {entry.localStatus}
                            {entry.localShiftTimes && <span className="block text-xs text-foreground/80">{entry.localShiftTimes}</span>}
                        </TableCell>
                        {additionalTimeZone && (
                          <TableCell className={cn(entry.additionalStatus === "Working" ? "text-green-600 dark:text-green-400" : "text-orange-600 dark:text-orange-400")}>
                            {entry.additionalStatus}
                            {entry.additionalShiftTimes && <span className="block text-xs text-foreground/80">{entry.additionalShiftTimes}</span>}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
           {scheduleResults.length === 0 && !error && (
             <div className="mt-4 p-3 text-center">
               <p className="text-sm text-muted-foreground">Enter your shift details above and click "Generate Schedule".</p>
             </div>
           )}
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground text-center block">
          <p>This tool helps visualize recurring shifts. Assumes the 'Reference Cycle Start Date' is the first day of an "On" work period.</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ShiftPlanner;
