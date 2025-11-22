// Test script to verify API endpoints are working
const baseUrl = 'http://localhost:3003';

async function testEndpoint(path, description) {
  console.log(`\n📍 Testing: ${description}`);
  console.log(`   URL: ${baseUrl}${path}`);

  try {
    const response = await fetch(`${baseUrl}${path}`);
    const status = response.status;
    console.log(`   Status: ${status}`);

    if (status === 401) {
      console.log('   ✅ Endpoint exists and requires authentication (expected behavior)');
    } else if (status === 200) {
      const data = await response.json();
      console.log('   ✅ Endpoint working:', JSON.stringify(data).substring(0, 100) + '...');
    } else {
      console.log(`   ⚠️ Unexpected status: ${status}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
}

async function runTests() {
  console.log('🧪 Starting API endpoint tests...\n');

  await testEndpoint('/api/admin/stats', 'Admin Dashboard Statistics');
  await testEndpoint('/api/admin/orders/recent', 'Recent Orders');
  await testEndpoint('/api/admin/users/stats', 'User Statistics');
  await testEndpoint('/api/admin/messages/stats', 'Message Statistics');
  await testEndpoint('/api/admin/orders', 'Orders List');

  console.log('\n✨ All endpoint tests completed!');
}

runTests();