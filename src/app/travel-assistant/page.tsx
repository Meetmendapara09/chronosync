
import TravelTimeAssistant from '@/components/feature/TravelTimeAssistant';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Travel Time Zone Assistant - ChronoSync',
  description: 'Plan your travel across time zones by calculating local arrival times and time adjustments.',
};

export default function TravelAssistantPage() {
  return <TravelTimeAssistant />;
}
