
import UnixTimestampConverter from '@/components/feature/UnixTimestampConverter';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Unix Timestamp Converter - ChronoSync',
  description: 'Convert Unix timestamps to human-readable dates and vice-versa.',
};

export default function UnixTimestampConverterPage() {
  return <UnixTimestampConverter />;
}
