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
          /* ─── White-Slate Modern Palette ─── */
          cream:       '#f8fafc',   // Primary background (Slate 50)
          surface:     '#ffffff',   // Card/panel surfaces (white)
          highlight:   '#ffffff',   // Elevated card highlights (white)
          border:      '#e2e8f0',   // Borders and dividers (Slate 200)
          champagne:   '#cbd5e1',   // Subtle borders (Slate 300)
          
          /* Accents (Amber-Gold and Green) */
          rose:        '#d97706',   // Primary Accent – Amber 600
          rose_dark:   '#b45309',   // Amber hover
          rose_deep:   '#78350f',   // Amber active
          mint:        '#16a34a',   // Success – Green 600
          mint_dark:   '#15803d',   // Green hover
          mint_deep:   '#166534',   // Green active
          
          /* Mid-tones (Slate Grays) */
          tan:         '#94a3b8',   // Slate 400
          tan_light:   '#cbd5e1',   // Slate 300
          tan_dark:    '#475569',   // Slate 600
          
          /* Text */
          brown:       '#1e293b',   // Primary Slate 800
          brown_mid:   '#64748b',   // Secondary Slate 500
          brown_light: '#94a3b8',   // Muted Slate 400
          
          /* Sidebar (White UI) */
          sidebar:     '#ffffff',   
          sidebar_mid: '#f1f5f9',   
          sidebar_light:'#64748b',  
          
          /* Status */
          sage:        '#16a34a',   
          coral:       '#ea580c',   
          error:       '#ef4444',   
          
          /* Compatibility Aliases */
          terracotta:  '#94a3b8',   
          terra_light: '#cbd5e1',   
          terra_dark:  '#475569',   
          gold:        '#d97706',   
          gold_light:  '#fef3c7',   
          teal:        '#16a34a',   
          teal_light:  '#dcfce7',   
        }
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'Nunito', 'sans-serif'],
      },
      boxShadow: {
        'boutique':     '0 4px 20px rgba(148, 163, 184, 0.06)',
        'boutique-md':  '0 8px 32px rgba(148, 163, 184, 0.10)',
        'boutique-lg':  '0 16px 48px rgba(148, 163, 184, 0.14)',
        'card':         '0 2px 12px rgba(148, 163, 184, 0.04)',
        'card-hover':   '0 8px 24px rgba(148, 163, 184, 0.08)',
        'glass':        '0 8px 32px rgba(148, 163, 184, 0.06), inset 0 1px 0 rgba(255,255,255,0.5)',
      },
      borderRadius: {
        'boutique': '12px',
      },
      backgroundImage: {
        'rose-gradient':  'linear-gradient(135deg, #d97706 0%, #fef3c7 100%)',
        'mint-gradient':  'linear-gradient(135deg, #16a34a 0%, #dcfce7 100%)',
        'warm-gradient':  'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
        'cream-gradient': 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
        'sidebar-gradient':'linear-gradient(180deg, #ffffff 0%, #ffffff 100%)',
      },
    },
  },
  plugins: [],
}
