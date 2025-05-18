// tailwind.config.js
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1A2A4A', // Dark navy blue from the InnVestAI logo
          light: '#2c3e62',
        },
        secondary: {
          DEFAULT: '#1CB4A9', // Teal from the InnVestAI logo
          light: '#25d9cc',
        },
        neutral: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};