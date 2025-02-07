/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: {
          DEFAULT: '#FFFCF9',
          dark: '#1A1614'
        },
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: '#C45E24',
          light: '#F5D0B5',
          dark: '#A64D1C',
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: '#8C4A3B',
          light: '#D6B4A8',
          dark: '#6B382D',
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: '#E6A168',
          light: '#FFE4CC',
          dark: '#B37B4A'
        },
        surface: {
          DEFAULT: '#FFF6F0',
          secondary: '#FFF1E6',
          dark: '#242020',
          'dark-secondary': '#2A2524'
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Newsreader', 'serif'],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} 