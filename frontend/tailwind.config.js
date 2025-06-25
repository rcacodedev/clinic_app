// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        titulo: ['"Merriweather"', "serif"],
        cuerpo: ['"Roboto"', "sans-serif"],
        calendario: ['"Charm"', "cursive"],
      },
      colors: {
        negro: "#292421",
        vanilla: "#F2E7DD",
        tan: "#A75F37",
        flora: "#A7A155",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0, transform: "translateY(8px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
