
import SleepPlanner from '@/components/feature/SleepPlanner';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sleep Planner - ChronoSync',
  description: 'Plan your sleep schedule around different time zones for work or travel.',
};

export default function SleepPlannerPage() {
  return <SleepPlanner />;
}
