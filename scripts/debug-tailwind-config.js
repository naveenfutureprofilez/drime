const resolveConfig = require('tailwindcss/resolveConfig');
const tailwindConfig = require('../tailwind.config.js');
const defaultConfig = require('tailwindcss/defaultConfig');
const { sharedOverride, sharedExtend } = require('../common/foundation/resources/client/shared.tailwind');

console.log('=== TAILWIND CONFIG MERGE DEBUG ===\n');

// 1. Check what's being overridden vs extended
console.log('1. OVERRIDE vs EXTEND Analysis:');
console.log('- sharedOverride keys:', Object.keys(sharedOverride));
console.log('- sharedExtend keys:', Object.keys(sharedExtend));

// 2. Show current merge structure
console.log('\n2. Current Config Structure:');
console.log('theme: {');
console.log('  ...sharedOverride,  // <-- This REPLACES defaults');
console.log('  extend: {');
console.log('    ...sharedExtend,  // <-- This ADDS to defaults');
console.log('  }');
console.log('}');

// 3. Analyze spacing specifically
console.log('\n3. SPACING ANALYSIS:');
const defaultSpacing = defaultConfig.theme.spacing;
const extendSpacing = sharedExtend.spacing;

console.log('Default spacing keys count:', Object.keys(defaultSpacing).length);
console.log('Extended spacing keys count:', Object.keys(extendSpacing || {}).length);

if (extendSpacing) {
  const conflictingKeys = Object.keys(defaultSpacing).filter(key => 
    extendSpacing[key] && extendSpacing[key] !== defaultSpacing[key]
  );
  
  console.log('\n4. SPACING CONFLICTS CHECK:');
  if (conflictingKeys.length === 0) {
    console.log('✅ SUCCESS: No conflicts between default and extended spacing!');
  } else {
    console.log('❌ Found conflicts:');
    conflictingKeys.forEach(key => {
      console.log(`  '${key}': default '${defaultSpacing[key]}' vs extend '${extendSpacing[key]}'`);
    });
  }
} else {
  console.log('\n4. SPACING STATUS: Spacing is no longer in sharedOverride (fixed!)');
}

// 5. Show solution structure
console.log('5. RECOMMENDED SOLUTION:');
console.log('Move custom values to extend and preserve defaults:');
console.log(`
// BEFORE (problematic):
theme: {
  ...sharedOverride,  // Shadows default values
  extend: { ...sharedExtend }
}

// AFTER (fixed):  
theme: {
  extend: {
    spacing: {
      // Only add NEW custom values that don't conflict
      '5vw': '5vw',
      'font': '1em', 
      'safe-area': 'env(safe-area-inset-bottom)',
      // ... other custom values
    },
    ...sharedExtend
  }
}
`);

console.log('6. COLORS ANALYSIS:');
console.log('Colors in sharedOverride are functions, so they completely replace defaults.');
console.log('This is likely intentional for the color system, but should be verified.\n');

// 7. Resolve current config to show final result
console.log('7. FINAL RESOLVED CONFIG SAMPLE:');
const resolved = resolveConfig(tailwindConfig);
console.log('Resolved spacing[1]:', resolved.theme.spacing['1']);
console.log('Resolved spacing[4]:', resolved.theme.spacing['4']);
console.log('Expected spacing[1]: 0.25rem');
console.log('Expected spacing[4]: 1rem');
console.log('\nTest will pass when these match expected values.');
