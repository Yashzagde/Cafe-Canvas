/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          bg:      '#0f0f13',
          surface: '#1a1a24',
          border:  '#2a2a38',
          muted:   '#3a3a50',
        },
        accent: {
          emerald:  '#00d68f',
          amber:    '#ffc94d',
          crimson:  '#e94560',
          sapphire: '#4d7cfe',
          violet:   '#9b59b6',
        },
        text: {
          primary:   '#f0f0f7',
          secondary: '#8888aa',
          muted:     '#55557a',
        },
        // Legacy compat (existing pages reference these)
        background: '#0f0f13',
        foreground: '#f0f0f7',
        card: '#1a1a24',
        border: '#2a2a38',
      },
      fontFamily: {
        sans:    ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
        heading: ['Sora', 'DM Sans', 'system-ui', 'sans-serif'],
        display: ['Sora', 'DM Sans', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      borderRadius: {
        'xl':  '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
      animation: {
        'spin-slow': 'spin 2s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
      },
    },
  },
  plugins: [],
}
