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
          DEFAULT: '#4A00E0',
          light: '#6B28E8',
          dark: '#3500B0',
        },
        secondary: {
          DEFAULT: '#8E2DE2',
          light: '#A855F7',
          dark: '#7C22D0',
        },
        accent: {
          DEFAULT: '#FFD700',
          light: '#FFE44D',
          dark: '#D4AF37',
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#3B82F6',
        // 슬롯머신 보라색 테마 (확장)
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
          light: '#FFE44D',
          dark: '#D4AF37',
        },
        // 배경색
        bg: {
          primary: '#0F0F1B',
          secondary: '#1A1A2E',
          tertiary: '#2A2A3E',
        },
      },
      fontFamily: {
        heading: ['Poppins', 'Noto Sans', 'sans-serif'],
        body: ['Open Sans', 'Noto Sans', 'sans-serif'],
        display: ['Orbitron', 'monospace'],
        poppins: ['Poppins', 'sans-serif'],
        orbitron: ['Orbitron', 'sans-serif'],
        openSans: ['Open Sans', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'win-pulse': 'win-pulse 0.5s ease-in-out',
        'jackpot-shake': 'jackpot-shake 0.5s ease-in-out',
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
        'glow-pulse': {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(241, 196, 15, 0.6)',
          },
          '50%': {
            boxShadow: '0 0 30px rgba(241, 196, 15, 0.9)',
          },
        },
        'win-pulse': {
          '0%, 100%': {
            transform: 'scale(1)',
            boxShadow: '0 0 0 rgba(255, 215, 0, 0)',
          },
          '50%': {
            transform: 'scale(1.1)',
            boxShadow: '0 0 20px rgba(255, 215, 0, 0.8)',
          },
        },
        'jackpot-shake': {
          '0%, 100%': { transform: 'translateX(0) rotate(0deg)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px) rotate(-2deg)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(5px) rotate(2deg)' },
        },
      },
      screens: {
        'xs': '320px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [],
}
