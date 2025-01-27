/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            keyframes: {
                inOut: {
                    "0%": { transform: "translateX(-50%) translateY(-100%)", opacity: "0" },
                    "20%": { transform: "translateX(-50%) translateY(0%)", opacity: "1" },
                    "80%": { transform: "translateX(-50%) translateY(0%)", opacity: "1" },
                    "100%": { transform: "translateX(-50%) translateY(-100%)", opacity: "0" },
                },
            },
            animation: {
                inOut: "inOut 3s ease-in-out forwards",
            },
        },
    },
    plugins: [],
};
