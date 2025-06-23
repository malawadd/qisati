/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#A589E8',
        'primary-hover': '#9575E0',
        secondary: '#6B7280',
        'bg-grid': '#E3DFF2',
        'neo-green': '#6EE7B7',
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      spacing: {
        'section': '2rem',
        'container': '1rem',
      },
      borderRadius: {
        'container': '4px',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.neo': {
          border: '4px solid #000',
          borderRadius: '4px',
          boxShadow: '4px 4px 0 0 #000',
        },
        '.grid-bg': {
          backgroundColor: '#E3DFF2',
          backgroundImage: `
            linear-gradient(#999 1px, transparent 1px),
            linear-gradient(90deg, #999 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        },
      })
    }
  ],
}
