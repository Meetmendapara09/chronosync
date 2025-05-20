
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateTime } from 'luxon';
import { AlertCircle, PhoneCall, PlusCircle, Trash2 } from 'lucide-react';
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
import { timeZoneOptions, type TimeZoneOption } from '@/lib/data/timezones';

interface SelectedZone {
  id: string;
  value: string;
  label: string;
}

interface ScheduleSlot {
  referenceHourDisplay: string; // Time in the first selected zone, e.g., "09:00"
  zoneTimeDetails: Array<{
    time: string; // Local time in this specific zone for the slot
    isWorking: boolean;
    zoneValue: string; // IANA timezone value, for matching table headers
  }>;
  overlapCount: number;
}

const WORK_HOUR_START = 9;
const WORK_HOUR_END = 17;
const MAX_ZONES = 4;

const BestTimeToCall = () => {
  const [selectedZones, setSelectedZones] = useState<SelectedZone[]>([]);
  const [timeZoneToAdd, setTimeZoneToAdd] = useState<string>('');
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
  const [error, setError] = useState<string | null>(null);

  const sortedTimeZoneOptions = useMemo(() => 
    [...timeZoneOptions].sort((a,b) => a.label.localeCompare(b.label)), 
    []
  );

  // Initialize with default zones on mount
  useEffect(() => {
    const defaultZoneValues = ['America/New_York', 'Europe/London'];
    const initialZones = defaultZoneValues
      .map(value => {
        const option = sortedTimeZoneOptions.find(opt => opt.value === value);
        if (option && typeof window !== 'undefined') {
          return { id: crypto.randomUUID(), value: option.value, label: option.label };
        }
        return null;
      })
      .filter(zone => zone !== null) as SelectedZone[];
    setSelectedZones(initialZones);
  }, [sortedTimeZoneOptions]);

  const handleAddZone = () => {
    if (selectedZones.length >= MAX_ZONES) {
      setError(`You can select a maximum of ${MAX_ZONES} locations.`);
      return;
    }
    if (timeZoneToAdd && !selectedZones.find(z => z.value === timeZoneToAdd)) {
      const zoneOption = sortedTimeZoneOptions.find(opt => opt.value === timeZoneToAdd);
      if (zoneOption && typeof window !== 'undefined') {
        setSelectedZones(prev => [...prev, { id: crypto.randomUUID(), value: zoneOption.value, label: zoneOption.label }]);
        setTimeZoneToAdd('');
        setError(null);
      }
    } else if (selectedZones.find(z => z.value === timeZoneToAdd)) {
      setError("This location is already added.");
    }
  };

  const handleRemoveZone = (idToRemove: string) => {
    setSelectedZones(prev => prev.filter(z => z.id !== idToRemove));
    setError(null);
  };

  const calculateSchedule = useCallback(() => {
    setError(null);
    if (selectedZones.length < 2) {
      setSchedule([]);
      if(selectedZones.length === 1) setError("Please add at least one more location to compare.");
      return;
    }

    const newSchedule: ScheduleSlot[] = [];
    const firstZone = selectedZones[0];
    const todayInFirstZone = DateTime.now().setZone(firstZone.value);

    for (let hour = 0; hour < 24; hour++) {
      const referenceDateTimeInFirstZone = todayInFirstZone.set({ hour: hour, minute: 0, second: 0, millisecond: 0 });
      
      let overlapCount = 0;
      const zoneTimeDetails = selectedZones.map(zone => {
        const localDt = referenceDateTimeInFirstZone.setZone(zone.value);
        const isWorking = localDt.hour >= WORK_HOUR_START && localDt.hour < WORK_HOUR_END;
        if (isWorking) {
          overlapCount++;
        }
        return {
          time: localDt.toFormat('HH:mm'),
          isWorking,
          zoneValue: zone.value,
        };
      });

      newSchedule.push({
        referenceHourDisplay: referenceDateTimeInFirstZone.toFormat('HH:mm'),
        zoneTimeDetails,
        overlapCount,
      });
    }
    setSchedule(newSchedule);
  }, [selectedZones]);

  useEffect(() => {
    calculateSchedule();
  }, [calculateSchedule]);

  const getOverlapCellStyle = (count: number, totalSelected: number): string => {
    if (totalSelected < 2 || count === 0) return "bg-transparent";
    if (count === totalSelected) return "bg-green-500/30"; // All overlap - stronger
    return "bg-green-300/30"; // Partial overlap - lighter
  };

  return (
    <div className="flex justify-center py-8">
      <Card className="w-full max-w-4xl shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2">
            <PhoneCall className="h-8 w-8 text-primary" /> Best Time to Call
          </CardTitle>
          <CardDescription className="text-md">
            Find overlapping working hours (9 AM - 5 PM local time) between multiple locations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="zone-to-add">Add Location (up to {MAX_ZONES})</Label>
            <div className="flex gap-2">
              <Select value={timeZoneToAdd} onValueChange={setTimeZoneToAdd}>
                <SelectTrigger id="zone-to-add">
                  <SelectValue placeholder="Select location to add" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {sortedTimeZoneOptions.map(tz => (
                    <SelectItem 
                      key={`add-${tz.value}`} 
                      value={tz.value}
                      disabled={selectedZones.length >= MAX_ZONES || !!selectedZones.find(z => z.value === tz.value)}
                    >
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleAddZone} disabled={!timeZoneToAdd || selectedZones.length >= MAX_ZONES || !!selectedZones.find(z => z.value === timeZoneToAdd)}>
                <PlusCircle className="h-4 w-4 mr-2"/> Add
              </Button>
            </div>
          </div>

          {selectedZones.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Locations:</Label>
              <div className="flex flex-wrap gap-2">
                {selectedZones.map(zone => (
                  <div key={zone.id} className="flex items-center gap-1 bg-muted p-2 rounded-md text-sm">
                    <span>{zone.label.split('(')[0].trim()}</span>
                    <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive hover:text-destructive/80" onClick={() => handleRemoveZone(zone.id)}>
                      <Trash2 className="h-3 w-3" />
                      <span className="sr-only">Remove {zone.label}</span>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {schedule.length > 0 && selectedZones.length >= 2 && !error && (
            <div className="mt-6 space-y-3">
              <h3 className="text-xl font-semibold text-center">
                Suggested Calling Times
              </h3>
              <p className="text-sm text-muted-foreground text-center">
                Times based on {selectedZones[0]?.label.split('(')[0].trim()}'s 24-hour cycle. Highlighted cells indicate working hours.
              </p>
              <div className="max-h-[500px] overflow-auto rounded-md border">
                <Table>
                  <TableHeader className="sticky top-0 bg-card z-10">
                    <TableRow>
                      <TableHead className="w-1/5 min-w-[120px] text-center font-semibold">
                        {selectedZones[0]?.label.split('(')[0].trim() || "Time"}
                      </TableHead>
                      {selectedZones.slice(1).map(zone => (
                        <TableHead key={zone.id} className="w-1/5 min-w-[120px] text-center font-semibold">
                          {zone.label.split('(')[0].trim()}
                        </TableHead>
                      ))}
                      <TableHead className="w-1/5 min-w-[100px] text-center font-semibold">Overlap</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schedule.map(slot => (
                      <TableRow key={slot.referenceHourDisplay}>
                        <TableCell className={cn(
                            "text-center font-medium",
                            slot.zoneTimeDetails[0]?.isWorking ? "bg-primary/10" : ""
                          )}>
                          {slot.referenceHourDisplay}
                        </TableCell>
                        {slot.zoneTimeDetails.slice(1).map((detail, index) => (
                          <TableCell 
                            key={`${selectedZones[index+1]?.id}-${slot.referenceHourDisplay}`} 
                            className={cn(
                              "text-center font-medium",
                              detail.isWorking ? "bg-primary/10" : "text-muted-foreground opacity-70"
                            )}
                          >
                            {detail.time}
                          </TableCell>
                        ))}
                        <TableCell 
                          className={cn(
                            "text-center font-medium",
                            getOverlapCellStyle(slot.overlapCount, selectedZones.length)
                          )}
                        >
                          {slot.overlapCount > 0 ? `${slot.overlapCount}/${selectedZones.length} working` : "No overlap"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          {selectedZones.length < 2 && !error && (
            <div className="text-center text-muted-foreground py-4">
                Please select at least two locations to compare working hours.
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
