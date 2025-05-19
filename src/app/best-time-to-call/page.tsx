
import BestTimeToCall from '@/components/feature/BestTimeToCall';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Best Time to Call - ChronoSync',
  description: 'Find the optimal overlapping times for calling between two locations.',
};

export default function BestTimeToCallPage() {
  return <BestTimeToCall />;
}
