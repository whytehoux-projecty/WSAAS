import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'vintage-green': {
          DEFAULT: '#7D9B7B',
          light: '#8B9D83',
          dark: '#6B8569',
        },
        'faded-gray': {
          DEFAULT: '#9CA3AF',
          light: '#B8BFC6',
        },
        'soft-gold': {
          DEFAULT: '#D4AF7A',
          dark: '#B8941F',
        },
        'warm-cream': '#F5F1E8',
        'off-white': '#FAF9F6',
        parchment: '#F9F7F4',
        charcoal: {
          DEFAULT: '#3D3D3D',
          light: '#5A5A5A',
          lighter: '#787878',
        },
      },
      fontFamily: {
        playfair: ['Playfair Display', 'serif'],
        inter: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'vintage-sm': '0 1px 3px rgba(61, 61, 61, 0.08)',
        'vintage-md': '0 4px 12px rgba(61, 61, 61, 0.10)',
        'vintage-lg': '0 8px 24px rgba(61, 61, 61, 0.12)',
        'vintage-xl': '0 16px 48px rgba(61, 61, 61, 0.15)',
      },
    },
  },
  plugins: [],
};

export default config;
