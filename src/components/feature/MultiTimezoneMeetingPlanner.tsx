
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, PlusCircle, Trash2, Users, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { DateTime } from 'luxon';
import { format as formatDateFns } from 'date-fns';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter as UiTableFooter
} from "@/components/ui/table";
import { timeZoneOptions } from '@/lib/data/timezones';


interface SelectedTimeZone {
  id: string;
  zoneName: string;
  label: string;
}

interface HourlyTimeData {
  displayTime: string;
  isWorkingHour: boolean;
  isDifferentDay: boolean;
}

interface TimeGridRowData extends SelectedTimeZone {
  hourlyTimes: HourlyTimeData[];
}

const MultiTimezoneMeetingPlanner = () => {
  const [selectedTimeZones, setSelectedTimeZones] = useState<SelectedTimeZone[]>([]);
  const [timeZoneToAdd, setTimeZoneToAdd] = useState<string>('');
  const [referenceDate, setReferenceDate] = useState<Date | undefined>();

  const sortedTimeZonesForSelect = [...timeZoneOptions].sort((a,b) => a.label.localeCompare(b.label));
  
  const WORK_HOUR_START = 9;
  const WORK_HOUR_END = 17;

  useEffect(() => {
    setReferenceDate(new Date());
  }, []);

  const handleAddZone = () => {
    if (timeZoneToAdd && !selectedTimeZones.find(z => z.zoneName === timeZoneToAdd)) {
      const zoneData = timeZoneOptions.find(tz => tz.value === timeZoneToAdd);
      if (zoneData && typeof window !== 'undefined') { // Check for window to avoid SSR issues with crypto
        setSelectedTimeZones(prev => [...prev, { 
          id: crypto.randomUUID(), 
          zoneName: zoneData.value, 
          label: zoneData.label 
        }].sort((a,b) => a.label.localeCompare(b.label)));
        setTimeZoneToAdd('');
      }
    }
  };

  const handleRemoveZone = (id: string) => {
    setSelectedTimeZones(prev => prev.filter(z => z.id !== id));
  };
  
  useEffect(() => {
    if (selectedTimeZones.length === 0 && typeof window !== 'undefined') {
      const defaultZones = ['America/New_York', 'Europe/London', 'Asia/Tokyo'];
      const initialZones = timeZoneOptions
        .filter(tz => defaultZones.includes(tz.value))
        .map(tz => ({ id: crypto.randomUUID(), zoneName: tz.value, label: tz.label }));
      setSelectedTimeZones(initialZones.sort((a,b) => a.label.localeCompare(b.label)));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const hoursOfDay = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);

  const timeGridData: TimeGridRowData[] = useMemo(() => {
    if (!referenceDate || selectedTimeZones.length === 0) return [];

    const refDt = DateTime.fromJSDate(referenceDate);

    return selectedTimeZones.map(zone => {
      return {
        ...zone,
        hourlyTimes: hoursOfDay.map(hour => {
          const utcHourDt = refDt.setZone('utc').set({ hour: hour, minute: 0, second: 0, millisecond: 0 });
          const localDt = utcHourDt.setZone(zone.zoneName);
          
          const isWorking = localDt.hour >= WORK_HOUR_START && localDt.hour < WORK_HOUR_END && localDt.weekday >= 1 && localDt.weekday <= 5; // Mon-Fri
          return {
            displayTime: localDt.toFormat('HH:mm'),
            isWorkingHour: isWorking,
            isDifferentDay: localDt.toISODate() !== refDt.toISODate(), 
          };
        }),
      };
    });
  }, [referenceDate, selectedTimeZones, hoursOfDay]);

  const overallOverlapData: boolean[] = useMemo(() => {
    if (timeGridData.length === 0) return [];
    return hoursOfDay.map((_, hourIndex) => {
      if (timeGridData.length === 0) return false; // No zones, no overlap
      return timeGridData.every(zoneRow => zoneRow.hourlyTimes[hourIndex].isWorkingHour);
    });
  }, [timeGridData, hoursOfDay]);

  return (
    <div className="flex justify-center py-8">
      <Card className="w-full max-w-5xl shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2">
            <Users className="h-8 w-8 text-primary" /> Multi-Timezone Meeting Planner
          </CardTitle>
          <CardDescription className="text-md">
            Select timezones and a date to see corresponding local times and overlapping working hours (Mon-Fri, 9 AM - 5 PM).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="timezone-select">Add Timezone</Label>
              <div className="flex gap-2">
                <Select value={timeZoneToAdd} onValueChange={setTimeZoneToAdd}>
                  <SelectTrigger id="timezone-select">
                    <SelectValue placeholder="Select a timezone to add" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {sortedTimeZonesForSelect.map(tz => (
                      <SelectItem 
                        key={tz.value} 
                        value={tz.value} 
                        disabled={!!selectedTimeZones.find(z => z.zoneName === tz.value)}
                      >
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleAddZone} disabled={!timeZoneToAdd} variant="outline">
                  <PlusCircle className="h-5 w-5 mr-2" /> Add
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reference-date">Reference Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="reference-date"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !referenceDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {referenceDate ? formatDateFns(referenceDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={referenceDate}
                    onSelect={setReferenceDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {selectedTimeZones.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Timezones ({selectedTimeZones.length}):</Label>
              <div className="flex flex-wrap gap-2">
                {selectedTimeZones.map(zone => (
                  <div key={zone.id} className="flex items-center gap-1 bg-muted p-2 rounded-md text-sm">
                    <span>{zone.label}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive/80" onClick={() => handleRemoveZone(zone.id)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove {zone.label}</span>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTimeZones.length > 0 && referenceDate && (
            <ScrollArea className="w-full whitespace-nowrap rounded-md border">
              <Table className="min-w-max">
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-card z-20 w-[200px] min-w-[200px] font-semibold">Timezone</TableHead>
                    {hoursOfDay.map(hour => (
                      <TableHead key={`header-${hour}`} className="text-center min-w-[70px]">
                        {DateTime.utc().set({ hour }).toFormat('ha').toLowerCase()}
                        <br />
                        <span className="text-xs text-muted-foreground">(UTC)</span>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timeGridData.map((zoneRow) => (
                    <TableRow key={zoneRow.id}>
                      <TableCell className="font-medium sticky left-0 bg-card z-10 w-[200px] min-w-[200px] max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap" title={zoneRow.label}>
                        {zoneRow.label}
                      </TableCell>
                      {zoneRow.hourlyTimes.map((timeSlot, index) => (
                        <TableCell
                          key={`${zoneRow.id}-${index}`}
                          className={cn(
                            "text-center min-w-[70px]",
                            timeSlot.isWorkingHour ? "bg-green-100 dark:bg-green-700/30" : "bg-red-50 dark:bg-red-700/10",
                            timeSlot.isDifferentDay && "opacity-70 border-l-2 border-dashed border-muted-foreground/50"
                          )}
                          title={timeSlot.isWorkingHour ? 'Working Hour' : 'Outside Working Hour'}
                        >
                          {timeSlot.displayTime}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
                 {timeGridData.length > 0 && (
                  <UiTableFooter>
                    <TableRow className="bg-muted/50 dark:bg-muted/30">
                      <TableCell className="font-semibold sticky left-0 bg-muted/50 dark:bg-muted/30 z-10 w-[200px] min-w-[200px]">
                        All Working?
                      </TableCell>
                      {overallOverlapData.map((isOverlap, index) => (
                        <TableCell key={`overlap-${index}`} className="text-center min-w-[70px]">
                          {isOverlap ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mx-auto" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500 dark:text-red-400 mx-auto" />
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  </UiTableFooter>
                )}
              </Table>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          )}
           {selectedTimeZones.length === 0 && (
             <p className="text-center text-muted-foreground py-4">Add at least one timezone to see the planner.</p>
           )}
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground text-center block">
          <p>Working hours (Mon-Fri, 9 AM - 5 PM local time) are highlighted. The "All Working?" row indicates if all selected locations are within these hours for that UTC slot.</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default MultiTimezoneMeetingPlanner;


    