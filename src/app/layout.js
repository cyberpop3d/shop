import './globals.css';

export const metadata = {
  title: 'CyberPop Shop',
  description: 'Playable 3D printable toy shop foundation for CyberPop3D.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
