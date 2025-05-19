
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe2, Timer as CountdownIcon, Clock, CalendarDays, Cpu, ArrowRight, Users, PhoneCall, Sunrise, Map } from "lucide-react"; 
import type { LucideIcon } from "lucide-react";

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
    title: "Meeting Planner",
    description: "Plan meetings across multiple time zones visually.",
    link: "/multi-timezone-meeting-planner",
    cta: "Plan Meeting",
  },
  {
    icon: PhoneCall,
    title: "Best Time to Call",
    description: "Find optimal overlapping work hours between two locations.",
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
    icon: Map,
    title: "Time Zone Map",
    description: "Explore global time zones on an interactive map.",
    link: "/time-zone-map",
    cta: "View Map",
  }
];

export default function HomePage() {
  return (
    <div className="flex flex-col items-center">
      <section className="text-center py-12 md:py-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
          Welcome to <span className="text-primary">ChronoSync</span>
        </h1>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Your ultimate suite of tools for managing time across the globe. Explore our features to simplify your scheduling and planning.
        </p>
      </section>

      <section className="w-full max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature) => (
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
