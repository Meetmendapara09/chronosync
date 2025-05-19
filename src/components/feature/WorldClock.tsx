
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateTime } from 'luxon';
import { Trash2 } from 'lucide-react';
import { timeZoneOptions } from '@/lib/data/timezones';

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

  const sortedTimeZones = [...timeZoneOptions].sort((a, b) => a.label.localeCompare(b.label));

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

    if (selectedCities.length === 0 && typeof window !== 'undefined') { // Check for window to avoid SSR issues with crypto
      const defaultCityValues = ['America/New_York', 'Europe/London', 'Asia/Tokyo'];
      const defaultCitiesToAdd = sortedTimeZones
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


    updateTimes(); 
    const intervalId = setInterval(updateTimes, 1000); 

    return () => clearInterval(intervalId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const handleAddCity = () => {
    if (selectedTimeZoneToAdd && !selectedCities.find(c => c.timeZone === selectedTimeZoneToAdd)) {
      const timeZoneData = sortedTimeZones.find(tz => tz.value === selectedTimeZoneToAdd);
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
        setSelectedTimeZoneToAdd(''); 
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
              <Label htmlFor="city-select">Add City/Timezone</Label>
              <Select value={selectedTimeZoneToAdd} onValueChange={setSelectedTimeZoneToAdd}>
                <SelectTrigger id="city-select">
                  <SelectValue placeholder="Select a city/timezone" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {sortedTimeZones.map(tz => (
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
            <p className="text-center text-muted-foreground py-4">No cities added yet. Select a city/timezone to display its current time.</p>
          )}
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground text-center block">
          <p>Times are updated live. Data provided by Luxon.</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default WorldClock;
