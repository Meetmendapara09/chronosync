
import DstChangeFinder from '@/components/feature/DstChangeFinder';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DST Change Finder - ChronoSync',
  description: 'Find upcoming Daylight Saving Time changes for selected timezones.',
};

export default function DstChangeFinderPage() {
  return <DstChangeFinder />;
}
