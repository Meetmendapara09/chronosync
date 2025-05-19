
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Timer, Globe, Share2, Users, ShieldCheck, Github, Zap } from "lucide-react";
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ChronoSync - Master Time Across the Globe',
  description: 'Your ultimate suite of tools for time zone conversion, meeting planning, event scheduling, and more. Designed for simplicity and privacy.',
};

const GITHUB_REPO_URL = "https://github.com/your-username/chronosync"; // Replace with your actual repo URL

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container mx-auto px-4 text-center">
          <Timer className="h-20 w-20 text-primary mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
            Master Time Across the Globe with <span className="text-primary">ChronoSync</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            ChronoSync offers a powerful suite of intuitive tools for time zone conversion, meeting planning, event scheduling, and more. Simplify your global interactions, stay organized, and manage time effortlessly.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link href="/features" passHref>
              <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground">
                <Zap className="mr-2 h-5 w-5" /> Explore Features
              </Button>
            </Link>
            <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-6">
                <Github className="mr-2 h-5 w-5" /> View on GitHub
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Features Highlight Section */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">Why Choose ChronoSync?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="p-3 bg-primary/10 rounded-md w-fit mb-3">
                  <Globe className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Comprehensive Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  From time zone conversion and world clocks to multi-timezone meeting planners and event schedulers, get all the time tools you need in one place.
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="p-3 bg-primary/10 rounded-md w-fit mb-3">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">User-Friendly Design</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Intuitive and easy-to-use interface, making complex time management tasks simple for everyone, tech-savvy or not.
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                 <div className="p-3 bg-primary/10 rounded-md w-fit mb-3">
                    <ShieldCheck className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Privacy-Focused</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Your data is yours. Features like the Event Scheduler store information directly in shareable links, not on our servers.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Placeholder for more sections like Testimonials or Detailed Feature Breakdown if needed */}
      <section className="py-16 md:py-20 bg-muted/50">
        <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">Ready to Sync Your Time?</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
                Stop juggling time zones and start streamlining your global communications. ChronoSync is free, open-source, and built for you.
            </p>
            <Link href="/features" passHref>
              <Button size="lg" className="text-lg px-10 py-6 bg-primary hover:bg-primary/90 text-primary-foreground">
                Get Started Now
              </Button>
            </Link>
        </div>
      </section>
    </div>
  );
}
