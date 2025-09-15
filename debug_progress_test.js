// Test Progress Calculation - Run this in browser console
console.log('🧪 Testing Progress Calculation Logic');

// Simulate your file sizes from the console log
const file1Size = 429338329; // ~409 MB
const file2Size = 336674183; // ~321 MB  
const totalSize = file1Size + file2Size; // ~731 MB

console.log(`📊 Test Files:
  File 1: ${(file1Size / 1024 / 1024).toFixed(0)} MB
  File 2: ${(file2Size / 1024 / 1024).toFixed(0)} MB
  Total: ${(totalSize / 1024 / 1024).toFixed(0)} MB`);

// Test scenarios
function testProgress(scenario, completedBytes, currentUploadBytes) {
    const totalUploaded = completedBytes + currentUploadBytes;
    const progress = totalSize > 0 ? Math.round((totalUploaded * 100) / totalSize) : 0;
    const clampedProgress = Math.max(0, Math.min(100, progress));
    
    console.log(`${scenario}:
      Completed: ${(completedBytes / 1024 / 1024).toFixed(0)} MB
      Current Upload: ${(currentUploadBytes / 1024 / 1024).toFixed(0)} MB
      Total Uploaded: ${(totalUploaded / 1024 / 1024).toFixed(0)} MB
      Progress: ${clampedProgress}%
      ${progress !== clampedProgress ? '⚠️ Progress was clamped!' : '✅ Progress OK'}`);
}

// Test different scenarios
testProgress('🎬 Upload Start', 0, 0);
testProgress('📤 File 1: 25% done', 0, file1Size * 0.25);
testProgress('📤 File 1: 50% done', 0, file1Size * 0.5);  
testProgress('📤 File 1: 100% done', 0, file1Size);
testProgress('✅ File 1: Completed', file1Size, 0);
testProgress('📤 File 2: 25% done', file1Size, file2Size * 0.25);
testProgress('📤 File 2: 50% done', file1Size, file2Size * 0.5);
testProgress('✅ Both Files Complete', file1Size + file2Size, 0);

// Test edge cases
console.log('\n🚨 Testing Edge Cases:');
testProgress('Division by zero test', 0, 0);

// Test with your exact console values
console.log('\n🔍 Your Actual Data:');
const actualCompleted = 429338329; // From "Files: 1/2" 
const actualTotal = 766012512; // From console "bytes 766012512"
const actualProgress = actualTotal > 0 ? Math.round((actualCompleted * 100) / actualTotal) : 0;
console.log(`Actual calculation: ${actualProgress}% (${(actualCompleted/1024/1024).toFixed(0)}MB / ${(actualTotal/1024/1024).toFixed(0)}MB)`);

if (actualProgress === Infinity || isNaN(actualProgress)) {
    console.error('🚨 Found the Infinity bug!');
}
