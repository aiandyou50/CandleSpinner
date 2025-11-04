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
        // 슬롯머신 보라색 테마
        purple: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
          gradient: {
            from: '#8E2DE2',
            to: '#4A00E0',
          },
        },
        gold: {
          DEFAULT: '#FFD700',
          dark: '#FFA500',
        },
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        orbitron: ['Orbitron', 'sans-serif'],
        openSans: ['Open Sans', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(138, 43, 226, 0.5)' 
          },
          '50%': { 
            boxShadow: '0 0 40px rgba(138, 43, 226, 0.8)' 
          },
        },
      },
    },
  },
  plugins: [],
}
