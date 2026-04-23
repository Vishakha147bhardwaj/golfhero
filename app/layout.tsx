import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GolfHero — Play, Win, Give',
  description: 'Golf performance tracking meets charity fundraising. Enter your scores, join monthly prize draws, and support causes you love.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}