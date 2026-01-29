/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        display: ['DM Serif Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'haven-gradient': 'linear-gradient(120deg, #0D1B2A, #1B263B, #415A77, #778DA9, #E0E1DD)',
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        light: {
          "primary": "#0D1B2A",
          "primary-content": "#E0E1DD",
          "secondary": "#778DA9",
          "secondary-content": "#0D1B2A",
          "accent": "#415A77",
          "accent-content": "#E0E1DD",
          "neutral": "#1B263B",
          "neutral-content": "#E0E1DD",
          "base-100": "#F4F4F8",
          "base-200": "#E0E1DD",
          "base-300": "#A3B1C6",
          "base-content": "#0D1B2A",
          "info": "#3498DB",
          "success": "#2ECC71",
          "warning": "#F1C40F",
          "error": "#E74C3C",
        },
        dark: {
          "primary": "#778DA9",
          "primary-content": "#0D1B2A",
          "secondary": "#415A77",
          "secondary-content": "#E0E1DD",
          "accent": "#A3B1C6",
          "accent-content": "#0D1B2A",
          "neutral": "#1B263B",
          "neutral-content": "#E0E1DD",
          "base-100": "#0D1B2A",
          "base-200": "#1B263B",
          "base-300": "#415A77",
          "base-content": "#E0E1DD",
          "info": "#3498DB",
          "success": "#2ECC71",
          "warning": "#F1C40F",
          "error": "#E74C3C",
        },
      },
    ],
  },
}
