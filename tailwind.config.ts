import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,js,jsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'Inter', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        soft: '0 30px 90px rgba(70, 160, 255, 0.18)',
        card: '0 20px 70px rgba(32, 118, 214, 0.14)'
      }
    }
  },
  plugins: []
};
export default config;
