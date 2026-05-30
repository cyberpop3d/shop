import './globals.css';

export const metadata = {
  title: 'CyberPop Shop',
  description: 'Playable storefront foundation for CyberPop3D collectibles, STL files, rewards, and community features.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
