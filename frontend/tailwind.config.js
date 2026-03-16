
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0F766E", // Teal
          dark: "#0D5F58",
          light: "#14B8A6",
          container: "#ccfbf1",
        },
        secondary: {
          DEFAULT: "#0F4C5C", // Deep Blue
          dark: "#0A3642",
          light: "#1E6B7D",
          container: "#e0f2fe",
        },
        accent: {
          DEFAULT: "#FDE047", // yellow-300
          dark: "#EAB308", // yellow-500
          container: "#fef9c3",
        },
        surface: {
          DEFAULT: "#F9FAFB", // gray-50
          dark: "#F3F4F6", // gray-100
          variant: "#E5E7EB", // gray-200
        },
        onSurface: {
          DEFAULT: "#111827", // gray-900
          variant: "#4B5563", // gray-600
        },
        mdPrimary: "#006A6A",
        mdOnPrimary: "#FFFFFF",
        mdPrimaryContainer: "#D1F0EF",
        mdOnPrimaryContainer: "#002020",
        mdSecondary: "#4A6363",
        mdOnSecondary: "#FFFFFF",
        mdSecondaryContainer: "#CCE8E7",
        mdOnSecondaryContainer: "#051F1F",
        mdSurface: "#F4FBFA",
        mdOnSurface: "#191C1C",
        mdSurfaceVariant: "#DAE5E3",
        mdOnSurfaceVariant: "#3F4948",
        mdOutline: "#6F7978",
        mdError: "#BA1A1A",
        mdOnError: "#FFFFFF",
        mdErrorContainer: "#FFDAD6",
        mdOnErrorContainer: "#410002",
      },
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
        display: ['"Montserrat"', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        }
      },
      boxShadow: {
        'premium': '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
        'lifted': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      }
    }
  },
  plugins: []
}
