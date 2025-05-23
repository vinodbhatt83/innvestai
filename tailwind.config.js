// tailwind.config.js
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: { // Renaming to 'themeDark' or similar could be an option if 'primary' is confusing
          DEFAULT: '#1A202C', // New Primary Dark
          light: '#2D3748',   // New Primary Medium
        },
        secondary: { // This will now be Accent Purple and Accent Blue
          DEFAULT: '#6B46C1', // New Accent Purple
          light: '#3182CE',   // New Accent Blue
        },
        neutral: { // Existing neutral palette - generally fine
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
        // It might be good to add the specific names for clarity too,
        // though reusing primary/secondary is efficient for existing class usage.
        // For example:
        // accentPurple: '#6B46C1',
        // accentBlue: '#3182CE',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Keep existing font
      },
    },
  },
  plugins: [],
};