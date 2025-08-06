const resolveConfig = require('tailwindcss/resolveConfig');
const tailwindConfig = require('../tailwind.config.js');
const defaultConfig = require('tailwindcss/defaultConfig');

console.log('🔧 TAILWIND CONFIG FIX VERIFICATION\n');

const resolved = resolveConfig(tailwindConfig);

// Test 1: Core spacing values
console.log('1️⃣  CORE SPACING VALUES TEST');
const coreTests = [
  { key: '1', expected: '0.25rem' },
  { key: '2', expected: '0.5rem' },
  { key: '4', expected: '1rem' },
  { key: '8', expected: '2rem' },
  { key: '12', expected: '3rem' },
];

let coreTestsPassed = 0;
coreTests.forEach(({ key, expected }) => {
  const actual = resolved.theme.spacing[key];
  const passed = actual === expected;
  console.log(`   ${passed ? '✅' : '❌'} spacing['${key}'] = '${actual}' ${passed ? '' : `(expected '${expected}')`}`);
  if (passed) coreTestsPassed++;
});

console.log(`   Result: ${coreTestsPassed}/${coreTests.length} core values correct\n`);

// Test 2: No shadowed defaults
console.log('2️⃣  DEFAULT VALUES SHADOWING TEST');
const defaultSpacing = defaultConfig.theme.spacing;
const shadowedValues = [];

Object.keys(defaultSpacing).forEach(key => {
  if (resolved.theme.spacing[key] !== defaultSpacing[key]) {
    shadowedValues.push({
      key,
      default: defaultSpacing[key],
      actual: resolved.theme.spacing[key]
    });
  }
});

if (shadowedValues.length === 0) {
  console.log('   ✅ No default values are being shadowed!');
} else {
  console.log('   ❌ Found shadowed values:');
  shadowedValues.slice(0, 5).forEach(({ key, default: def, actual }) => {
    console.log(`     '${key}': default '${def}' → overridden to '${actual}'`);
  });
  if (shadowedValues.length > 5) {
    console.log(`     ... and ${shadowedValues.length - 5} more`);
  }
}
console.log(`   Result: ${shadowedValues.length} values shadowed\n`);

// Test 3: Custom values preserved
console.log('3️⃣  CUSTOM VALUES TEST');
const customTests = [
  { key: '18', expected: '1.125rem' },
  { key: '5vw', expected: '5vw' },
  { key: 'font', expected: '1em' },
  { key: 'safe-area', expected: 'env(safe-area-inset-bottom)' },
];

let customTestsPassed = 0;
customTests.forEach(({ key, expected }) => {
  const actual = resolved.theme.spacing[key];
  const passed = actual === expected;
  console.log(`   ${passed ? '✅' : '❌'} spacing['${key}'] = '${actual}' ${passed ? '' : `(expected '${expected}')`}`);
  if (passed) customTestsPassed++;
});

console.log(`   Result: ${customTestsPassed}/${customTests.length} custom values correct\n`);

// Test 4: Color system intact
console.log('4️⃣  COLOR SYSTEM TEST');
const colorTests = [
  { key: 'white', expected: 'rgb(255 255 255)' },
  { key: 'black', expected: 'rgb(0 0 0)' },
  { key: 'transparent', expected: 'transparent' },
  { key: 'primary', check: val => val.includes('var(--be-primary)') },
];

let colorTestsPassed = 0;
colorTests.forEach(({ key, expected, check }) => {
  const actual = resolved.theme.colors[key];
  const passed = check ? check(actual) : actual === expected;
  console.log(`   ${passed ? '✅' : '❌'} colors['${key}'] = '${actual}' ${passed ? '' : `(expected '${expected}')`}`);
  if (passed) colorTestsPassed++;
});

console.log(`   Result: ${colorTestsPassed}/${colorTests.length} color values correct\n`);

// Final summary
console.log('📊 FINAL RESULTS');
const allTestsPassed = 
  coreTestsPassed === coreTests.length &&
  shadowedValues.length === 0 &&
  customTestsPassed === customTests.length &&
  colorTestsPassed === colorTests.length;

if (allTestsPassed) {
  console.log('🎉 ALL TESTS PASSED! Tailwind config merge logic is fixed.');
  console.log('✅ Core utilities preserved');
  console.log('✅ No values shadowed');  
  console.log('✅ Custom values working');
  console.log('✅ Color system intact');
  console.log('\n💡 Standard utilities like p-1, m-4, w-8 now work as expected!');
} else {
  console.log('❌ Some tests failed. Please check the configuration.');
  console.log(`   Core values: ${coreTestsPassed}/${coreTests.length}`);
  console.log(`   Shadowed: ${shadowedValues.length} (should be 0)`);
  console.log(`   Custom: ${customTestsPassed}/${customTests.length}`);
  console.log(`   Colors: ${colorTestsPassed}/${colorTests.length}`);
}

console.log('\n🧪 To run the full Jest test suite: npm test');
