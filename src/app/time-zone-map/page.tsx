
import TimeZoneMap from '@/components/feature/TimeZoneMap';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Interactive Time Zone Map - ChronoSync',
  description: 'Explore global time zones on an interactive map and see current times.',
};

export default function TimeZoneMapPage() {
  return <TimeZoneMap />;
}
