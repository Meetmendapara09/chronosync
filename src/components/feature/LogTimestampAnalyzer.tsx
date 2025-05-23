
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { DateTime } from 'luxon';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileText, Search, AlertCircle, Clock } from "lucide-react";
import { timeZoneOptions } from '@/lib/data/timezones';
import { ScrollArea } from '../ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

interface TimestampPattern {
  name: string;
  regex: RegExp;
  parser: (match: string, assumedZone?: string) => DateTime | null;
  isUnix?: boolean;
  unixUnit?: 'seconds' | 'milliseconds';
}

interface ProcessedLogEntry {
  id: string;
  originalLine: string;
  lineNumber: number;
  detectedRawTimestamp?: string;
  originalDateTime?: DateTime;
  convertedDateTime?: string;
  timeDiffToNext?: string;
  patternName?: string;
}

const LogTimestampAnalyzer = () => {
  const [logInput, setLogInput] = useState<string>('');
  const [targetTimeZone, setTargetTimeZone] = useState<string>('');
  const [assumedInputTimeZone, setAssumedInputTimeZone] = useState<string>('Etc/UTC');
  const [processedLogEntries, setProcessedLogEntries] = useState<ProcessedLogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const sortedTimeZones = useMemo(() => 
    [...timeZoneOptions].sort((a, b) => a.label.localeCompare(b.label)), 
  []);

  useEffect(() => {
    setTargetTimeZone(DateTime.local().zoneName || 'Etc/UTC');
  }, []);

  const timestampPatterns: TimestampPattern[] = useMemo(() => [
    {
      name: "ISO8601 with Z/Offset",
      regex: /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?(?:Z|[+-]\d{2}:?\d{2})/g,
      parser: (match) => DateTime.fromISO(match, { zone: 'utc' }), // ISO with offset/Z is inherently UTC or specified
    },
    {
      name: "ISO8601 (space) with Z/Offset",
      regex: /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d{1,9})?(?:Z|[+-]\d{2}:?\d{2})/g,
      parser: (match) => DateTime.fromISO(match.replace(' ', 'T'), { zone: 'utc' }),
    },
    {
      name: "YYYY-MM-DDTHH:MM:SS (no offset)",
      regex: /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?/g,
      parser: (match, assumedZone) => DateTime.fromISO(match, { zone: assumedZone }),
    },
    {
      name: "YYYY-MM-DD HH:MM:SS (no offset)",
      regex: /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d{1,9})?/g,
      parser: (match, assumedZone) => DateTime.fromFormat(match, "yyyy-MM-dd HH:mm:ss.S", { zone: assumedZone }),
    },
     {
      name: "Unix Milliseconds (13 digits)",
      regex: /\b(1[5-9]\d{11})\b/g,
      parser: (match) => DateTime.fromMillis(parseInt(match, 10)),
      isUnix: true, unixUnit: 'milliseconds',
    },
    {
      name: "Unix Seconds (10 digits)",
      regex: /\b(1[5-9]\d{8})\b/g,
      parser: (match) => DateTime.fromSeconds(parseInt(match, 10)),
      isUnix: true, unixUnit: 'seconds',
    },
    { // Common log format like "2023/01/15 10:30:45"
      name: "YYYY/MM/DD HH:MM:SS",
      regex: /\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}(?:\.\d{1,9})?/g,
      parser: (match, assumedZone) => DateTime.fromFormat(match, "yyyy/MM/dd HH:mm:ss.S", { zone: assumedZone }),
    },
    { // RFC 2822 like "Mon, 02 Jan 2006 15:04:05 -0700" or "Mon, 02 Jan 2006 15:04:05 Z"
      name: "RFC 2822",
      regex: /\w{3}, \d{2} \w{3} \d{4} \d{2}:\d{2}:\d{2} (?:Z|[+-]\d{4})/g,
      parser: (match) => DateTime.fromRFC2822(match),
    }
  ], []);


  const handleAnalyzeLogs = useCallback(() => {
    if (!logInput.trim()) {
      setError("Please paste some log data to analyze.");
      setProcessedLogEntries([]);
      return;
    }
    if (!targetTimeZone) {
      setError("Please select a target timezone.");
      setProcessedLogEntries([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    // Use setTimeout to allow UI to update to loading state
    setTimeout(() => {
      const lines = logInput.split('\n');
      const allDetectedTimestamps: ProcessedLogEntry[] = [];
      let entryIdCounter = 0;

      lines.forEach((line, index) => {
        let foundTimestampInLine = false;
        for (const pattern of timestampPatterns) {
          // Reset lastIndex for global regexes
          pattern.regex.lastIndex = 0; 
          const matches = Array.from(line.matchAll(pattern.regex));
          
          if (matches.length > 0) {
            // For simplicity, take the first match of the first successful pattern on a line
            const match = matches[0][0];
            const dt = pattern.parser(match, pattern.isUnix ? undefined : assumedInputTimeZone);

            if (dt && dt.isValid) {
              allDetectedTimestamps.push({
                id: `ts-${entryIdCounter++}`,
                originalLine: line,
                lineNumber: index + 1,
                detectedRawTimestamp: match,
                originalDateTime: dt,
                patternName: pattern.name,
              });
              foundTimestampInLine = true;
              break; // Found a timestamp with this pattern, move to next line
            }
          }
        }
        if (!foundTimestampInLine) {
           // Add line even if no timestamp found, for context
           allDetectedTimestamps.push({
            id: `line-${entryIdCounter++}`,
            originalLine: line,
            lineNumber: index + 1,
           });
        }
      });

      // Sort by originalDateTime if available
      allDetectedTimestamps.sort((a, b) => {
        if (a.originalDateTime && b.originalDateTime) {
          return a.originalDateTime.toMillis() - b.originalDateTime.toMillis();
        }
        if (a.originalDateTime) return -1; // entries with dates first
        if (b.originalDateTime) return 1;
        return a.lineNumber - b.lineNumber; // fallback to line number
      });
      
      const finalProcessedEntries: ProcessedLogEntry[] = [];
      let lastValidDateTime: DateTime | null = null;

      allDetectedTimestamps.forEach(entry => {
        if (entry.originalDateTime && entry.originalDateTime.isValid) {
           entry.convertedDateTime = entry.originalDateTime.setZone(targetTimeZone).toFormat("yyyy-MM-dd HH:mm:ss.SSS ZZZZ");
          if (lastValidDateTime) {
            const diff = entry.originalDateTime.diff(lastValidDateTime);
            // Find the last entry that had timeDiffToNext and update it
            const lastEntryToUpdate = finalProcessedEntries.slice().reverse().find(e => e.originalDateTime);
            if (lastEntryToUpdate) {
                 lastEntryToUpdate.timeDiffToNext = diff.toHuman({ unitDisplay: 'short', maximumFractionDigits: 2 });
            }
          }
          lastValidDateTime = entry.originalDateTime;
        }
        finalProcessedEntries.push(entry);
      });

      setProcessedLogEntries(finalProcessedEntries);
      setIsLoading(false);
      if (finalProcessedEntries.every(e => !e.originalDateTime)) {
        setError("No recognizable timestamps found in the provided logs with the current patterns.");
      }
    }, 0);

  }, [logInput, targetTimeZone, assumedInputTimeZone, timestampPatterns]);

  return (
    <div className="flex justify-center py-8">
      <Card className="w-full max-w-4xl shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2">
            <FileText className="h-8 w-8 text-primary" /> Log Timestamp Analyzer
          </CardTitle>
          <CardDescription className="text-md">
            Paste your log data to detect, parse, and convert timestamps.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="log-input">Log Data</Label>
            <Textarea
              id="log-input"
              value={logInput}
              onChange={(e) => setLogInput(e.target.value)}
              placeholder="Paste your log content here..."
              rows={10}
              className="font-mono text-xs"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target-timezone">Target Display Timezone</Label>
              <Select value={targetTimeZone} onValueChange={setTargetTimeZone}>
                <SelectTrigger id="target-timezone">
                  <SelectValue placeholder="Select target timezone" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {sortedTimeZones.map(tz => (
                    <SelectItem key={`target-${tz.value}`} value={tz.value}>{tz.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assumed-input-timezone">Assumed Input Timezone (if not in log)</Label>
              <Select value={assumedInputTimeZone} onValueChange={setAssumedInputTimeZone}>
                <SelectTrigger id="assumed-input-timezone">
                  <SelectValue placeholder="Select assumed input timezone" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {sortedTimeZones.map(tz => (
                    <SelectItem key={`assumed-${tz.value}`} value={tz.value}>{tz.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
               <p className="text-xs text-muted-foreground">Used for timestamps like '2023-10-26 10:00:00' that lack offset info.</p>
            </div>
          </div>
          
          <Button onClick={handleAnalyzeLogs} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
            {isLoading ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" /> Analyze Logs
              </>
            )}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {processedLogEntries.length > 0 && !isLoading && (
            <div className="mt-6 space-y-3">
              <h3 className="text-xl font-semibold text-center">Analyzed Log Entries</h3>
              <ScrollArea className="h-[500px] rounded-md border">
                <Table>
                  <TableHeader className="sticky top-0 bg-card z-10">
                    <TableRow>
                      <TableHead className="w-[60px]">Line</TableHead>
                      <TableHead>Original Log Line (Snippet)</TableHead>
                      <TableHead className="min-w-[250px]">Converted Timestamp ({targetTimeZone.split('/').pop()?.replace('_', ' ')})</TableHead>
                      <TableHead className="min-w-[150px]">Time to Next</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {processedLogEntries.map((entry) => (
                      <TableRow key={entry.id} className={!entry.originalDateTime ? "opacity-60" : ""}>
                        <TableCell className="font-mono text-xs">{entry.lineNumber}</TableCell>
                        <TableCell className="font-mono text-xs max-w-md truncate" title={entry.originalLine}>
                          {entry.originalLine.substring(0,100)}{entry.originalLine.length > 100 ? "..." : ""}
                          {entry.patternName && entry.detectedRawTimestamp && (
                              <span className="block text-sky-600 dark:text-sky-400 text-[10px] mt-0.5" title={`Detected: ${entry.detectedRawTimestamp} (via ${entry.patternName})`}>
                                  Detected: {entry.detectedRawTimestamp}
                              </span>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {entry.convertedDateTime || (entry.originalDateTime ? 'Error converting' : 'N/A')}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {entry.timeDiffToNext || ''}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          )}
          {processedLogEntries.length === 0 && !error && !isLoading && logInput.trim() && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Results</AlertTitle>
              <AlertDescription>No timestamps were detected, or processing resulted in no entries. Try adjusting your input or assumed timezone.</AlertDescription>
            </Alert>
          )}

        </CardContent>
        <CardFooter className="text-xs text-muted-foreground text-center block">
          <p>Tool attempts to find common timestamp formats. Accuracy may vary with log complexity. Assumed input timezone is used for timestamps without explicit offset information.</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LogTimestampAnalyzer;
