/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#135bec",
        "primary-hover": "#1d6bf3",
        "background-light": "#f6f6f8",
        "background-dark": "#101622",
        "card-dark": "#1b2434",
        "card-hover": "#232f48",
        "surface-dark": "#192233",
        "border-dark": "#232f48",
        "text-secondary": "#92a4c9"
      },
      fontFamily: {
        "display": ["Lexend", "sans-serif"],
        "body": ["Noto Sans", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem", 
        "xl": "0.75rem",
        "full": "9999px"
      },
    },
  },
  plugins: [],
}
