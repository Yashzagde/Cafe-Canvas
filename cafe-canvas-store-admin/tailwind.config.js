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
          /* ─── New Boutique Warm Palette (Stitch Design System) ─── */
          cream:       '#F7EEE2',   // Primary background
          surface:     '#E2C9A3',   // Card/panel surfaces (secondary)
          highlight:   '#FFF6EC',   // Elevated cards, tooltips, white highlight
          border:      '#DEC5A4',   // Borders and dividers
          champagne:   '#D6C4AA',   // Subtle borders
          
          /* Accents */
          rose:        '#FFC9CD',   // Accent 1 – Rose Quartz (CTAs, alerts)
          rose_dark:   '#E8A5AA',   // Rose hover
          rose_deep:   '#D48B90',   // Rose active/pressed
          mint:        '#B4F8C8',   // Accent 2 – Mint Green (success, positive)
          mint_dark:   '#8CE0A8',   // Mint hover
          mint_deep:   '#6BC88A',   // Mint active/pressed
          
          /* Mid-tones */
          tan:         '#C9B19C',   // Mid-tone (borders, sidebar accents, muted text)
          tan_light:   '#D9C9B6',   // Tan lighter
          tan_dark:    '#B09A84',   // Tan darker
          
          /* Text */
          brown:       '#4A3728',   // Primary text (dark warm brown)
          brown_mid:   '#8B7355',   // Secondary / muted text
          brown_light: '#A89580',   // Placeholder / disabled text
          
          /* Sidebar */
          sidebar:     '#4A3728',   // Sidebar dark background
          sidebar_mid: '#5D4A3A',   // Sidebar hover
          sidebar_light:'#7A6452',  // Sidebar section labels
          
          /* Status */
          sage:        '#6DB87A',   // Success green
          coral:       '#E8735A',   // Warning/notification orange
          error:       '#E05252',   // Error red
          
          /* Legacy aliases for backward compat */
          terracotta:  '#C9B19C',   // Now maps to mid-tone (was primary action)
          terra_light: '#D9C9B6',   // Tan lighter
          terra_dark:  '#B09A84',   // Tan darker
          gold:        '#C9B19C',   // Now maps to tan mid-tone
          gold_light:  '#D9C9B6',   // Tan lighter
          teal:        '#B4F8C8',   // Now maps to mint
          teal_light:  '#C8FCD8',   // Mint lighter
        }
      },
      fontFamily: {
        display: ['Playfair Display', 'Cormorant Garamond', 'serif'],
        body: ['Plus Jakarta Sans', 'Nunito', 'sans-serif'],
      },
      boxShadow: {
        'boutique':     '0 4px 20px rgba(74, 55, 40, 0.08)',
        'boutique-md':  '0 8px 32px rgba(74, 55, 40, 0.12)',
        'boutique-lg':  '0 16px 48px rgba(74, 55, 40, 0.16)',
        'card':         '0 2px 12px rgba(74, 55, 40, 0.06)',
        'card-hover':   '0 8px 24px rgba(74, 55, 40, 0.10)',
        'glass':        '0 8px 32px rgba(74, 55, 40, 0.08), inset 0 1px 0 rgba(255,255,255,0.4)',
      },
      borderRadius: {
        'boutique': '12px',
      },
      backgroundImage: {
        'rose-gradient':  'linear-gradient(135deg, #FFC9CD 0%, #FFE0E3 100%)',
        'mint-gradient':  'linear-gradient(135deg, #B4F8C8 0%, #D4FFE0 100%)',
        'warm-gradient':  'linear-gradient(135deg, #F7EEE2 0%, #E2C9A3 100%)',
        'cream-gradient': 'linear-gradient(180deg, #FFF6EC 0%, #F7EEE2 100%)',
        'sidebar-gradient':'linear-gradient(180deg, #4A3728 0%, #3D2B1F 100%)',
      },
    },
  },
  plugins: [],
}
