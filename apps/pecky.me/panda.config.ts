import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  // Files to scan for class names
  include: ["./app/**/*.{js,jsx,ts,tsx}"],
  exclude: [],

  // The output directory for your css system
  outdir: "styled-system",

  // Seed tokens (extend defaults)
  theme: {
    extend: {
      tokens: {
        colors: {
          // Pecky brand colors
          pecky: {
            orange: { value: "#ff7700" },
            "orange-light": { value: "#ffaa00" },
            "orange-dark": { value: "#ed7a00" },
            brown: { value: "#a06500" },
            "brown-light": { value: "#b48512" },
            "brown-dark": { value: "#513d0a" },
            "brown-darker": { value: "#42310b" },
            tan: { value: "#fff3da" },
            "tan-light": { value: "#fffbe8" },
            "tan-border": { value: "#ffae00" },
            gold: { value: "#ffd36e" },
            meme: { value: "#2e2e2e" },
          },
          // NFT rarity colors
          nft: {
            common: { value: "#0099ff" },
            rare: { value: "#25c36a" },
            epic: { value: "#ff53a2" },
            legendary: { value: "#ffe270" },
            mythic: { value: "#a259ff" },
          },
        },
        spacing: {
          pecky: {
            xs: { value: "4px" },
            sm: { value: "8px" },
            md: { value: "12px" },
            lg: { value: "16px" },
            xl: { value: "20px" },
            "2xl": { value: "24px" },
          },
        },
        fontSizes: {
          pecky: {
            xs: { value: "12px" },
            sm: { value: "14px" },
            md: { value: "15px" },
            lg: { value: "16px" },
            xl: { value: "18px" },
            "2xl": { value: "20px" },
            "3xl": { value: "28px" },
          },
        },
      },
      keyframes: {
        loadingDots: {
          "0%": { opacity: "1" },
          "50%": { opacity: "0.45" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
});
