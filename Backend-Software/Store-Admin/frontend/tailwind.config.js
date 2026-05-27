/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0c0c0e",
        foreground: "#f4f4f6",
        card: "rgba(20, 20, 23, 0.65)",
        border: "rgba(255, 255, 255, 0.08)",
        accent: {
          emerald: "#10b981",
          rose: "#f43f5e",
          indigo: "#6366f1",
          amber: "#f59e0b",
        }
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Outfit", "sans-serif"],
      },
      backdropBlur: {
        md: "12px",
      }
    },
  },
  plugins: [],
}
