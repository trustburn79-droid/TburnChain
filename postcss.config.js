// ★ [2026-01-12 ARCHITECT FIX] Suppress PostCSS 'from' warning
// Replit workflow marks FAILED when stderr output occurs during startup
// The 'from' option MUST be inside 'options' object for Vite to forward it to PostCSS
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
  options: {
    from: undefined,
  },
}
