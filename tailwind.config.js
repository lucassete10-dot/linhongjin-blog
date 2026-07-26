/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'sans-serif'],
        display: ['Special Elite', 'Courier New', 'serif'],
      },
      colors: {
        wandor: {
          dark: '#0a0a0a',
          text: '#1a1a1a',
          muted: '#767676',
          prompt: '#905831',
          paper: '#f7f1e3',
          deep: '#efe5cf',
          rust: '#b0562f',
          olive: '#6f7d51',
          pine: '#4c5c44',
          sand: '#d9a866',
          gold: '#d7a944',
        },
      },
      maxWidth: { page: '1360px' },
    },
  },
  plugins: [],
}
