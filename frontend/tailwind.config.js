/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",
        secondary: "#0F172A",
        accent: "#38BDF8",
        success: "#10B981",
        danger: "#EF4444",
        bg: "#F8FAFC",
        dark: "#0B1120",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        soft: "0 2px 20px rgba(15, 23, 42, 0.06)",
        softDark: "0 2px 20px rgba(0, 0, 0, 0.35)",
      },
    },
  },
  plugins: [],
};
