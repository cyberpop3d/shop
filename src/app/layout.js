import './globals.css';

export const metadata = {
  title: 'CyberPop Shop',
  description: 'Playable 3D printable collectible shop foundation.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
