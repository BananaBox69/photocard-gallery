/** @type {import('tailwindcss').Config} */
module.DEPRECATED = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'theme-primary': 'var(--color-primary)',
        'theme-secondary': 'var(--color-secondary)',
      },
    },
  },
  plugins: [],
}
