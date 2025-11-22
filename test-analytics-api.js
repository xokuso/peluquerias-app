// Use native fetch in Node.js 18+

const API_BASE_URL = 'http://localhost:3001';

// Admin session token - you'll need to get this from a logged-in admin session
// For testing, we'll simulate authentication by checking the database directly
async function testAnalyticsAPIs() {
  console.log('🔍 Testing Analytics APIs...\n');

  const endpoints = [
    {
      name: 'Revenue Analytics',
      url: '/api/admin/analytics/revenue?period=monthly&months=12',
    },
    {
      name: 'Order Analytics',
      url: '/api/admin/analytics/orders?days=30',
    },
    {
      name: 'User Analytics',
      url: '/api/admin/analytics/users?days=30',
    },
    {
      name: 'Template Analytics',
      url: '/api/admin/analytics/templates?days=30',
    },
    {
      name: 'Domain Analytics',
      url: '/api/admin/analytics/domains?days=30',
    },
  ];

  for (const endpoint of endpoints) {
    console.log(`\n📊 Testing ${endpoint.name}...`);
    console.log(`URL: ${API_BASE_URL}${endpoint.url}`);

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint.url}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Note: In production, you'd need to include authentication headers
        },
      });

      const data = await response.json();

      if (response.ok) {
        console.log(`✅ ${endpoint.name} - Success`);

        // Display summary of returned data
        if (data.summary) {
          console.log('Summary data received:');
          const summaryKeys = Object.keys(data.summary).slice(0, 3);
          summaryKeys.forEach(key => {
            console.log(`  - ${key}: ${JSON.stringify(data.summary[key])}`);
          });
        }

        // Check for expected data structures
        const dataKeys = Object.keys(data);
        console.log(`Data structures: ${dataKeys.join(', ')}`);
      } else {
        console.error(`❌ ${endpoint.name} - Error: ${response.status}`);
        console.error('Response:', data);
      }
    } catch (error) {
      console.error(`❌ ${endpoint.name} - Failed:`, error.message);
    }
  }

  console.log('\n\n📈 Testing Analytics Dashboard UI...');
  console.log('Visit: http://localhost:3001/admin/analytics');
  console.log('Note: You need to be logged in as an admin to access this page.');
}

// Run the tests
testAnalyticsAPIs().catch(console.error);