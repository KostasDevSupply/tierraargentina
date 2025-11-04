/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        tierra: {
          brown: '#8B4513',
          beige: '#F5DEB3',
          green: '#2D5016',
        }
      },
    },
  },
  plugins: [],
}