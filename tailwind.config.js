// Add this to your extend section in the tailwind.config.js file
module.exports = {
  // ... other config
  extend: {
    // ... other extensions
    animation: {
      'fadeIn': 'fadeIn 0.2s ease-in-out',
      'scaleIn': 'scaleIn 0.2s ease-in-out',
    },
    keyframes: {
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
      scaleIn: {
        '0%': { transform: 'scale(0.95)', opacity: '0' },
        '100%': { transform: 'scale(1)', opacity: '1' },
      },
    },
  },
}