tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          900: "#3D52A0",
          700: "#7091E6",
          500: "#8697C4",
          300: "#ADB BDA",
          100: "#EDE8F5",
        },
      },
    },
  },
  plugins: [],
};


This gives you Tailwind classes like:

bg-brand-900
bg-brand-700
text-brand-500
border-brand-100