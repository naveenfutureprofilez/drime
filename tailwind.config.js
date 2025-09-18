const plugin = require('tailwindcss/plugin');
const {
  sharedOverride,
  sharedExtend,
  sharedPlugins,
} = require('./common/foundation/resources/client/shared.tailwind');

module.exports = {
  content: [
    './resources/client/**/*.{js,jsx,ts,tsx}',
    './common/foundation/resources/client/**/*.{js,jsx,ts,tsx}',
    './common/foundation/resources/views/**/*.blade.php',
    './resources/views/**/*.blade.php',
  ],
  darkMode: 'class',
  theme: {
    ...sharedOverride,
    fontFamily: {
      sans: ['Schibsted Grotesk', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      serif: ['ui-serif', 'Georgia', 'serif'],
      mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
    },
    extend: {
      ...sharedExtend,
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.1)',
        DEFAULT: '0 2px 4px 0 rgba(0, 0, 0, 0.15)',
        md: '0 4px 8px -2px rgba(0, 0, 0, 0.15), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        lg: '0 8px 15px -3px rgba(0, 0, 0, 0.15), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        xl: '0 15px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.1)',
        none: 'none',
      },
    },
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1146px',
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography'), ...sharedPlugins(plugin)],
};
