const resolveConfig = require('tailwindcss/resolveConfig');
const tailwindConfig = require('../tailwind.config.js');
const defaultConfig = require('tailwindcss/defaultConfig');

describe('Tailwind Config Merge Logic', () => {
  let resolvedConfig;

  beforeAll(() => {
    resolvedConfig = resolveConfig(tailwindConfig);
  });

  describe('Core Spacing Values', () => {
    test('should preserve default core spacing values', () => {
      // Test key default spacing values that should not be overridden
      const expectedDefaults = {
        '1': '0.25rem', // Default Tailwind value
        '2': '0.5rem',
        '3': '0.75rem', 
        '4': '1rem',
        '5': '1.25rem',
        '6': '1.5rem',
        '8': '2rem',
        '10': '2.5rem',
        '12': '3rem',
      };

      console.log('\n=== Current Spacing Values ===');
      Object.entries(expectedDefaults).forEach(([key, expected]) => {
        const actual = resolvedConfig.theme.spacing[key];
        console.log(`spacing['${key}']: expected '${expected}', actual '${actual}'`);
      });

      // These assertions will likely fail with current config
      expect(resolvedConfig.theme.spacing['1']).toBe('0.25rem');
      expect(resolvedConfig.theme.spacing['4']).toBe('1rem');
    });

    test('should have no shadowed default values', () => {
      const defaultSpacing = defaultConfig.theme.spacing;
      const currentSpacing = resolvedConfig.theme.spacing;
      
      const shadowedKeys = [];
      
      Object.keys(defaultSpacing).forEach(key => {
        if (currentSpacing[key] && currentSpacing[key] !== defaultSpacing[key]) {
          shadowedKeys.push({
            key,
            default: defaultSpacing[key],
            current: currentSpacing[key]
          });
        }
      });

      console.log('\n=== Checking for Shadowed Values ===');
      if (shadowedKeys.length === 0) {
        console.log('✅ SUCCESS: No default values are being shadowed!');
      } else {
        console.log('❌ FOUND SHADOWED VALUES:');
        shadowedKeys.forEach(({ key, default: defaultVal, current }) => {
          console.log(`spacing['${key}']: default '${defaultVal}' → overridden to '${current}'`);
        });
      }

      // After fix, there should be no shadowed values
      expect(shadowedKeys.length).toBe(0);
    });
  });

  describe('Core Color Values', () => {
    test('should preserve essential default color values', () => {
      const resolvedColors = resolvedConfig.theme.colors;
      
      // Check if basic colors are still accessible
      expect(resolvedColors.white).toBeDefined();
      expect(resolvedColors.black).toBeDefined();
      expect(resolvedColors.transparent).toBeDefined();
      
      console.log('\n=== Core Color Values ===');
      console.log(`white: ${resolvedColors.white}`);
      console.log(`black: ${resolvedColors.black}`);
      console.log(`transparent: ${resolvedColors.transparent}`);
    });
  });

  describe('Custom Values', () => {
    test('should include custom spacing values', () => {
      // Test that custom values are properly added
      expect(resolvedConfig.theme.spacing['5vw']).toBe('5vw');
      expect(resolvedConfig.theme.spacing['font']).toBe('1em');
      expect(resolvedConfig.theme.spacing['safe-area']).toBe('env(safe-area-inset-bottom)');
    });

    test('should include extended values', () => {
      // Test extended values from sharedExtend
      expect(resolvedConfig.theme.borderRadius.button).toBe('var(--be-button-radius, 0.25rem)');
      expect(resolvedConfig.theme.zIndex.toast).toBe(160);
    });
  });
});
