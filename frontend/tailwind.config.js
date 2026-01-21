/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/frappe-ui/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Waseela brand colors - calm cyan/teal theme
        primary: {
          50: '#f0feff',
          75: '#e7fcfc',
          100: '#defafa',
          200: '#bef5f5',
          300: '#9aecec',
          400: '#6ce0e0',
          500: '#3ccece',
          600: '#2ba5a5',
          700: '#1f7d7d',
          800: '#166060',
          900: '#0f4747',
          950: '#083030',
        },
        secondary: {
          50: '#d0bed6',
          75: '#ae96b8',
          100: '#9175a1',
          200: '#7c5b8f',
          300: '#64427e',
          400: '#4e266e',
          500: '#431f5e',
          600: '#38194e',
          700: '#2d143e',
          800: '#230f2f',
          900: '#1a0b23',
          950: '#110718',
        },
        accent: {
          50: '#f5f2ec',
          100: '#ebe8de',
          200: '#d9d2c0',
          300: '#d0c4ab',
          400: '#c4b59b',
          500: '#b5a488',
          600: '#a08f74',
          700: '#847660',
          800: '#6a5f4d',
          900: '#544c3d',
        },
        success: {
          50: '#dbf8e9',
          100: '#c5f3dc',
          200: '#a8ecc9',
          300: '#7de3ae',
          400: '#4dd68f',
          500: '#109c9b',
          600: '#0e8886',
          700: '#0c7370',
          800: '#0a5d5b',
          900: '#084a49',
          950: '#053634',
        },
      },
      animation: {
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
