
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateTime } from 'luxon';
import { AlertCircle, PhoneCall, Users } from 'lucide-react';
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

// Timezone list (consider moving to a shared file later)
const timeZoneOptionsForBestTime = [
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
  { value: 'Europe/Kyiv', label: 'Kyiv (EET/EEST)' },
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

interface TimeSlot {
  referenceHour: number; // 0-23, based on the first selected timezone
  timeInZone1: string;
  timeInZone2: string;
  isZone1Working: boolean;
  isZone2Working: boolean;
  isOverlap: boolean;
  zone1Label: string;
  zone2Label: string;
}

const WORK_HOUR_START = 9;
const WORK_HOUR_END = 17; // Exclusive, so 9:00 to 16:59

const BestTimeToCall = () => {
  const [zone1, setZone1] = useState<string>('America/New_York');
  const [zone2, setZone2] = useState<string>('Europe/London');
  const [overlapSlots, setOverlapSlots] = useState<TimeSlot[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFindTimes = () => {
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
    const today = DateTime.now(); // Use current date to respect DST
    const zone1Data = timeZoneOptionsForBestTime.find(tz => tz.value === zone1);
    const zone2Data = timeZoneOptionsForBestTime.find(tz => tz.value === zone2);

    if (!zone1Data || !zone2Data) {
        setError("Invalid timezone selection.");
        setOverlapSlots([]);
        return;
    }

    for (let hour = 0; hour < 24; hour++) {
      // Create a DateTime object for the current hour in the *first* selected timezone
      const dtZone1 = today.setZone(zone1).set({ hour: hour, minute: 0, second: 0, millisecond: 0 });
      
      // Convert this specific instant to the second timezone
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
        zone1Label: zone1Data.label.split('(')[0].trim(), // Get city name
        zone2Label: zone2Data.label.split('(')[0].trim(),
      });
    }
    setOverlapSlots(slots);
  };

  // Automatically find times when zones change
  useState(() => {
    handleFindTimes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }); // Removed dependencies to avoid re-running on every render, will rely on button click initially. Or add zone1, zone2 to deps.

  return (
    <div className="flex justify-center py-8">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2">
            <PhoneCall className="h-8 w-8 text-primary" /> Best Time to Call
          </CardTitle>
          <CardDescription className="text-md">
            Find the best overlapping working hours between two locations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="zone1-select">Location 1</Label>
              <Select value={zone1} onValueChange={(value) => { setZone1(value); setOverlapSlots([]); }}>
                <SelectTrigger id="zone1-select">
                  <SelectValue placeholder="Select first location" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {timeZoneOptionsForBestTime.sort((a,b) => a.label.localeCompare(b.label)).map(tz => (
                    <SelectItem key={`zone1-${tz.value}`} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="zone2-select">Location 2</Label>
              <Select value={zone2} onValueChange={(value) => { setZone2(value); setOverlapSlots([]); }}>
                <SelectTrigger id="zone2-select">
                  <SelectValue placeholder="Select second location" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {timeZoneOptionsForBestTime.sort((a,b) => a.label.localeCompare(b.label)).map(tz => (
                    <SelectItem key={`zone2-${tz.value}`} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleFindTimes} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            Find Optimal Times
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {overlapSlots.length > 0 && (
            <div className="mt-6 space-y-3">
              <h3 className="text-xl font-semibold text-center">
                Suggested Calling Times ({overlapSlots[0]?.zone1Label} & {overlapSlots[0]?.zone2Label})
              </h3>
              <p className="text-sm text-muted-foreground text-center">
                Times are shown based on a 24-hour cycle for {overlapSlots[0]?.zone1Label}. Green indicates overlapping work hours (9 AM - 5 PM).
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
