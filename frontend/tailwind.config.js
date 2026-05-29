/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        espresso:    '#2C1810',
        coffee:      '#6F4E37',
        mocha:       '#8B5E3C',
        latte:       '#C4956A',
        caramel:     '#D4A056',
        cream:       '#F5E6D3',
        beige:       '#EDD5B3',
        'warm-white':'#FAF7F2',
        parchment:   '#F2E8D9',
        leaf:        '#4A7C59',
        'leaf-light':'#6B9E7A',
        'leaf-pale': '#E8F2EC',
      },
      fontFamily: {
        serif:  ['"Playfair Display"', 'Georgia', 'serif'],
        sans:   ['"Nunito"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'warm-sm': '0 1px 4px rgba(111,78,55,0.08)',
        'warm':    '0 4px 16px rgba(111,78,55,0.12)',
        'warm-lg': '0 8px 32px rgba(111,78,55,0.16)',
      },
      borderRadius: {
        'xl':  '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
    },
  },
  plugins: [],
}
