
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary, #0F766E)", // Teal
          dark: "var(--color-primary-dark, #0D5F58)",
          light: "var(--color-primary-light, #14B8A6)",
          container: "var(--color-primary-container, #ccfbf1)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary, #0F4C5C)", // Deep Blue
          dark: "var(--color-secondary-dark, #0A3642)",
          light: "var(--color-secondary-light, #1E6B7D)",
          container: "var(--color-secondary-container, #e0f2fe)",
        },
        accent: {
          DEFAULT: "var(--color-accent, #FDE047)", // yellow-300
          dark: "var(--color-accent-dark, #EAB308)", // yellow-500
          container: "var(--color-accent-container, #fef9c3)",
        },
        surface: {
          DEFAULT: "var(--color-surface, #F9FAFB)", // gray-50
          dark: "var(--color-surface-dark, #F3F4F6)", // gray-100
          variant: "var(--color-surface-variant, #E5E7EB)", // gray-200
        },
        onSurface: {
          DEFAULT: "var(--color-on-surface, #111827)", // gray-900
          variant: "var(--color-on-surface-variant, #4B5563)", // gray-600
        },
        mdPrimary: "var(--color-md-primary, #006A6A)",
        mdOnPrimary: "var(--color-md-on-primary, #FFFFFF)",
        mdPrimaryContainer: "var(--color-md-primary-container, #D1F0EF)",
        mdOnPrimaryContainer: "var(--color-md-on-primary-container, #002020)",
        mdSecondary: "var(--color-md-secondary, #4A6363)",
        mdOnSecondary: "var(--color-md-on-secondary, #FFFFFF)",
        mdSecondaryContainer: "var(--color-md-secondary-container, #CCE8E7)",
        mdOnSecondaryContainer: "var(--color-md-on-secondary-container, #051F1F)",
        mdSurface: "var(--color-md-surface, #F4FBFA)",
        mdOnSurface: "var(--color-md-on-surface, #191C1C)",
        mdSurfaceVariant: "var(--color-md-surface-variant, #DAE5E3)",
        mdOnSurfaceVariant: "var(--color-md-on-surface-variant, #3F4948)",
        mdOutline: "var(--color-md-outline, #6F7978)",
        mdError: "var(--color-md-error, #BA1A1A)",
        mdOnError: "var(--color-md-on-error, #FFFFFF)",
        mdErrorContainer: "var(--color-md-error-container, #FFDAD6)",
        mdOnErrorContainer: "var(--color-md-on-error-container, #410002)",
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
        'md1': '0 2px 4px 0 rgba(0, 0, 0, 0.05)',
        'md2': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'md3': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
        'premium': '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
        'lifted': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      }
    }
  },
  plugins: []
}
