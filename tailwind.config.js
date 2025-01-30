/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./*.{html,js}"],
    theme: {
      colors: {
        'red-danger': '#AF0505'
      },
      extend: {},
    },
    plugins: [
      require('tailwind-scrollbar-hide'),
    ],
  }