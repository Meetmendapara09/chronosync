
import TimeDifferenceCalculator from '@/components/feature/TimeDifferenceCalculator';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Time Difference Calculator - ChronoSync',
  description: 'Instantly find the time difference between two time zones for any specific date and time.',
};

export default function TimeDifferenceCalculatorPage() {
  return <TimeDifferenceCalculator />;
}
