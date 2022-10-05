module.exports = {
  darkMode: "media",
  purge: {
    content: [
      "./src/**/*.njk",
      "./src/**/*.js",
      "./src/**/*.svg",
      "./src/**/*.md",
    ],
  },
  plugins: [require("@tailwindcss/forms")],
  theme: {
    extend: {
      fontFamily: {
        hind: '"Hind", sans-serif;',
      },
      colors: {
        "primary-font": "var(--primary-font-color)",
        "secondary-font": "var(--secondary-font-color)",
        primary: "var(--primary-background-color)",
        secondary: "var(--secondary-background-color)",
        "mobile-link": "var(--mobile-link-color)",
        link: "var(--link-color)",
      },
      minHeight: {
        12: "3rem",
        64: "16rem",
      },
    },
  },
}
