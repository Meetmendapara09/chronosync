
import Link from 'next/link';
import { Timer, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';

const GITHUB_REPO_URL = "https://github.com/your-username/chronosync"; // Replace with your actual repo URL

const Header = () => {
  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-primary hover:text-primary/90 transition-colors">
          <Timer className="h-7 w-7" />
          <span>ChronoSync</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/features" passHref>
            <Button variant="ghost" size="sm">Features</Button>
          </Link>
          <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer" aria-label="View source on GitHub">
            <Button variant="ghost" size="icon">
              <Github className="h-5 w-5" />
            </Button>
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
