
import CronHelper from '@/components/feature/CronHelper';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cron Expression Helper - ChronoSync',
  description: 'Build, visualize, and understand cron expressions for scheduling tasks.',
};

export default function CronHelperPage() {
  return <CronHelper />;
}
