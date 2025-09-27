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
          50: '#f0f9f0',
          100: '#dcf2dc',
          200: '#bce5bc',
          300: '#8dd18d',
          400: '#5bb85b',
          500: '#2d5a2d',
          600: '#1e3d1e',
          700: '#1a351a',
          800: '#152a15',
          900: '#0f1f0f',
        },
        forest: {
          50: '#f0f9f0',
          100: '#dcf2dc',
          200: '#bce5bc',
          300: '#8dd18d',
          400: '#5bb85b',
          500: '#2d5a2d',
          600: '#1e3d1e',
          700: '#1a351a',
          800: '#152a15',
          900: '#0f1f0f',
        },
        sage: {
          50: '#f6f7f4',
          100: '#e8ebe3',
          200: '#d1d7c7',
          300: '#b3c0a5',
          400: '#9aa889',
          500: '#7d8a6b',
          600: '#636d55',
          700: '#505746',
          800: '#42473a',
          900: '#383c32',
        },
        moss: {
          50: '#f4f6f0',
          100: '#e6ebdc',
          200: '#ced7c0',
          300: '#aebd9e',
          400: '#8fa37a',
          500: '#6d7a5a',
          600: '#556048',
          700: '#444d3a',
          800: '#383f30',
          900: '#2f3429',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}