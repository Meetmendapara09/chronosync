
import LogTimestampAnalyzer from '@/components/feature/LogTimestampAnalyzer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Log Timestamp Analyzer - ChronoSync',
  description: 'Analyze logs by detecting, parsing, and converting timestamps to your desired timezone.',
};

export default function LogTimestampAnalyzerPage() {
  return <LogTimestampAnalyzer />;
}
