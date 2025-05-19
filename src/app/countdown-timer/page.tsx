import CountdownTimer from '@/components/feature/CountdownTimer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Countdown Timer - ChronoSync',
  description: 'Set a live countdown to your important future dates and times.',
};

export default function CountdownTimerPage() {
  return <CountdownTimer />;
}
