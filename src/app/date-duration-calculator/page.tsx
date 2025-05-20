
import DateDurationCalculator from '@/components/feature/DateDurationCalculator';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Date Duration Calculator - ChronoSync',
  description: 'Calculate the exact duration in years, months, weeks, and days between two dates.',
};

export default function DateDurationCalculatorPage() {
  return <DateDurationCalculator />;
}
