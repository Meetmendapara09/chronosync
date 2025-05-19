
import EventScheduler from '@/components/feature/EventScheduler';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Event Scheduler - ChronoSync',
  description: 'Schedule events and generate shareable links that display in the viewer\'s local time.',
};

export default function EventSchedulerPage() {
  return <EventScheduler />;
}
