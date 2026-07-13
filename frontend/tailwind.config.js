/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    screens: {
      // Default breakpoints
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
      // Custom breakpoints from your App.css
      // These are max-width, so we use the 'max' key.
      // See: https://tailwindcss.com/docs/screens#max-width-breakpoints
      'max-lg': { max: '900px' }, // For sidebar width change
      'max-md': { max: '700px' }, // For hiding the sidebar
    },
    extend: {
      colors: {
        bg: '#f4f7fb',
        surface: '#ffffff',
        text: '#172033',
        muted: '#7b8498',
        border: '#e7eaf0',
        primary: '#5b5cf0',
        'primary-soft': '#eeeeff',
      },
      spacing: {
        sidebar: '260px',
        'sidebar-md': '220px',
      },
    },
  },
  plugins: [],
}