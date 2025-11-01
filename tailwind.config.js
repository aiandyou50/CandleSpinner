/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0088CC',
          dark: '#006699',
        },
        secondary: {
          DEFAULT: '#FF6B6B',
          dark: '#CC5555',
        },
        success: '#51CF66',
        warning: '#FFA94D',
        danger: '#FF6B6B',
      },
    },
  },
  plugins: [],
}
