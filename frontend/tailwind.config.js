/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#10b981", // Emerald 500
                dark: "#111827",    // Gray 900
                darker: "#030712",  // Gray 950
                panel: "#1f2937",   // Gray 800
            }
        },
    },
    plugins: [],
}
