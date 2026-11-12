export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'navy': {
          50: '#F0F4F8',
          100: '#D9E2EC',
          200: '#BCCCDC',
          300: '#9FB3C8',
          400: '#829AB1',
          500: '#627D98',
          600: '#486581',
          700: '#334E68',
          800: '#243B53',
          900: '#102A43',
          950: '#0A192F',
        },
        'soft-cream': {
          50: '#FDFBF7',
          100: '#F9F4EB',
          200: '#F3E9D9',
          300: '#EDE0C9',
          400: '#E6D6B8',
          500: '#DFCBA6',
          600: '#C9B088',
          700: '#A68E69',
          800: '#856F4D',
          900: '#635136',
        },
        'golden': {
          50: '#FDF9EF',
          100: '#FBF2D8',
          200: '#F5E2A8',
          300: '#EDCE73',
          400: '#E2B842',
          500: '#C8961E',
          600: '#B8860B', // Classic Dark Goldenrod
          700: '#946B08', // Rich Dark Golden
          800: '#75540B', // Deep Dark Golden
          900: '#523A0B',
          950: '#382605',
        },
      },
      fontFamily: {
        sans: ['var(--font-body, Inter)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-heading, var(--font-body, Inter))', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-warm': 'linear-gradient(135deg, var(--tw-gradient-stops))',
      },
      animation: {
        'fade-in': 'fadeIn 1s ease-in-out',
        'slide-up': 'slideUp 1s ease-out',
        'slide-down': 'slideDown 1s ease-out',
        'scale-in': 'scaleIn 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
