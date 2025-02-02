/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./*.{html,js}"],
    theme: {
      colors: {
        'red-danger': '#AF0505'
      },
      extend: {},
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
    plugins: [
      require('tailwind-scrollbar-hide'),
    ],
  }