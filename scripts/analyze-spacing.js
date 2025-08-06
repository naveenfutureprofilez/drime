const defaultConfig = require('tailwindcss/defaultConfig');
const { sharedOverride } = require('../common/foundation/resources/client/shared.tailwind');

const defaultSpacing = defaultConfig.theme.spacing;
const customSpacing = sharedOverride.spacing;

console.log('=== SPACING ANALYSIS ===\n');

const safeCustomValues = {};
const problematicOverrides = {};
const newCustomValues = {};

Object.entries(customSpacing).forEach(([key, value]) => {
  if (!defaultSpacing[key]) {
    // This is a new custom value - safe to add
    newCustomValues[key] = value;
  } else if (defaultSpacing[key] === value) {
    // This matches default - redundant but safe
    safeCustomValues[key] = value;
  } else {
    // This overrides a default value - problematic!
    problematicOverrides[key] = {
      default: defaultSpacing[key],
      override: value
    };
  }
});

console.log('1. NEW CUSTOM VALUES (safe to extend):');
Object.entries(newCustomValues).forEach(([key, value]) => {
  console.log(`  '${key}': '${value}',`);
});

console.log(`\n2. PROBLEMATIC OVERRIDES (${Object.keys(problematicOverrides).length} conflicts):`);
Object.entries(problematicOverrides).slice(0, 5).forEach(([key, values]) => {
  console.log(`  '${key}': default '${values.default}' → override '${values.override}'`);
});
console.log(`  ... and ${Object.keys(problematicOverrides).length - 5} more\n`);

console.log('3. SAFE VALUES MATCHING DEFAULTS:');
Object.entries(safeCustomValues).forEach(([key, value]) => {
  console.log(`  '${key}': '${value}' (matches default)`);
});

console.log('\n4. RECOMMENDED SOLUTION:');
console.log('Only extend with truly custom values:');
console.log('```javascript');
console.log('extend: {');
console.log('  spacing: {');
Object.entries(newCustomValues).forEach(([key, value]) => {
  console.log(`    '${key}': '${value}',`);
});
console.log('  }');
console.log('}');
console.log('```');
