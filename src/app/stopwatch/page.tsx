
import Stopwatch from '@/components/feature/Stopwatch';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Stopwatch - ChronoSync',
  description: 'A simple and accurate stopwatch with lap functionality.',
};

export default function StopwatchPage() {
  return <Stopwatch />;
}
