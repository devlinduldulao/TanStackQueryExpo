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
        // Conference Colors
        codemotion: {
          // Primary colors
          navy: '#0e1e30', // Main dark blue background
          orange: '#ff5c00', // Primary orange/CTA color
          blue: '#0555fa', // Bright blue accent
          darkBlue: '#044389', // Secondary dark blue
          deepNavy: '#162f4b', // Deep navy for sections
          yellow: '#f9dc5c', // Accent yellow
          white: '#ffffff', // White
          red: '#f44336',
          purple: '#9c27b0',
          lime: '#cddc39',

          // Grays
          gray: {
            50: '#e0e0e0',
            100: '#9e9e9e',
            200: '#616161',
            300: '#424242',
            400: '#212121',
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
