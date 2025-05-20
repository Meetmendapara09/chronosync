
import ShiftPlanner from '@/components/feature/ShiftPlanner';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shift Planner - ChronoSync',
  description: 'Plan and visualize your recurring shift work schedule across timezones.',
};

export default function ShiftPlannerPage() {
  return <ShiftPlanner />;
}
