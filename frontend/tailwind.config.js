
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Material Design 3 Colors
        mdPrimary: "#0b57d0",
        mdOnPrimary: "#ffffff",
        mdPrimaryContainer: "#d3e3fd",
        mdOnPrimaryContainer: "#041e49",
        mdSecondary: "#00639b",
        mdOnSecondary: "#ffffff",
        mdSecondaryContainer: "#cce5ff",
        mdOnSecondaryContainer: "#001d35",
        mdSurface: "#fdfbff",
        mdOnSurface: "#1a1b1e",
        mdSurfaceVariant: "#e1e2e8",
        mdOnSurfaceVariant: "#44474e",
        mdOutline: "#74777f",
        mdError: "#b3261e",
        // Legacy colors kept temporarily for transition
        primary: "#0F4C5C",
        accent: "#F4D35E",
        tealDeep: "#0F766E",
        lemon: "#F4D03F"
      },
      fontFamily: {
        sans: ['"Outfit"', 'sans-serif'],
      },
      boxShadow: {
        'md1': '0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
        'md2': '0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)',
        'md3': '0px 1px 3px 0px rgba(0, 0, 0, 0.3), 0px 4px 8px 3px rgba(0, 0, 0, 0.15)',
      }
    }
  },
  plugins: []
}
