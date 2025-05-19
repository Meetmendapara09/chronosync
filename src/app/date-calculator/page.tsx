import DateCalculator from '@/components/feature/DateCalculator';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Date Calculator - ChronoSync',
  description: 'Add or subtract days, weeks, months, or years from a given date.',
};

export default function DateCalculatorPage() {
  return <DateCalculator />;
}
