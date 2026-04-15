const config = {
  plugins: ["@tailwindcss/postcss"],
};

export default config;

// tailwind.config.js
module.exports = {
  // ...
  plugins: [
    require('tailwind-scrollbar-hide')
  ],
};