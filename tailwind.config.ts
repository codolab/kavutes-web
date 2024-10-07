import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      animation: {
        colorChange: 'colorChange 2s infinite ease-in-out',
      },
      keyframes: {
        colorChange: {
          '0%, 100%': { backgroundColor: '#D97706' }, // amber-700
          '50%': { backgroundColor: '#F59E0B' }, // amber-500
        },
      },
    },
  },
  plugins: [],
};
export default config;
