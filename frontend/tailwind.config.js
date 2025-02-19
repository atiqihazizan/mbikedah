/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/tw-elements/dist/js/**/*.js",
  ],
  theme: {
		container: {
      center: true,
			padding: '2rem',
    },
    extend: {
      letterSpacing: {
        tightest: "-.075em",
        tighter: "-.05em",
        tight: "-.025em",
        normal: "0",
        wide: ".025em",
        wider: ".05em",
        widest: ".25em",
      },
			keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        "fade-in-down": {
          transform: "translateY(-0.75rem)",
          opacity: 0,
        },
        to: {
          transform: "translateY(0rem)",
          opacity: "1",
        },
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        "fade-in-down": "frade-indown 0.2s ease-inout both",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("tw-elements/dist/plugin.cjs"),
  ],
  darkMode: "class",
};
