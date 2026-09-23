/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#09090b",
        surface: "#121216",
        "surface-subtle": "#18181f",
        "surface-hover": "#22222b",
        panel: "#14141a",
        border: "#27272a",
        "border-light": "#383842",
        primary: "#3b82f6",
        "primary-hover": "#2563eb",
        safe: "#10b981",
        warning: "#f59e0b",
        critical: "#ef4444",
        danger: "#ef4444",
        muted: "#9ca3af",
        "muted-dark": "#71717a"
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        grotesk: ["'Host Grotesk'", "'Space Grotesk'", "'Fabric Grotesk'", "sans-serif"],
        display: ["'Host Grotesk'", "'Space Grotesk'", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"]
      },
      borderRadius: {
        sm: "3px",
        md: "6px",
        lg: "8px"
      }
    }
  },
  plugins: []
};
