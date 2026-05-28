module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 20px 60px rgba(20, 25, 47, 0.08)',
      },
      backgroundImage: {
        'gradient-glow': 'radial-gradient(ellipse at top, rgba(99,102,241,0.18), transparent 45%)',
      },
    },
  },
  plugins: [],
}
