
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateTime } from 'luxon';
import { Trash2 } from 'lucide-react';

const popularTimeZones = [
  // North America
  { value: 'America/New_York', label: 'New York' },
  { value: 'America/Chicago', label: 'Chicago' },
  { value: 'America/Denver', label: 'Denver' },
  { value: 'America/Phoenix', label: 'Phoenix' },
  { value: 'America/Los_Angeles', label: 'Los Angeles' },
  { value: 'America/Anchorage', label: 'Anchorage' },
  { value: 'America/Honolulu', label: 'Honolulu' },
  { value: 'America/Toronto', label: 'Toronto' },
  { value: 'America/Vancouver', label: 'Vancouver' },
  { value: 'America/Mexico_City', label: 'Mexico City' },
  { value: 'America/Edmonton', label: 'Edmonton' },
  { value: 'America/Winnipeg', label: 'Winnipeg' },
  { value: 'America/Halifax', label: 'Halifax' },
  // South America
  { value: 'America/Sao_Paulo', label: 'São Paulo' },
  { value: 'America/Buenos_Aires', label: 'Buenos Aires' },
  { value: 'America/Bogota', label: 'Bogotá' },
  { value: 'America/Lima', label: 'Lima' },
  { value: 'America/Caracas', label: 'Caracas' },
  { value: 'America/Santiago', label: 'Santiago' },
  // Europe
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris' },
  { value: 'Europe/Berlin', label: 'Berlin' },
  { value: 'Europe/Madrid', label: 'Madrid' },
  { value: 'Europe/Rome', label: 'Rome' },
  { value: 'Europe/Moscow', label: 'Moscow' },
  { value: 'Europe/Istanbul', label: 'Istanbul' },
  { value: 'Europe/Kiev', label: 'Kyiv' },
  { value: 'Europe/Lisbon', label: 'Lisbon' },
  { value: 'Europe/Athens', label: 'Athens' },
  // Africa
  { value: 'Africa/Cairo', label: 'Cairo' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg' },
  { value: 'Africa/Nairobi', label: 'Nairobi' },
  { value: 'Africa/Lagos', label: 'Lagos' },
  { value: 'Africa/Casablanca', label: 'Casablanca' },
  { value: 'Africa/Algiers', label: 'Algiers' },
  // Asia
  { value: 'Asia/Dubai', label: 'Dubai' },
  { value: 'Asia/Karachi', label: 'Karachi' },
  { value: 'Asia/Kolkata', label: 'Kolkata' },
  { value: 'Asia/Dhaka', label: 'Dhaka' },
  { value: 'Asia/Bangkok', label: 'Bangkok' },
  { value: 'Asia/Shanghai', label: 'Shanghai' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong' },
  { value: 'Asia/Singapore', label: 'Singapore' },
  { value: 'Asia/Tokyo', label: 'Tokyo' },
  { value: 'Asia/Seoul', label: 'Seoul' },
  { value: 'Asia/Jerusalem', label: 'Jerusalem' },
  { value: 'Asia/Riyadh', label: 'Riyadh' },
  { value: 'Asia/Tehran', label: 'Tehran' },
  // Australia & Oceania
  { value: 'Australia/Sydney', label: 'Sydney' },
  { value: 'Australia/Melbourne', label: 'Melbourne' },
  { value: 'Australia/Perth', label: 'Perth' },
  { value: 'Australia/Adelaide', label: 'Adelaide' },
  { value: 'Australia/Brisbane', label: 'Brisbane' },
  { value: 'Pacific/Auckland', label: 'Auckland' },
  { value: 'Pacific/Fiji', label: 'Fiji' },
  // UTC
  { value: 'UTC', label: 'UTC' },
  { value: 'GMT', label: 'GMT'}
];


interface CityTime {
  id: string;
  label: string;
  timeZone: string;
  currentTime: string;
  currentDate: string;
  offset: string;
}

const WorldClock = () => {
  const [selectedCities, setSelectedCities] = useState<CityTime[]>([]);
  const [selectedTimeZoneToAdd, setSelectedTimeZoneToAdd] = useState<string>('');

  useEffect(() => {
    const updateTimes = () => {
      setSelectedCities(prevCities =>
        prevCities.map(city => {
          const now = DateTime.now().setZone(city.timeZone);
          return {
            ...city,
            currentTime: now.toFormat('HH:mm:ss'),
            currentDate: now.toFormat('ccc, MMM dd, yyyy'),
            offset: now.toFormat('ZZZZ')
          };
        })
      );
    };

    // Initialize with a few default cities if the list is empty
    if (selectedCities.length === 0) {
      const defaultCityValues = ['America/New_York', 'Europe/London', 'Asia/Tokyo'];
      const defaultCitiesToAdd = popularTimeZones
        .filter(tz => defaultCityValues.includes(tz.value))
        .map(tz => {
          const now = DateTime.now().setZone(tz.value);
          return {
            id: crypto.randomUUID(),
            label: tz.label,
            timeZone: tz.value,
            currentTime: now.toFormat('HH:mm:ss'),
            currentDate: now.toFormat('ccc, MMM dd, yyyy'),
            offset: now.toFormat('ZZZZ')
          };
        });
      setSelectedCities(defaultCitiesToAdd);
    }


    updateTimes(); // Initial update
    const intervalId = setInterval(updateTimes, 1000); // Update every second

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Add selectedCities to dependency array if you want default cities to re-populate if all are removed. 
            // Keeping it empty to only run on mount for initial default cities.

  const handleAddCity = () => {
    if (selectedTimeZoneToAdd && !selectedCities.find(c => c.timeZone === selectedTimeZoneToAdd)) {
      const timeZoneData = popularTimeZones.find(tz => tz.value === selectedTimeZoneToAdd);
      if (timeZoneData) {
        const now = DateTime.now().setZone(timeZoneData.value);
        const newCity: CityTime = {
          id: crypto.randomUUID(),
          label: timeZoneData.label,
          timeZone: timeZoneData.value,
          currentTime: now.toFormat('HH:mm:ss'),
          currentDate: now.toFormat('ccc, MMM dd, yyyy'),
          offset: now.toFormat('ZZZZ')
        };
        setSelectedCities(prev => [...prev, newCity].sort((a,b) => a.label.localeCompare(b.label)));
        setSelectedTimeZoneToAdd(''); // Reset select
      }
    }
  };

  const handleRemoveCity = (id: string) => {
    setSelectedCities(prev => prev.filter(city => city.id !== id));
  };

  return (
    <div className="flex justify-center py-8">
      <Card className="w-full max-w-3xl shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">World Clock</CardTitle>
          <CardDescription className="text-md">
            View the current time in multiple cities around the globe.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="space-y-2 flex-grow">
              <Label htmlFor="city-select">Add City</Label>
              <Select value={selectedTimeZoneToAdd} onValueChange={setSelectedTimeZoneToAdd}>
                <SelectTrigger id="city-select">
                  <SelectValue placeholder="Select a city/timezone" />
                </SelectTrigger>
                <SelectContent>
                  {popularTimeZones.sort((a,b) => a.label.localeCompare(b.label)).map(tz => (
                    <SelectItem key={tz.value} value={tz.value} disabled={!!selectedCities.find(c => c.timeZone === tz.value)}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddCity} disabled={!selectedTimeZoneToAdd} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
              Add Clock
            </Button>
          </div>

          {selectedCities.length > 0 ? (
            <div className="space-y-4">
              {selectedCities.map(city => (
                <div key={city.id} className="p-4 bg-muted rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center shadow">
                  <div className="mb-2 sm:mb-0">
                    <h3 className="text-xl font-semibold text-primary">{city.label}</h3>
                    <p className="text-sm text-muted-foreground">{city.currentDate} ({city.offset})</p>
                  </div>
                  <div className="flex flex-row sm:flex-col items-baseline sm:items-end gap-2 w-full sm:w-auto">
                     <p className="text-3xl font-mono font-bold text-accent order-first sm:order-none">{city.currentTime}</p>
                     <Button variant="ghost" size="sm" onClick={() => handleRemoveCity(city.id)} className="text-destructive hover:text-destructive/80 px-2 py-1 self-center sm:self-auto">
                      <Trash2 className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Remove</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">No cities added yet. Select a city to display its current time.</p>
          )}
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground text-center block">
          <p>Times are updated live based on the selected time zones. Add your favorite cities!</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default WorldClock;

