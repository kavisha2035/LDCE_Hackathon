/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
          900: '#0c4a6e',
        },
        // Design tokens from frontend-design.md
        paper: '#F6F3EC',
        ink: '#1F2B2E',
        'route-blue': '#2C5F7C',
        ochre: '#B8823A',
        sea: '#7FA69C',
        'stamp-red': '#B84A3E',
      },
      fontFamily: {
        display: ['"Barlow Condensed"', 'sans-serif'],
        body: ['Inter', '"IBM Plex Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        'ticket': '2px',
      }
    },
  },
  plugins: [],
}
