import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#1a1a1a",
        foreground: "#fafafa",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "SF Pro Text",
          "system-ui",
          "sans-serif",
        ],
      },
      borderRadius: {
        editor: "18px",
      },
    },
  },
  plugins: [
    plugin(({ addVariant }) => {
      // Only apply hover styles on real pointer devices (not touch/trackpad tap)
      addVariant("can-hover", "@media (any-hover: hover) and (any-pointer: fine)");
      // Scope styles to the desktop shell — requires data-shell="desktop" on root div
      addVariant("desktop", "[data-shell='desktop'] &");
    }),
  ],
};

export default config;
