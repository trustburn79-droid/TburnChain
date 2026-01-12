// ★ [2026-01-12 ARCHITECT FIX] Suppress PostCSS 'from' warning
// Replit workflow marks FAILED when stderr output occurs during startup
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
  // Provide explicit 'from' option to prevent warning
  from: undefined,
}
