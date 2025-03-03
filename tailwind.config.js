/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
      "./index.html",
    ],
    theme: {
      extend: {
        colors: {
          primary: "#2563EB",
          background: "#F9FAFB",
          card: "#FFFFFF",
          text: "#111827",
        },
      },
    },
    plugins: [],
  }