"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateTime } from 'luxon';
import { Trash2 } from 'lucide-react';

const popularTimeZones = [
  { value: 'America/New_York', label: 'New York' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris' },
  { value: 'Asia/Tokyo', label: 'Tokyo' },
  { value: 'Australia/Sydney', label: 'Sydney' },
  { value: 'America/Los_Angeles', label: 'Los Angeles' },
  { value: 'Asia/Dubai', label: 'Dubai' },
  { value: 'Asia/Shanghai', label: 'Shanghai' },
  { value: 'UTC', label: 'UTC' },
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

    updateTimes(); // Initial update
    const intervalId = setInterval(updateTimes, 1000); // Update every second

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, []); // Empty dependency array ensures this runs once on mount and unmount

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
        setSelectedCities(prev => [...prev, newCity]);
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
                  {popularTimeZones.map(tz => (
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
                <div key={city.id} className="p-4 bg-muted rounded-lg flex justify-between items-center shadow">
                  <div>
                    <h3 className="text-xl font-semibold text-primary">{city.label}</h3>
                    <p className="text-sm text-muted-foreground">{city.currentDate} ({city.offset})</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-mono font-bold text-accent">{city.currentTime}</p>
                     <Button variant="ghost" size="sm" onClick={() => handleRemoveCity(city.id)} className="mt-1 text-destructive hover:text-destructive/80">
                      <Trash2 className="h-4 w-4 mr-1" /> Remove
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
          <p>Times are updated live based on the selected time zones.</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default WorldClock;
