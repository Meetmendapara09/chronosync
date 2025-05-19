
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Sunrise, Sunset, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { DateTime } from 'luxon';
import { format as formatDateFns } from 'date-fns';
import { majorCitiesForSunriseSunset } from '@/lib/data/timezones';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import SunCalc from 'suncalc'; // Import suncalc

const SunriseSunsetFinder = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedCityValue, setSelectedCityValue] = useState<string>(majorCitiesForSunriseSunset[0]?.name || '');
  const [sunriseTime, setSunriseTime] = useState<string | null>(null);
  const [sunsetTime, setSunsetTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [calculationNote, setCalculationNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Find the city object based on the selected name
  const selectedCityObject = majorCitiesForSunriseSunset.find(city => city.name === selectedCityValue);

  const handleFindTimes = async () => {
    setError(null);
    setCalculationNote(null);
    if (!selectedDate || !selectedCityObject) {
      setError("Please select a valid date and city.");
      setSunriseTime(null);
      setSunsetTime(null);
      return;
    }
    setIsLoading(true);
    setSunriseTime(null);
    setSunsetTime(null);

    try {
      // Simulate a short delay for API call if it were real
      // await new Promise(resolve => setTimeout(resolve, 100)); 

      const times = SunCalc.getTimes(selectedDate, selectedCityObject.lat, selectedCityObject.lon);
      
      if (times.sunrise && times.sunset) {
        const sunriseDt = DateTime.fromJSDate(times.sunrise).setZone(selectedCityObject.timeZone);
        const sunsetDt = DateTime.fromJSDate(times.sunset).setZone(selectedCityObject.timeZone);

        if (sunriseDt.isValid && sunsetDt.isValid) {
            setSunriseTime(sunriseDt.toFormat('HH:mm (ZZZZ)'));
            setSunsetTime(sunsetDt.toFormat('HH:mm (ZZZZ)'));
            setCalculationNote(`Times calculated for ${selectedCityObject.name} using its local timezone.`);
        } else {
            setError(`Could not accurately determine times for ${selectedCityObject.name}. The location might experience polar day/night or there was an issue with time zone conversion.`);
            setCalculationNote(null);
        }

      } else {
         setError(`Sunrise/sunset times not available for ${selectedCityObject.name} on this date (e.g., polar night/day).`);
         setCalculationNote(null);
      }

    } catch (e: any) {
      console.error("SunCalc error:", e);
      setError(`Failed to calculate sunrise/sunset times. Please ensure the 'suncalc' library is installed and working correctly. Error: ${e.message}`);
      setCalculationNote(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    setSelectedDate(new Date());
  }, []);

  useEffect(() => {
    if (selectedDate && selectedCityObject) {
        handleFindTimes();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, selectedCityValue]);

  return (
    <div className="flex justify-center py-8">
      <Card className="w-full max-w-xl shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2">
            <Sunrise className="h-8 w-8 text-primary" /> Sunrise & Sunset Finder
          </CardTitle>
          <CardDescription className="text-md">
            Select a date and city to find sunrise and sunset times.
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
                      {city.name} ({city.timeZone.split('/')[1]?.replace('_', ' ') || city.timeZone})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {isLoading && <p className="text-center text-muted-foreground py-4">Calculating...</p>}
          
          {error && !isLoading && (
             <Alert variant="destructive" className="mt-4">
                <Info className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                 {error} Make sure you have run <code className="font-mono bg-destructive/20 px-1 rounded">pnpm install suncalc</code> or <code className="font-mono bg-destructive/20 px-1 rounded">npm install suncalc</code>.
                </AlertDescription>
            </Alert>
          )}

          {!isLoading && !error && (sunriseTime || sunsetTime) && (
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-muted rounded-lg text-center shadow">
                <Sunrise className="h-10 w-10 text-orange-400 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Sunrise Time for {selectedCityObject?.name}</p>
                <p className="text-2xl font-semibold text-accent">{sunriseTime || "N/A"}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg text-center shadow">
                <Sunset className="h-10 w-10 text-orange-600 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Sunset Time for {selectedCityObject?.name}</p>
                <p className="text-2xl font-semibold text-accent">{sunsetTime || "N/A"}</p>
              </div>
            </div>
          )}
          
          {calculationNote && !isLoading && !error && (
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
            Sunrise/sunset calculations are performed using the SunCalc.js library.
            Ensure the library is installed in your project.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SunriseSunsetFinder;

    