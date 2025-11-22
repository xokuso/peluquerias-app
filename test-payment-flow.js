const http = require('http');
const querystring = require('querystring');

async function testPaymentFlow() {
  console.log('🧪 Testing complete payment flow...');

  // Test data for checkout
  const testCheckoutData = {
    salonName: 'Test Salon Pro',
    ownerName: 'Test Owner',
    email: 'test@example.com',
    phone: '+34123456789',
    selectedTemplate: '1'
  };

  console.log('📝 Creating Stripe checkout session with test data:', testCheckoutData);

  const postData = querystring.stringify(testCheckoutData);

  const options = {
    hostname: 'localhost',
    port: 4000,
    path: '/api/stripe/create-checkout-session',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData)
    },
    rejectUnauthorized: false
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);

          if (res.statusCode === 200 && response.sessionId) {
            console.log('✅ Stripe checkout session created successfully!');
            console.log('📊 Session ID:', response.sessionId);
            console.log('💳 Checkout URL:', response.url);

            // Extract session ID for further testing
            resolve({
              success: true,
              sessionId: response.sessionId,
              checkoutUrl: response.url
            });
          } else {
            console.log('❌ Failed to create checkout session:');
            console.log('Status:', res.statusCode);
            console.log('Response:', response);
            resolve({
              success: false,
              error: response.error || 'Unknown error',
              statusCode: res.statusCode
            });
          }
        } catch (error) {
          console.error('❌ Error parsing response:', error);
          console.log('Raw response:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Also test the auto-login token endpoint
async function testAutoLoginTokenRetrieval(sessionId) {
  console.log('\n🔐 Testing auto-login token retrieval...');

  const options = {
    hostname: 'localhost',
    port: 4000,
    path: `/api/auth/auto-login?session_id=${sessionId}`,
    method: 'GET',
    rejectUnauthorized: false
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);

          console.log('📝 Auto-login token response:');
          console.log('Status:', res.statusCode);
          console.log('Response:', response);

          resolve({
            success: res.statusCode === 200,
            response,
            statusCode: res.statusCode
          });
        } catch (error) {
          console.error('❌ Error parsing response:', error);
          console.log('Raw response:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error.message);
      reject(error);
    });

    req.end();
  });
}

// Run the test
testPaymentFlow()
  .then(async (result) => {
    if (result.success) {
      console.log('\n🎯 Checkout session created successfully!');
      console.log('Session ID:', result.sessionId);

      // Test auto-login token (should fail since payment hasn't been completed)
      await testAutoLoginTokenRetrieval(result.sessionId);

      console.log('\n📋 Next steps to complete the test:');
      console.log('1. Visit the checkout URL and complete payment with test card');
      console.log('2. Use test card: 4242 4242 4242 4242');
      console.log('3. Use any future expiry date and any CVC');
      console.log('4. After payment, check if customer appears in admin panel');
      console.log('5. Check server logs for webhook processing');

    } else {
      console.log('\n❌ Test failed:', result.error);
    }
  })
  .catch((error) => {
    console.error('❌ Test error:', error);
  });