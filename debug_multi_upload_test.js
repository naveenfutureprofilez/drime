// Debug Test Script for Multi-File Upload Progress
// Copy and paste this into browser console on transfer homepage to test progress calculation

console.log('🧪 Multi-File Upload Debug Test');

// Test data simulating two 400MB files
const testFiles = [
    { name: 'file1.zip', size: 400 * 1024 * 1024, type: 'application/zip' }, // 400MB
    { name: 'file2.zip', size: 400 * 1024 * 1024, type: 'application/zip' }  // 400MB
];

const totalSize = testFiles.reduce((sum, f) => sum + f.size, 0);
console.log(`📊 Total size: ${(totalSize / 1024 / 1024).toFixed(0)} MB`);

// Simulate progress scenarios
function testProgressCalculation(scenario, completedFiles, currentFileProgress, currentFileIndex) {
    console.log(`\n🎯 Testing: ${scenario}`);
    
    // Calculate completed bytes
    let completedBytes = 0;
    if (completedFiles > 0) {
        completedBytes = completedFiles * testFiles[0].size; // Assuming equal file sizes
    }
    
    // Calculate current file bytes
    const currentFileBytes = currentFileIndex < testFiles.length ? 
        (testFiles[currentFileIndex].size * currentFileProgress / 100) : 0;
    
    const totalUploaded = completedBytes + currentFileBytes;
    const overallProgress = Math.round((totalUploaded * 100) / totalSize);
    
    console.log(`   📤 Completed files: ${completedFiles}/${testFiles.length}`);
    console.log(`   📊 Current file progress: ${currentFileProgress}% (file ${currentFileIndex + 1})`);
    console.log(`   📈 Overall progress: ${overallProgress}%`);
    console.log(`   💾 Uploaded: ${(totalUploaded / 1024 / 1024).toFixed(0)} MB / ${(totalSize / 1024 / 1024).toFixed(0)} MB`);
    
    return { overallProgress, totalUploaded, completedBytes };
}

// Test scenarios
testProgressCalculation('Initial state', 0, 0, 0);
testProgressCalculation('First file 25% complete', 0, 25, 0);
testProgressCalculation('First file 50% complete', 0, 50, 0);
testProgressCalculation('First file 100% complete (before backend processing)', 0, 100, 0);
testProgressCalculation('First file completed + stored', 1, 0, 1);
testProgressCalculation('Second file 25% complete', 1, 25, 1);
testProgressCalculation('Second file 50% complete', 1, 50, 1);
testProgressCalculation('Both files completed', 2, 100, 1);

console.log('\n✅ Expected behavior:');
console.log('- Progress should show ~25% when first file is 50% done');
console.log('- Progress should show ~50% when first file completed');
console.log('- Progress should show ~75% when second file is 50% done');
console.log('- Progress should show 100% only when both files completed');
console.log('- Shareable link should only appear after 100%');
