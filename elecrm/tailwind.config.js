module.exports = {
  darkMode: "class", // Enable class-based dark mode
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        text: "var(--color-text)",
        primaryText: "var(--color-primaryText)",
        chartBg: "var(--color-chartBg)",
        titleBarBg: "var(--color-titleBarBg)",
        titleText: "var(--color-titleText)",
        titleButtonBg: "var(--color-titleButtonBg)",
        titleButtonHoverBg: "var(--color-titleButtonHoverBg)",
        titleButtonActiveBg: "var(--color-titleButtonActiveBg)",
        sidebarBg: "var(--color-sidebarBg)",
        sidebarButtonBg: "var(--color-sidebarButtonBg)",
        sidebarButtonHoverBg: "var(--color-sidebarButtonHoverBg)",
        mainContentBg: "var(--color-mainContentBg)",
        altContentBg: "var(--color-altContentBg)",
        accent1: "var(--color-accent1)",
        accent2: "var(--color-accent2)",
        accent3: "var(--color-accent3)",
        tableRowGray: "var(--color-tableRowGray)",
        borderGray: "var(--color-borderGray)",
      },
    },
  },
  plugins: [],
};
