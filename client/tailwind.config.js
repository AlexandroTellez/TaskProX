/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1280px',   // Cambiado de 1024px a 1280px
      xl: '1440px',
      '2xl': '1536px',
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        primary: '#FED36A',      // Amarillo botones
        dark: '#1A1A1A',         // Texto principal
        light: '#FFFFFF',        // Fondo
        muted: '#64748B',        // Texto secundario
        border: '#E2E8F0',       // Bordes
        accent: '#F1F5F9'        // Fondos secundarios
      },
      borderRadius: {
        'card': '12px',          // Bordes redondeados para cards
        'btn': '8px'             // Bordes para botones
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'btn': '0 2px 4px rgba(0, 0, 0, 0.05)'
      }
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
