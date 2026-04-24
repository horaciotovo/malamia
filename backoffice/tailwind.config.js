/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E8448A',
          dark: '#C4306E',
          light: '#FF79B0',
          soft: 'rgba(232,68,138,0.12)',
        },
        surface: {
          DEFAULT: '#111827',
          secondary: '#1F2937',
          card: '#1A2233',
        },
        brand: {
          black: '#0A0B0E',
          pink: '#E8448A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        pink: '0 4px 20px rgba(232,68,138,0.35)',
        'pink-lg': '0 8px 40px rgba(232,68,138,0.4)',
        card: '0 2px 12px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
};
