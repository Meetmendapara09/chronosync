
# ChronoSync Feature Overview

This document provides an overview of all the features available in the ChronoSync application. It aims to help users and developers understand the purpose and functionality of each tool.

## Core Technologies Used

- **Framework**: Next.js (with App Router)
- **Language**: TypeScript
- **UI Components**: ShadCN UI
- **Styling**: Tailwind CSS
- **Date/Time Management**: Luxon.js
- **Icons**: Lucide React
- **Specialized Libraries**:
    - SunCalc.js (for Sunrise/Sunset)
    - html2canvas & jsPDF (for PDF export in Event Viewer)

---

## 1. Time Zone Converter

-   **Purpose**: To quickly convert a specific date and time from one selected timezone to another.
-   **How it Works**:
    1.  The user selects a "From" timezone and a "To" timezone from a comprehensive list.
    2.  The user inputs a specific date and time relevant to the "From" timezone.
    3.  Upon clicking "Convert Time", the application calculates and displays the equivalent date and time in the "To" timezone, including its UTC offset.
-   **Key Inputs**: Date, Time, "From" Timezone, "To" Timezone.
-   **Key Outputs**: Converted date and time in the "To" timezone with its offset.
-   **File**: `src/components/feature/TimeZoneConverter.tsx`

---

## 2. Countdown Timer

-   **Purpose**: To set a live countdown to a specific future date and time.
-   **How it Works**:
    1.  The user optionally enters an event name.
    2.  The user selects a target date using a calendar picker.
    3.  The user inputs a target time.
    4.  Upon clicking "Start Countdown", the timer begins, displaying the remaining days, hours, minutes, and seconds.
    5.  The countdown can be reset.
-   **Key Inputs**: Event Name (optional), Target Date, Target Time.
-   **Key Outputs**: Live display of remaining time (DD:HH:MM:SS).
-   **File**: `src/components/feature/CountdownTimer.tsx`

---

## 3. World Clock

-   **Purpose**: To display the current time in multiple user-selected cities or timezones simultaneously.
-   **How it Works**:
    1.  Users can add timezones from a dropdown list.
    2.  For each added timezone, the user can provide a custom label (e.g., "London Office").
    3.  The application displays a card for each selected timezone, showing the custom label (or default timezone name), current date, current time (updating every second), and UTC offset.
    4.  Users can remove clocks or reorder them.
    5.  The list of selected clocks and their labels are persisted in the browser's `localStorage`.
-   **Key Inputs**: Selection of timezones, custom labels.
-   **Key Outputs**: Live-updating list of clocks with current date, time, and offset for each.
-   **File**: `src/components/feature/WorldClock.tsx`

---

## 4. Date Calculator

-   **Purpose**: To add or subtract a specified duration (days, weeks, months, years) from a given start date.
-   **How it Works**:
    1.  The user selects a "Start Date".
    2.  The user chooses an operation: "Add" or "Subtract".
    3.  The user inputs a numeric "Duration Value" (e.g., 5).
    4.  The user selects a "Duration Unit" (Days, Weeks, Months, Years).
    5.  Upon clicking "Calculate Date", the resulting date is displayed. (Note: Auto-calculates on input change).
-   **Key Inputs**: Start Date, Operation, Duration Value, Duration Unit.
-   **Key Outputs**: Calculated resulting date.
-   **File**: `src/components/feature/DateCalculator.tsx`

---

## 5. Unix Timestamp Converter

-   **Purpose**: To convert Unix timestamps (seconds or milliseconds since epoch) to human-readable dates and vice-versa.
-   **How it Works**:
    *   **Timestamp to Date/Time**:
        1.  User enters a Unix timestamp.
        2.  User selects the unit (seconds or milliseconds).
        3.  The tool displays the corresponding date and time in both UTC and the user's local timezone.
    *   **Date/Time to Timestamp**:
        1.  User selects a date and inputs a time (in their local timezone).
        2.  The tool displays the corresponding Unix timestamp in both seconds and milliseconds.
-   **Key Inputs**: Unix timestamp, unit (for ts to date); Date, Time (for date to ts).
-   **Key Outputs**: Human-readable date/time (UTC & local); Unix timestamps (seconds & milliseconds).
-   **File**: `src/components/feature/UnixTimestampConverter.tsx`

---

## 6. Multi-Timezone Meeting Planner (Working Hours Comparator)

-   **Purpose**: To help users plan meetings by visualizing overlapping working hours (Mon-Fri, 9 AM - 5 PM local time) across multiple selected timezones.
-   **How it Works**:
    1.  Users can add multiple timezones (up to a limit).
    2.  Users select a reference date.
    3.  The tool displays a grid:
        *   Rows represent selected timezones.
        *   Columns represent hours of the day (based on UTC, shown in local time for each zone).
        *   Cells are highlighted if they fall within the 9 AM - 5 PM working window for that timezone.
        *   An "All Working?" row at the bottom indicates if all selected timezones are within working hours for that specific UTC slot.
-   **Key Inputs**: Multiple timezones, Reference Date.
-   **Key Outputs**: A visual grid showing local times for each hour across selected zones, with working hours and overall overlap highlighted.
-   **File**: `src/components/feature/MultiTimezoneMeetingPlanner.tsx`

---

## 7. Best Time to Call

-   **Purpose**: To find optimal overlapping working hours (9 AM - 5 PM local time) for calling between multiple locations.
-   **How it Works**:
    1.  Users can add up to four locations/timezones.
    2.  The tool displays a 24-hour schedule based on the current date.
    3.  For each hour slot (referenced from the first selected timezone):
        *   It shows the local time in each selected timezone.
        *   Cells for each timezone are highlighted if it's a working hour.
        *   An "Overlap" column indicates how many of the selected locations are within working hours, with varying intensity of highlight (e.g., light green for partial overlap, darker green for full overlap).
-   **Key Inputs**: 2 to 4 timezones.
-   **Key Outputs**: A schedule table indicating working hours per zone and the degree of overlap.
-   **File**: `src/components/feature/BestTimeToCall.tsx`

---

## 8. Sunrise/Sunset Time Finder

-   **Purpose**: To find the sunrise and sunset times for a selected city on a specific date.
-   **How it Works**:
    1.  User selects a date.
    2.  User selects a city from a predefined list (which includes latitude, longitude, and timezone).
    3.  The tool uses the `suncalc` library to calculate the sunrise and sunset times.
    4.  The results are displayed in the city's local time, including its timezone name.
-   **Key Inputs**: Date, City.
-   **Key Outputs**: Sunrise time, Sunset time (local to the city).
-   **Dependencies**: `suncalc` library.
-   **File**: `src/components/feature/SunriseSunsetFinder.tsx`

---

## 9. Event Scheduler & Viewer (Privacy-First)

-   **Purpose**: To schedule events and generate shareable links. The link recipient sees the event in their local time. All event data is stored within the link itself, ensuring privacy (no server-side storage of event details).
-   **Event Scheduler (`/event-scheduler`)**:
    1.  User inputs Event Name, Date, Time, their local Event Timezone, Event Duration (hours/minutes), and an optional Description.
    2.  A shareable link is generated. This link encodes all event details (name, UTC start time, original timezone, duration, description) as URL query parameters.
-   **Event Viewer (`/view-event`)**:
    1.  When someone opens the shareable link, this page parses the event details from the URL.
    2.  It automatically detects the viewer's local timezone.
    3.  Displays the event time in the viewer's local time, the original creator's time, event duration, and description.
    4.  Provides "Add to Google Calendar" and "Download ICS File" buttons (ICS generated client-side).
    5.  Provides a "Download as PDF" option using `html2canvas` and `jspdf`.
-   **Key Inputs (Scheduler)**: Event Name, Date, Time, Event Timezone, Duration, Description (optional).
-   **Key Outputs (Scheduler)**: Shareable URL.
-   **Key Inputs (Viewer)**: URL with event parameters.
-   **Key Outputs (Viewer)**: Event details in local time, calendar/export options.
-   **Dependencies**: `html2canvas`, `jspdf`.
-   **Files**: `src/components/feature/EventScheduler.tsx`, `src/components/feature/ViewEvent.tsx`

---

## 10. Travel Time Zone Assistant

-   **Purpose**: To help travelers plan journeys across timezones by calculating local arrival times and understanding time adjustments.
-   **How it Works**:
    1.  User inputs Departure Timezone, Arrival Timezone, Departure Date, Departure Time, and Flight Duration (hours/minutes).
    2.  The tool calculates and displays:
        *   Departure date and time in the departure city's local time.
        *   Arrival date and time in the arrival city's local time.
        *   Information about the effective time "gained" or "lost" due to timezone changes (excluding flight duration).
-   **Key Inputs**: Departure Zone, Arrival Zone, Departure Date/Time, Flight Duration.
-   **Key Outputs**: Departure and arrival details in local times, time adjustment information.
-   **File**: `src/components/feature/TravelTimeAssistant.tsx`

---

## 11. DST Change Finder

-   **Purpose**: To allow users to look up the next Daylight Saving Time (or standard time) transition for a selected timezone.
-   **How it Works**:
    1.  User selects a timezone.
    2.  The tool checks daily (up to two years in the future) from the current date in that timezone for changes in DST status or UTC offset.
    3.  It displays the date of the next transition, how many days away it is, and a description of the change (e.g., "Enters DST", "Exits DST").
-   **Key Inputs**: Timezone.
-   **Key Outputs**: Information about the next DST transition.
-   **File**: `src/components/feature/DstChangeFinder.tsx`

---

## 12. Sleep Planner for Time Zones

-   **Purpose**: To help users plan their sleep schedule to align with a desired wake-up time in a different timezone.
-   **How it Works**:
    1.  User inputs their desired Wake-up Time and the Timezone for that wake-up.
    2.  User inputs their desired Sleep Duration (hours/minutes).
    3.  The tool calculates and displays:
        *   The recommended bedtime in the user's current local timezone.
        *   The recommended bedtime in the target timezone.
-   **Key Inputs**: Target Wake-up Time, Target Timezone, Sleep Duration.
-   **Key Outputs**: Recommended bedtimes in local and target zones.
-   **File**: `src/components/feature/SleepPlanner.tsx`

---

## 13. Time Difference Calculator

-   **Purpose**: To quickly find the time difference between two timezones at a specific date and time.
-   **How it Works**:
    1.  User selects a "From" timezone and a "To" timezone.
    2.  User inputs a date and time for the "From" timezone.
    3.  The tool automatically calculates and displays:
        *   The corresponding date and time in the "To" timezone.
        *   A human-readable summary of the time difference (e.g., "Tokyo is 7 hours ahead of Paris").
-   **Key Inputs**: "From" Timezone, "To" Timezone, Date, Time.
-   **Key Outputs**: Converted time in "To" zone, time difference summary.
-   **File**: `src/components/feature/TimeDifferenceCalculator.tsx`

---

## 14. Stopwatch

-   **Purpose**: A classic stopwatch to measure elapsed time with lap functionality.
-   **How it Works**:
    1.  Buttons for "Start/Stop", "Lap", and "Reset".
    2.  Displays elapsed time with millisecond precision.
    3.  Lists recorded lap times.
-   **Key Inputs**: User interaction (start, stop, lap, reset).
-   **Key Outputs**: Elapsed time display, list of lap times.
-   **File**: `src/components/feature/Stopwatch.tsx`

---

## 15. Date Duration Calculator

-   **Purpose**: To calculate the exact duration (in years, months, weeks, and days, plus total days) between two specified dates.
-   **How it Works**:
    1.  User selects a "Start Date" and an "End Date".
    2.  The tool automatically calculates and displays the duration.
    3.  Handles cases where the end date might be before the start date by showing an error.
-   **Key Inputs**: Start Date, End Date.
-   **Key Outputs**: Duration in a human-readable breakdown and as total days.
-   **File**: `src/components/feature/DateDurationCalculator.tsx`

---

## 16. Workday Calculator

-   **Purpose**: To calculate a future date by adding a specified number of business days (Monday-Friday) to a start date, excluding weekends.
-   **How it Works**:
    1.  User selects a "Start Date".
    2.  User inputs the number of "Business Days to Add".
    3.  The tool calculates and displays the resulting workday. (Note: Auto-calculates on input change).
    4.  It does not account for public holidays.
-   **Key Inputs**: Start Date, Number of Business Days.
-   **Key Outputs**: Resulting workday date.
-   **File**: `src/components/feature/WorkdayCalculator.tsx`

---

## 17. Shift Planner (Shift Work Viewer)

-   **Purpose**: A simplified tool to help users visualize a recurring shift pattern for themselves, and optionally see how those shift times translate to one other timezone.
-   **How it Works**:
    1.  User inputs their local timezone, shift start time, shift duration, work pattern (days on/off), a reference start date for an "on" cycle, and number of weeks to display.
    2.  Optionally, user can select an additional timezone for comparison.
    3.  The tool generates a schedule table showing:
        *   Date and day of the week.
        *   Work status ("Working" or "Off Day") and shift times in the local timezone.
        *   If an additional timezone is selected, work status and shift times in that timezone.
-   **Key Inputs**: Local Timezone, Shift Start Time, Duration, Work Pattern, Reference Date, Weeks to Display, Optional Additional Timezone.
-   **Key Outputs**: A schedule table visualizing the shift pattern.
-   **File**: `src/components/feature/ShiftPlanner.tsx`

---
