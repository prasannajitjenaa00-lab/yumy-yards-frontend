/** @type {import(\x27tailwindcss\x27).Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff7ed", 100: "#ffedd5", 500: "#f97316", 600: "#ea580c", 700: "#c2410c",
        },
        ink: { 900: "#111827", 700: "#374151", 500: "#6b7280" },
      },
    },
  },
  plugins: [],
};
