// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      keyframes: {
        spinReverse: {
          '0%': { transform: 'rotate(360deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
      },
      animation: {
        spin: 'spin 1s linear infinite',
        spinReverse: 'spinReverse 1s linear infinite',
      },
    },
  },
  plugins: [],
};
