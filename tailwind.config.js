/* eslint-disable import/no-anonymous-default-export */
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: (theme) => ({
        "custom-bg": "url('../public/bg.jpg')",
      }),
    },

    screens: {
      phone: "320px",
      // => @media (min-width: 640px) { ... }
      "p-tab": "500px",
      tablet: "768px",
      // => @media (min-width: 768px) { ... }

      laptop: "1024px",
      // => @media (min-width: 1024px) { ... }

      desktop: "1280px",
      // => @media (min-width: 1280px) { ... }

      bigdesktop: "1536px",
    },
  },
  plugins: [],
};
