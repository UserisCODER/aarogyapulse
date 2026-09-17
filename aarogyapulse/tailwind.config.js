/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0F172A",
        slate: {
          150: "#EEF2F7",
        },
        gov: {
          50: "#EFF4FF",
          100: "#DBE6FE",
          500: "#2563EB",
          600: "#1D4ED8",
          700: "#1E40AF",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,23,42,0.04), 0 8px 24px -12px rgba(15,23,42,0.12)",
      },
    },
  },
  plugins: [],
};
