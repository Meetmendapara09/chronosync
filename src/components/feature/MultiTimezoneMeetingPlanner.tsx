
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, PlusCircle, Trash2, Users } from "lucide-react";
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
} from "@/components/ui/table";

// Re-using the timezone list from WorldClock, can be moved to a shared lib later
const timeZoneOptionsForPlanner = [
  { value: 'America/New_York', label: 'New York (EST/EDT)' },
  { value: 'America/Chicago', label: 'Chicago (CST/CDT)' },
  { value: 'America/Denver', label: 'Denver (MST/MDT)' },
  { value: 'America/Phoenix', label: 'Phoenix (MST)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)' },
  { value: 'America/Anchorage', label: 'Anchorage (AKST/AKDT)' },
  { value: 'America/Honolulu', label: 'Honolulu (HST)' },
  { value: 'America/Toronto', label: 'Toronto (EST/EDT)' },
  { value: 'America/Vancouver', label: 'Vancouver (PST/PDT)' },
  { value: 'America/Mexico_City', label: 'Mexico City (CST/CDT)' },
  { value: 'America/Edmonton', label: 'Edmonton (MST/MDT)' },
  { value: 'America/Winnipeg', label: 'Winnipeg (CST/CDT)' },
  { value: 'America/Halifax', label: 'Halifax (AST/ADT)' },
  { value: 'America/Sao_Paulo', label: 'São Paulo (BRT/BRST)' },
  { value: 'America/Buenos_Aires', label: 'Buenos Aires (ART)' },
  { value: 'America/Bogota', label: 'Bogotá (COT)' },
  { value: 'America/Lima', label: 'Lima (PET)' },
  { value: 'America/Caracas', label: 'Caracas (VET)' },
  { value: 'America/Santiago', label: 'Santiago (CLT/CLST)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
  { value: 'Europe/Madrid', label: 'Madrid (CET/CEST)' },
  { value: 'Europe/Rome', label: 'Rome (CET/CEST)' },
  { value: 'Europe/Moscow', label: 'Moscow (MSK)' },
  { value: 'Europe/Istanbul', label: 'Istanbul (TRT)' },
  { value: 'Europe/Kyiv', label: 'Kyiv (EET/EEST)' }, // Corrected from Kiev
  { value: 'Europe/Lisbon', label: 'Lisbon (WET/WEST)' },
  { value: 'Europe/Athens', label: 'Athens (EET/EEST)' },
  { value: 'Europe/Amsterdam', label: 'Amsterdam (CET/CEST)' },
  { value: 'Europe/Brussels', label: 'Brussels (CET/CEST)' },
  { value: 'Europe/Copenhagen', label: 'Copenhagen (CET/CEST)' },
  { value: 'Europe/Dublin', label: 'Dublin (GMT/IST)' },
  { value: 'Europe/Helsinki', label: 'Helsinki (EET/EEST)' },
  { value: 'Europe/Oslo', label: 'Oslo (CET/CEST)' },
  { value: 'Europe/Prague', label: 'Prague (CET/CEST)' },
  { value: 'Europe/Stockholm', label: 'Stockholm (CET/CEST)' },
  { value: 'Europe/Vienna', label: 'Vienna (CET/CEST)' },
  { value: 'Europe/Warsaw', label: 'Warsaw (CET/CEST)' },
  { value: 'Europe/Zurich', label: 'Zurich (CET/CEST)' },
  { value: 'Africa/Cairo', label: 'Cairo (EET)' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg (SAST)' },
  { value: 'Africa/Nairobi', label: 'Nairobi (EAT)' },
  { value: 'Africa/Lagos', label: 'Lagos (WAT)' },
  { value: 'Africa/Casablanca', label: 'Casablanca (WEST/WET)' },
  { value: 'Africa/Algiers', label: 'Algiers (CET)' },
  { value: 'Africa/Accra', label: 'Accra (GMT)' },
  { value: 'Africa/Dakar', label: 'Dakar (GMT)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Karachi', label: 'Karachi (PKT)' },
  { value: 'Asia/Kolkata', label: 'Kolkata (IST)' },
  { value: 'Asia/Dhaka', label: 'Dhaka (BST)' },
  { value: 'Asia/Bangkok', label: 'Bangkok (ICT)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong (HKT)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Seoul', label: 'Seoul (KST)' },
  { value: 'Asia/Jerusalem', label: 'Jerusalem (IST/IDT)' },
  { value: 'Asia/Riyadh', label: 'Riyadh (AST)' },
  { value: 'Asia/Tehran', label: 'Tehran (IRST/IRDT)' },
  { value: 'Asia/Baghdad', label: 'Baghdad (AST)' },
  { value: 'Asia/Baku', label: 'Baku (AZT)' },
  { value: 'Asia/Beirut', label: 'Beirut (EET/EEST)' },
  { value: 'Asia/Damascus', label: 'Damascus (EET/EEST)' },
  { value: 'Asia/Ho_Chi_Minh', label: 'Ho Chi Minh City (ICT)' },
  { value: 'Asia/Jakarta', label: 'Jakarta (WIB)' },
  { value: 'Asia/Kuala_Lumpur', label: 'Kuala Lumpur (MYT)' },
  { value: 'Asia/Manila', label: 'Manila (PHT)' },
  { value: 'Asia/Taipei', label: 'Taipei (CST)' },
  { value: 'Asia/Yangon', label: 'Yangon (MMT)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
  { value: 'Australia/Melbourne', label: 'Melbourne (AEST/AEDT)' },
  { value: 'Australia/Perth', label: 'Perth (AWST)' },
  { value: 'Australia/Adelaide', label: 'Adelaide (ACST/ACDT)' },
  { value: 'Australia/Brisbane', label: 'Brisbane (AEST)' },
  { value: 'Australia/Darwin', label: 'Darwin (ACST)' },
  { value: 'Pacific/Auckland', label: 'Auckland (NZST/NZDT)' },
  { value: 'Pacific/Fiji', label: 'Fiji (FJT)' },
  { value: 'Pacific/Guam', label: 'Guam (ChST)' },
  { value: 'Pacific/Port_Moresby', label: 'Port Moresby (PGT)' },
  { value: 'Etc/UTC', label: 'UTC' },
  { value: 'Etc/GMT', label: 'GMT' },
];


interface SelectedTimeZone {
  id: string;
  zoneName: string;
  label: string;
}

const MultiTimezoneMeetingPlanner = () => {
  const [selectedTimeZones, setSelectedTimeZones] = useState<SelectedTimeZone[]>([]);
  const [timeZoneToAdd, setTimeZoneToAdd] = useState<string>('');
  const [referenceDate, setReferenceDate] = useState<Date | undefined>(new Date());

  // Default working hours (9 AM to 5 PM)
  const WORK_HOUR_START = 9;
  const WORK_HOUR_END = 17;

  const handleAddZone = () => {
    if (timeZoneToAdd && !selectedTimeZones.find(z => z.zoneName === timeZoneToAdd)) {
      const zoneData = timeZoneOptionsForPlanner.find(tz => tz.value === timeZoneToAdd);
      if (zoneData) {
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
  
  // Initialize with a few default timezones
  useEffect(() => {
    if (selectedTimeZones.length === 0) {
      const defaultZones = ['America/New_York', 'Europe/London', 'Asia/Tokyo'];
      const initialZones = timeZoneOptionsForPlanner
        .filter(tz => defaultZones.includes(tz.value))
        .map(tz => ({ id: crypto.randomUUID(), zoneName: tz.value, label: tz.label }));
      setSelectedTimeZones(initialZones.sort((a,b) => a.label.localeCompare(b.label)));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const hoursOfDay = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []); // 0-23

  const timeGridData = useMemo(() => {
    if (!referenceDate || selectedTimeZones.length === 0) return [];

    const refDt = DateTime.fromJSDate(referenceDate);

    return selectedTimeZones.map(zone => {
      return {
        ...zone,
        hourlyTimes: hoursOfDay.map(hour => {
          // Create a DateTime object for the referenceDate in UTC at the specific hour
          const utcHourDt = refDt.setZone('utc').set({ hour: hour, minute: 0, second: 0, millisecond: 0 });
          // Convert this UTC time to the selected timezone
          const localDt = utcHourDt.setZone(zone.zoneName);
          
          const isWorking = localDt.hour >= WORK_HOUR_START && localDt.hour < WORK_HOUR_END;
          return {
            displayTime: localDt.toFormat('HH:mm'),
            isWorkingHour: isWorking,
            isDifferentDay: localDt.toISODate() !== refDt.toISODate(), // Check if day changed
          };
        }),
      };
    });
  }, [referenceDate, selectedTimeZones, hoursOfDay]);

  return (
    <div className="flex justify-center py-8">
      <Card className="w-full max-w-5xl shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2">
            <Users className="h-8 w-8 text-primary" /> Multi-Timezone Meeting Planner
          </CardTitle>
          <CardDescription className="text-md">
            Select timezones and a date to see corresponding local times and working hour overlaps.
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
                    {timeZoneOptionsForPlanner.sort((a,b) => a.label.localeCompare(b.label)).map(tz => (
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
                    <TableHead className="sticky left-0 bg-card z-10 w-[200px] min-w-[200px]">Timezone</TableHead>
                    {hoursOfDay.map(hour => (
                      <TableHead key={hour} className="text-center min-w-[70px]">
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
                          key={index}
                          className={cn(
                            "text-center min-w-[70px]",
                            timeSlot.isWorkingHour ? "bg-green-100 dark:bg-green-800/30" : "bg-red-50 dark:bg-red-900/20",
                            timeSlot.isDifferentDay && "opacity-70 border-l-2 border-dashed border-muted-foreground"
                          )}
                          title={timeSlot.isWorkingHour ? 'Working Hour' : 'Outside Working Hour'}
                        >
                          {timeSlot.displayTime}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          )}
           {selectedTimeZones.length === 0 && (
             <p className="text-center text-muted-foreground py-4">Add at least one timezone to see the planner.</p>
           )}
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground text-center block">
          <p>Working hours are highlighted from 9 AM to 5 PM in the respective local times. Times shown are for the selected reference date.</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default MultiTimezoneMeetingPlanner;
