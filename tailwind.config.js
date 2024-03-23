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
      oswald: ['Oswald']
    },
    fontWeight: {
      normal: 400,
      thin: 200
    }
  },
  plugins: [],
}

