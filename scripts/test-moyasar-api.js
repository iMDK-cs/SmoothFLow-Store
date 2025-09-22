const https = require('https');
require('dotenv').config();

// Test Moyasar API connection
async function testMoyasarAPI() {
  const apiKey = process.env.MOYASAR_SECRET_KEY;
  
  if (!apiKey) {
    console.error('❌ MOYASAR_SECRET_KEY environment variable is required');
    console.log('💡 Please set MOYASAR_SECRET_KEY in your .env file');
    process.exit(1);
  }
  
  const auth = Buffer.from(apiKey + ':').toString('base64');
  
  console.log('🔑 Testing Moyasar API connection...');
  console.log('📝 API Key:', apiKey.substring(0, 8) + '...' + apiKey.substring(apiKey.length - 4));
  console.log('🔐 Auth Header: Basic [REDACTED]');
  
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