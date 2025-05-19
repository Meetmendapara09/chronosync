
import MultiTimezoneMeetingPlanner from '@/components/feature/MultiTimezoneMeetingPlanner';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Multi-Timezone Meeting Planner - ChronoSync',
  description: 'Plan meetings across multiple time zones by visualizing overlapping working hours.',
};

export default function MultiTimezoneMeetingPlannerPage() {
  return <MultiTimezoneMeetingPlanner />;
}
