// Test TUS Endpoint - Run this in browser console to check connectivity
console.log('🧪 Testing TUS Upload Endpoint');

async function testTusEndpoint() {
    const endpoint = `${window.location.origin}/api/v1/tus/upload`;
    console.log(`🎯 Testing endpoint: ${endpoint}`);
    
    try {
        // Test with a simple HEAD request first
        console.log('📡 Testing HEAD request...');
        const headResponse = await fetch(endpoint, { method: 'HEAD' });
        console.log(`HEAD response:`, {
            status: headResponse.status,
            headers: Object.fromEntries(headResponse.headers.entries())
        });
        
        // Test with OPTIONS request (CORS preflight)
        console.log('📡 Testing OPTIONS request...');
        const optionsResponse = await fetch(endpoint, { method: 'OPTIONS' });
        console.log(`OPTIONS response:`, {
            status: optionsResponse.status,
            headers: Object.fromEntries(optionsResponse.headers.entries())
        });
        
        if (headResponse.status === 405) {
            console.log('✅ TUS endpoint is responding (405 = Method Not Allowed is expected)');
        } else if (headResponse.status === 404) {
            console.error('❌ TUS endpoint not found (404)');
        } else {
            console.log(`ℹ️ TUS endpoint responded with status: ${headResponse.status}`);
        }
        
    } catch (error) {
        console.error('❌ Failed to connect to TUS endpoint:', error);
        console.log('💡 This could indicate:');
        console.log('   - Server is down');
        console.log('   - Network connectivity issues');
        console.log('   - CORS configuration problems');
        console.log('   - Firewall blocking requests');
    }
}

// Test basic network connectivity
async function testBasicConnectivity() {
    console.log('🌐 Testing basic connectivity...');
    try {
        const response = await fetch('/');
        console.log(`✅ Basic connectivity OK (status: ${response.status})`);
    } catch (error) {
        console.error('❌ Basic connectivity failed:', error);
    }
}

// Run tests
testBasicConnectivity();
testTusEndpoint();

// Also check if TUS library is loaded
if (typeof Upload !== 'undefined') {
    console.log('✅ TUS Upload library is loaded');
} else {
    console.error('❌ TUS Upload library is not loaded');
}
