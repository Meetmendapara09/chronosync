
"use client";

import { Globe, Share2, Github } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const GITHUB_REPO_URL = "https://github.com/MeetMendapara09/chronosync"; 

const Footer = () => {
  const [year, setYear] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    setYear(new Date().getFullYear().toString());
  }, []);

  const handleShare = async () => {
    const shareData = {
      title: 'ChronoSync - Master Time Across the Globe',
      text: 'Check out ChronoSync for awesome time zone tools!',
      url: window.location.origin,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast({ title: "Thanks for sharing!" });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.origin);
        toast({ title: "Link Copied!", description: "ChronoSync URL copied to your clipboard." });
      } else {
        toast({ title: "Sharing not supported", description: "Could not automatically share or copy. Please copy the URL manually.", variant: "destructive" });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast({ title: "Sharing Failed", description: "Something went wrong while trying to share.", variant: "destructive" });
    }
  };

  return (
    <footer className="bg-card border-t border-border shadow-sm mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="flex flex-col items-center md:items-start">
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-primary mb-2">
              <Globe className="h-6 w-6" />
              ChronoSync
            </Link>
            <p className="text-xs text-muted-foreground text-center md:text-left">
              Your ultimate suite for mastering time across the globe.
            </p>
          </div>

          <div className="flex flex-col items-center gap-2 text-sm">
            <Link href="/features" className="text-muted-foreground hover:text-primary transition-colors">
              Features
            </Link>
            <Link href="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
              <Github className="h-4 w-4" /> GitHub
            </a>
          </div>

          <div className="flex flex-col items-center md:items-end">
            <Button onClick={handleShare} variant="outline" size="sm">
              <Share2 className="mr-2 h-4 w-4" />
              Share ChronoSync
            </Button>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-border/50 text-center">
          <p className="text-xs text-muted-foreground">
            {year && `© ${year} `}ChronoSync. All rights reserved.
            Time data provided by Luxon and is for informational purposes only.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
