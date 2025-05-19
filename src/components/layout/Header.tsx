import Link from 'next/link';
import { Timer } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-primary hover:text-primary/90 transition-colors">
          <Timer className="h-7 w-7" />
          <span>ChronoSync</span>
        </Link>
        {/* Future navigation links can go here */}
      </div>
    </header>
  );
};

export default Header;
