/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          cream:       '#FFF8F0',   // App background
          surface:     '#FFEEDD',   // Card/panel background
          border:      '#E8D5B7',   // Borders and dividers
          champagne:   '#D4C0A0',   // Subtle borders
          terracotta:  '#C4714A',   // Primary action color
          terra_light: '#E89A72',   // Hover state
          terra_dark:  '#9A5235',   // Active/pressed
          gold:        '#D4A843',   // Accent / highlights
          gold_light:  '#EFC867',   // Gold hover
          teal:        '#4ECDC4',   // Secondary accent
          teal_light:  '#7EDDD7',   // Teal hover
          brown:       '#3D2B1F',   // Primary text
          brown_mid:   '#7A5C4A',   // Secondary text
          brown_light: '#A88B7A',   // Placeholder / muted
          coral:       '#E8735A',   // Notifications / alerts
          sage:        '#6DB87A',   // Success
          error:       '#E05252',   // Error states
        }
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'serif'],
        body: ['Nunito', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
