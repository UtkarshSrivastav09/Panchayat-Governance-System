import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        kisan: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          950: "#052e16",
        },
        mandi: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
        earth: {
          50: "#faf5f0",
          100: "#f3e8db",
          200: "#e6cfb7",
          300: "#d5b28e",
          400: "#c39367",
          500: "#b47a4b",
          600: "#9e613b",
          700: "#7c4a30",
          800: "#643c2b",
          900: "#543327",
        }
      },
      boxShadow: {
        'tactile': '0 4px 14px 0 rgba(22, 163, 74, 0.15), 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
        'tactile-hover': '0 8px 25px 0 rgba(22, 163, 74, 0.25), 0 4px 8px 0 rgba(0, 0, 0, 0.08)',
        'warm': '0 10px 30px -5px rgba(217, 119, 6, 0.12), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
};
export default config;
