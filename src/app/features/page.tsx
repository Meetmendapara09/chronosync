
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe2, Timer as CountdownIcon, Clock, CalendarDays, Cpu, ArrowRight, Users, PhoneCall, Sunrise, CalendarPlus, Plane, CalendarClock, MapPin, Bed, Clock10, TimerIcon as StopwatchIcon } from "lucide-react"; 
import type { LucideIcon } from "lucide-react";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Features - ChronoSync',
  description: 'Explore all the time management tools offered by ChronoSync.',
};

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  link: string;
  cta: string;
}

const features: Feature[] = [
  {
    icon: Globe2,
    title: "Time Zone Converter",
    description: "Easily convert times between different global time zones.",
    link: "/time-zone-converter",
    cta: "Convert Time",
  },
  {
    icon: CountdownIcon,
    title: "Countdown Timer",
    description: "Set a countdown to your important events and deadlines.",
    link: "/countdown-timer",
    cta: "Set Countdown",
  },
  {
    icon: Clock,
    title: "World Clock",
    description: "View the current time in multiple cities around the world.",
    link: "/world-clock",
    cta: "View Clocks",
  },
  {
    icon: CalendarDays,
    title: "Date Calculator",
    description: "Add or subtract durations from a specific date effortlessly.",
    link: "/date-calculator",
    cta: "Calculate Date",
  },
  {
    icon: Cpu,
    title: "Unix Timestamp Converter",
    description: "Convert Unix timestamps to/from human-readable dates.",
    link: "/unix-timestamp-converter",
    cta: "Convert Timestamp",
  },
  {
    icon: Users,
    title: "Multi-Timezone Meeting Planner",
    description: "Plan meetings across multiple time zones visually.",
    link: "/multi-timezone-meeting-planner",
    cta: "Plan Meeting",
  },
  {
    icon: PhoneCall,
    title: "Best Time to Call",
    description: "Find optimal overlapping work hours between locations.",
    link: "/best-time-to-call",
    cta: "Find Best Times",
  },
  {
    icon: Sunrise,
    title: "Sunrise/Sunset Times",
    description: "Find sunrise and sunset times for cities worldwide.",
    link: "/sunrise-sunset",
    cta: "Find Times",
  },
  {
    icon: CalendarPlus,
    title: "Event Scheduler",
    description: "Schedule events & generate shareable links for any timezone.",
    link: "/event-scheduler",
    cta: "Schedule Event",
  },
  {
    icon: Plane,
    title: "Travel Time Assistant",
    description: "Plan travel across time zones, see local arrival times.",
    link: "/travel-assistant",
    cta: "Plan Travel",
  },
  {
    icon: CalendarClock,
    title: "DST Change Finder",
    description: "Check for upcoming Daylight Saving Time transitions.",
    link: "/dst-change-finder",
    cta: "Check DST",
  },
  {
    icon: MapPin,
    title: "Time Zone Map",
    description: "Interactive map to explore global time zones visually.",
    link: "/time-zone-map",
    cta: "View Map",
  },
  {
    icon: Bed,
    title: "Sleep Planner",
    description: "Plan your sleep schedule across different time zones.",
    link: "/sleep-planner",
    cta: "Plan Sleep",
  },
  {
    icon: Clock10,
    title: "Time Difference Calculator",
    description: "Instantly find the time difference between two timezones.",
    link: "/time-difference-calculator",
    cta: "Calculate Difference",
  },
  {
    icon: StopwatchIcon,
    title: "Stopwatch",
    description: "Measure elapsed time with lap functionality.",
    link: "/stopwatch",
    cta: "Use Stopwatch",
  }
];

export default function FeaturesPage() {
  return (
    <div className="flex flex-col items-center py-8">
      <section className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
          ChronoSync Features
        </h1>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          A comprehensive suite of tools to help you master time across the globe. Explore each feature to simplify your scheduling and planning needs.
        </p>
      </section>

      <section className="w-full max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.sort((a, b) => a.title.localeCompare(b.title)).map((feature) => (
            <Card key={feature.title} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <feature.icon className="h-8 w-8 text-primary" />
                  <CardTitle className="text-2xl font-semibold">{feature.title}</CardTitle>
                </div>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-end">
                <Link href={feature.link} passHref>
                  <Button variant="default" className="w-full mt-auto bg-primary hover:bg-primary/90">
                    {feature.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
