/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./app/**/*.{js,jsx}",
    "./src/**/*.{js,jsx}",
    "*.{js,ts,jsx,tsx,mdx}",
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
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#5b21b6", // Purple-800
          light: "#7c3aed", // Purple-600
          lighter: "#a78bfa", // Purple-400
          dark: "#4c1d95", // Purple-900
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#0f766e", // Teal-700
          light: "#14b8a6", // Teal-500
          dark: "#0f766e", // Teal-700
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "#e11d48", // Rose-600
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#f3f4f6", // Gray-100
          foreground: "#6b7280", // Gray-500
        },
        accent: {
          DEFAULT: "#8b5cf6", // Violet-500
          foreground: "#ffffff",
        },
        popover: {
          DEFAULT: "#ffffff",
          foreground: "#1f2937", // Gray-800
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#1f2937", // Gray-800
        },
        "light-pink": "#f5f0ff", // Custom light purple
        "dark-bg": "#1e1b4b", // Indigo-950
        "card-border": "#e9d5ff", // Purple-200
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem",
        xl: "1rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(91, 33, 182, 0.1)",
        card: "0 10px 30px -5px rgba(91, 33, 182, 0.1)",
        button: "0 4px 10px rgba(91, 33, 182, 0.3)",
        glow: "0 0 15px rgba(124, 58, 237, 0.5)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        pulse: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.5 },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        fadeIn: "fadeIn 0.5s ease-out",
        slideUp: "slideUp 0.5s ease-out",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      scale: {
        102: "1.02",
        105: "1.05",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "hero-pattern": "url('/pattern-bg.svg')",
        "dot-pattern":
          "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fill-opacity='0.1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}

