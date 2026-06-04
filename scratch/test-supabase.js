const https = require('https');

const supabaseUrl = 'https://oeringgdbxmmihgvuyfa.supabase.co';
const anonKey = 'sb_publishable_laWLW3mZrK5wdSh115u2Dw_7K0BIjYU';

const options = {
  hostname: 'oeringgdbxmmihgvuyfa.supabase.co',
  path: '/rest/v1/tenants?select=id',
  method: 'GET',
  headers: {
    'apikey': anonKey,
    'Authorization': `Bearer ${anonKey}`
  }
};

const req = https.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Response body:', data);
  });
});

req.on('error', (e) => {
  console.error(`Error: ${e.message}`);
});

req.end();
