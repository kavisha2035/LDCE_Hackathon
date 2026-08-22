/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: '#F6F3EC',
        ink: '#1F2B2E',
        'route-blue': '#2C5F7C',
        ochre: '#B8823A',
        sea: '#7FA69C',
        'stamp-red': '#B84A3E',
      },
      fontFamily: {
        display: ['"Barlow Condensed"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        'ticket': '2px',
      }
    },
  },
  plugins: [],
}
