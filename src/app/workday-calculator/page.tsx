
import WorkdayCalculator from '@/components/feature/WorkdayCalculator';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Workday Calculator - ChronoSync',
  description: 'Calculate a future date by adding a specific number of business days, excluding weekends.',
};

export default function WorkdayCalculatorPage() {
  return <WorkdayCalculator />;
}
