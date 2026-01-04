/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#6AA84F',
        'primary-light': '#E8F5E9',
        'bg-light': '#F3F7F1',
        'text-dark': '#1F2937',
        'text-gray': '#6B7280',
      },
      backgroundColor: {
        'dark-bg': '#1F2937',
        'dark-surface': '#111827',
      },
      textColor: {
        'dark-text': '#F3F4F6',
        'dark-gray': '#D1D5DB',
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        slideUp: {
          'from': { transform: 'translateY(20px)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
    },
  },
}
