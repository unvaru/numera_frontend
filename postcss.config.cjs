module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {
      // Exclude Vuetify components from autoprefixer
      exclude: [/vuetify/]
    }
  }
} 