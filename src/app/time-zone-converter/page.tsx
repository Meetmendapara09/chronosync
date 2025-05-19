import TimeZoneConverter from '@/components/feature/TimeZoneConverter';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Time Zone Converter - ChronoSync',
  description: 'Convert time between selected time zones with ease.',
};

export default function TimeZoneConverterPage() {
  return <TimeZoneConverter />;
}
