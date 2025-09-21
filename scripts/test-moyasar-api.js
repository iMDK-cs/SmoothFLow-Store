const https = require('https');

// Test Moyasar API connection
async function testMoyasarAPI() {
  const apiKey = 'sk_test_oGY41XSCPmyr6HexUMuk65s8WQNeDJuZV1xQRVAQ';
  const auth = Buffer.from(apiKey + ':').toString('base64');
  
  console.log('🔑 Testing Moyasar API connection...');
  console.log('📝 API Key:', apiKey);
  console.log('🔐 Auth Header:', `Basic ${auth}`);
  
  const options = {
    hostname: 'api.moyasar.com',
    port: 443,
    path: '/v1/payments',
    method: 'GET',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    }
  };

  const req = https.request(options, (res) => {
    console.log('📊 Status Code:', res.statusCode);
    console.log('📋 Headers:', res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('📄 Response Body:', data);
      
      if (res.statusCode === 200) {
        console.log('✅ Moyasar API is working correctly!');
      } else {
        console.log('❌ Moyasar API returned an error');
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request error:', error);
  });

  req.end();
}

testMoyasarAPI();