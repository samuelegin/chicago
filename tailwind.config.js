/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content:  ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        inter:   ['Inter', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
        display: ['Inter', 'sans-serif'],
        space:   ['Inter', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['11px', '14px'],
        xs:    ['12px', '16px'],
        sm:    ['13px', '18px'],
        base:  ['14px', '20px'],
        md:    ['15px', '21px'],
        lg:    ['16px', '22px'],
        xl:    ['18px', '24px'],
        '2xl': ['20px', '26px'],
        '3xl': ['24px', '30px'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card:        { DEFAULT: 'hsl(var(--card))',       foreground: 'hsl(var(--card-foreground))' },
        popover:     { DEFAULT: 'hsl(var(--popover))',    foreground: 'hsl(var(--popover-foreground))' },
        primary:     { DEFAULT: 'hsl(var(--primary))',    foreground: 'hsl(var(--primary-foreground))' },
        secondary:   { DEFAULT: 'hsl(var(--secondary))',  foreground: 'hsl(var(--secondary-foreground))' },
        muted:       { DEFAULT: 'hsl(var(--muted))',      foreground: 'hsl(var(--muted-foreground))' },
        accent:      { DEFAULT: 'hsl(var(--accent))',     foreground: 'hsl(var(--accent-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))',foreground: 'hsl(var(--destructive-foreground))' },
        border: 'hsl(var(--border))',
        input:  'hsl(var(--input))',
        ring:   'hsl(var(--ring))',
        gold: {
          50:  '#fffbeb', 100: '#fef3c7', 200: '#fde68a',
          300: '#fcd34d', 400: '#fbbf24', 500: '#b8860b',
          600: '#92690a', 700: '#6d4e08',
        },
      },
      borderRadius: {
        sm:  'calc(var(--radius) - 2px)',
        md:  'var(--radius)',
        lg:  'calc(var(--radius) + 2px)',
        xl:  'calc(var(--radius) + 6px)',
        '2xl': 'calc(var(--radius) + 10px)',
      },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up':   { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        'heart-burst': {
          '0%':   { transform: 'scale(0)', opacity: '1' },
          '60%':  { transform: 'scale(1.4)', opacity: '1' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
        'heart-burst':    'heart-burst 0.7s ease-out forwards',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
