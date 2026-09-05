import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0c0d12',
        night: '#0a0b12',
        black: '#05060b',
        green: '#00e08f',
        pink: '#ff3468',
        amber: '#f5a623'
      },
      fontFamily: {
        display: ['Georgia', 'Times New Roman', 'serif'],
        sans: ['Arial', 'Helvetica', 'sans-serif']
      }
    }
  },
  plugins: []
};

export default config;
