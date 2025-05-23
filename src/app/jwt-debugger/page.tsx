
import JwtDebugger from '@/components/feature/JwtDebugger';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'JWT Debugger - ChronoSync',
  description: 'Decode JSON Web Tokens (JWTs), inspect their claims, and check expiry status.',
};

export default function JwtDebuggerPage() {
  return <JwtDebugger />;
}
