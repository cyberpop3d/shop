import "./globals.css";
import Script from "next/script";

export const metadata = {
  title: "CyberPop Shop",
  description: "Playable 3D printable collectible shop prototype"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Script
          src="https://unpkg.com/@google/model-viewer@3.5.0/dist/model-viewer.min.js"
          type="module"
          strategy="afterInteractive"
        />
        {children}
      </body>
    </html>
  );
}
