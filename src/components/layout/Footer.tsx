
import { Globe } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-card border-t border-border shadow-sm mt-auto">
      <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Globe className="h-5 w-5 text-primary" />
          <p className="text-sm">
            ChronoSync - Your Global Time Companion
          </p>
        </div>
        <p className="text-xs">
          &copy; {currentYear} ChronoSync. All rights reserved. 
          Time data provided by Luxon and is for informational purposes only.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
