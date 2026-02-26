/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      keyframes: {
        spin: {
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        spin: 'spin 1s linear infinite',
      },
      colors: {
        // Expo Brand Colors
        expo: {
          // Primary colors
          navy: '#000020', // Expo dark background
          orange: '#4630EB', // Expo primary blue (replacing orange as primary CTA)
          blue: '#4630EB', // Expo primary blue
          darkBlue: '#2A1B8C', // Expo darker blue
          deepNavy: '#111111', // Expo deep gray/black for sections
          yellow: '#FFC107', // Accent yellow
          white: '#ffffff', // White
          red: '#E53935',
          purple: '#9c27b0',
          lime: '#cddc39',

          // Grays
          gray: {
            50: '#f3f3f8',
            100: '#e1e1e8',
            200: '#c4c4d4',
            300: '#a5a5ba',
            400: '#8a8a9e',
          },
        },

        // Keep existing App.js Conf colors for backwards compatibility
        appBlue: {
          100: '#484dfc',
          80: '#7189ff',
          60: '#a0b9ff',
          40: '#ccd8ff',
          20: '#eef0ff',
        },
        appBlack: {
          100: '#261930',
          80: '#50415b',
          60: '#877b91',
          40: '#cac3d1',
          20: '#e6e2ed',
        },
        appAccent: {
          120: '#ff5a5a',
          100: '#f8d9d6',
          50: '#f7eded',
          0: '#faf8f8',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/container-queries'),
  ],
  corePlugins: {
    textOpacity: true,
  },
};
