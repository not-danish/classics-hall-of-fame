/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./templates/*"],
  theme: {
    extend: {
      colors: {
        'royal-blue': '#03045E'
      }
    },
    fontFamily: {
      overpass: ['Overpass', 'sans-serif'],
    },
    fontWeight: {
      normal: 400,
      thin: 200,
      bold: 500
    }
  },
  plugins: [],
}

