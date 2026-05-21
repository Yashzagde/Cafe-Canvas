import type { Metadata } from 'next';
import './styles/animations.css';

export const metadata: Metadata = {
  title: 'CafeCanvas - Your Restaurant Deserves Better',
  description: 'Stop juggling spreadsheets, lost orders, and missed customers. One software. Complete control. 10x efficiency.',
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full overflow-x-hidden">
      {children}
    </div>
  );
}
