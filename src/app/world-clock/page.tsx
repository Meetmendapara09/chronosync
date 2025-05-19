import WorldClock from '@/components/feature/WorldClock';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'World Clock - ChronoSync',
  description: 'Display the current time in multiple cities around the globe.',
};

export default function WorldClockPage() {
  return <WorldClock />;
}
