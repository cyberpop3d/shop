import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CyberPop Shop — Playable 3D Print Store',
  description: 'A playable collectible shop for STL files, physical 3D prints, rewards, mini games, makes, and digital collections.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
