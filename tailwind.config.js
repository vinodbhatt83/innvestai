// tailwind.config.js
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1A2A4A', // Dark navy blue from the InnVestAI logo
          light: '#2c3e62',
          dark: '#111c33',
        },
        secondary: {
          DEFAULT: '#1CB4A9', // Teal from the InnVestAI logo
          light: '#25d9cc',
          dark: '#17938a',
        },
        accent: {
          DEFAULT: '#4a6baf', // Medium blue accent color
          light: '#6a89c9',
          dark: '#385290',
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
      maxWidth: {
        'content': '1200px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 4px 6px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
};