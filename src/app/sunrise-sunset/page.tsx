
import SunriseSunsetFinder from '@/components/feature/SunriseSunsetFinder';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sunrise & Sunset Times - ChronoSync',
  description: 'Find sunrise and sunset times for various cities on a selected date.',
};

export default function SunriseSunsetPage() {
  return <SunriseSunsetFinder />;
}
