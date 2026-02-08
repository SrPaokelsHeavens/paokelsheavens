/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        void: '#050505',      // Fondo abisal
        'void-light': '#0a0a0b',
        gold: '#C5A059',      // Oro de formación de núcleo
        'gold-dim': '#8B7342',
        blood: '#7F1D1D',     // Sangre de demonio
      },
      fontFamily: {
        serif: ['Cinzel', 'Playfair Display', 'serif'],
        sans: ['Inter', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
