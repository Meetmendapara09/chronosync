
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Sunrise, Sunset } from "lucide-react";
import { cn } from "@/lib/utils";
import { DateTime } from 'luxon';
import { format as formatDateFns } from 'date-fns';
import { majorCitiesForSunriseSunset, CityLocation } from '@/lib/data/timezones'; // Using the new city list
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';


const SunriseSunsetFinder = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedCityValue, setSelectedCityValue] = useState<string>(majorCitiesForSunriseSunset[0]?.name || '');
  const [sunriseTime, setSunriseTime] = useState<string | null>(null);
  const [sunsetTime, setSunsetTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [calculationNote, setCalculationNote] = useState<string | null>(null);

  // Find the city object based on the selected name
  const selectedCityObject = majorCitiesForSunriseSunset.find(city => city.name === selectedCityValue);

  const handleFindTimes = async () => {
    if (!selectedDate || !selectedCityObject) {
      setCalculationNote("Please select a valid date and city.");
      setSunriseTime(null);
      setSunsetTime(null);
      return;
    }
    setIsLoading(true);
    setSunriseTime(null);
    setSunsetTime(null);

    // --- Placeholder for actual sunrise/sunset calculation ---
    // In a real application, you would:
    // 1. Install a library like `suncalc` (e.g., `pnpm add suncalc`).
    // 2. Import it: `import SunCalc from 'suncalc';`
    // 3. Use the library with date, latitude, and longitude:
    //    `const times = SunCalc.getTimes(selectedDate, selectedCityObject.lat, selectedCityObject.lon);`
    //    `const sunrise = DateTime.fromJSDate(times.sunrise).setZone(selectedCityObject.timeZone).toFormat('HH:mm (ZZZZ)');`
    //    `const sunset = DateTime.fromJSDate(times.sunset).setZone(selectedCityObject.timeZone).toFormat('HH:mm (ZZZZ)');`
    //    `setSunriseTime(sunrise);`
    //    `setSunsetTime(sunset);`

    // For now, simulate an API call and set placeholder times
    await new Promise(resolve => setTimeout(resolve, 700)); 

    const placeholderSunrise = DateTime.fromJSDate(selectedDate)
                                .setZone(selectedCityObject.timeZone)
                                .set({ hour: 6, minute: 30 })
                                .toFormat('HH:mm (ZZZZ)');
    const placeholderSunset = DateTime.fromJSDate(selectedDate)
                               .setZone(selectedCityObject.timeZone)
                               .set({ hour: 18, minute: 45 })
                               .toFormat('HH:mm (ZZZZ)');
    
    setSunriseTime(placeholderSunrise);
    setSunsetTime(placeholderSunset);
    setCalculationNote(`Displaying placeholder times for ${selectedCityObject.name}. A library like 'suncalc' is needed for accurate calculations.`);
    setIsLoading(false);
  };
  
  useEffect(() => {
    // Set initial date on client-side after mount
    setSelectedDate(new Date());
  }, []);

  // Automatically trigger find times when date or city changes, after initial mount
  useEffect(() => {
    if (selectedDate && selectedCityObject) {
        handleFindTimes();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, selectedCityValue]); // Re-run when date or city value changes

  return (
    <div className="flex justify-center py-8">
      <Card className="w-full max-w-xl shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2">
            <Sunrise className="h-8 w-8 text-primary" /> Sunrise & Sunset Finder
          </CardTitle>
          <CardDescription className="text-md">
            Select a date and city to find approximate sunrise and sunset times.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="sunrise-date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="sunrise-date"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? formatDateFns(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="city-select-sunrise">City</Label>
              <Select value={selectedCityValue} onValueChange={setSelectedCityValue}>
                <SelectTrigger id="city-select-sunrise">
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {majorCitiesForSunriseSunset.sort((a,b) => a.name.localeCompare(b.name)).map(city => (
                    <SelectItem key={city.name} value={city.name}>
                      {city.name} ({city.timeZone.split('/')[1].replace('_', ' ')})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Button removed, calculation triggers on change */}
          {/* <Button onClick={handleFindTimes} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
            {isLoading ? "Finding Times..." : "Find Sunrise/Sunset Times"}
          </Button> */}

          {isLoading && <p className="text-center text-muted-foreground">Calculating...</p>}

          {!isLoading && (sunriseTime || sunsetTime) && (
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-muted rounded-lg text-center shadow">
                <Sunrise className="h-10 w-10 text-orange-400 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Approx. Sunrise Time for {selectedCityObject?.name}</p>
                <p className="text-2xl font-semibold text-accent">{sunriseTime}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg text-center shadow">
                <Sunset className="h-10 w-10 text-orange-600 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Approx. Sunset Time for {selectedCityObject?.name}</p>
                <p className="text-2xl font-semibold text-accent">{sunsetTime}</p>
              </div>
            </div>
          )}
          
          {calculationNote && !isLoading && (
             <Alert className="mt-4">
                <Info className="h-4 w-4" />
                <AlertTitle>Note</AlertTitle>
                <AlertDescription>
                 {calculationNote}
                </AlertDescription>
            </Alert>
          )}

        </CardContent>
        <CardFooter className="text-xs text-muted-foreground text-center block">
          <p>
            Accurate sunrise/sunset calculations require a geospatial library (e.g., SunCalc.js) and precise coordinates. 
            Currently displaying placeholder data.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SunriseSunsetFinder;
