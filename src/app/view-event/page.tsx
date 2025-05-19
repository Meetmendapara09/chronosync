
import ViewEvent from '@/components/feature/ViewEvent';
import type { Metadata } from 'next';

// Metadata can be dynamic if we fetch event details server-side in the future
export const metadata: Metadata = {
  title: 'View Event - ChronoSync',
  description: 'View event details in your local time.',
};

export default function ViewEventPage() {
  return <ViewEvent />;
}
