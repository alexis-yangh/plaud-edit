/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'plaud-black':      '#000000',
        'plaud-white':      '#FFFFFF',
        'plaud-warm-light': '#F2EFEB',
        'plaud-warm-dark':  '#413D3B',
        'plaud-green':      '#21EF6A',
        'plaud-blue':       '#00D0FF',
        'plaud-purple':     '#8F53ED',
      },
      borderRadius: {
        plaud: '5px',
      },
      backgroundImage: {
        'plaud-gradient': 'linear-gradient(90deg, #21EF6A 0%, #2CA3FF 50%, #8F53ED 100%)',
      },
      fontFamily: {
        sans: ['"Noto Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
