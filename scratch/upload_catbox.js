const fs = require('fs');
const path = require('path');
const http = require('https');

const filePath = path.join(__dirname, '..', 'desktop', 'dist-desktop', 'CafeCanvas Store Admin Setup 1.0.0.exe');
const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';

function upload() {
  const fileBuffer = fs.readFileSync(filePath);
  const fileName = 'CafeCanvas-Store-Admin-Setup-1.0.0.exe';

  let body = '';
  body += `--${boundary}\r\n`;
  body += 'Content-Disposition: form-data; name="reqtype"\r\n\r\n';
  body += 'fileupload\r\n';
  body += `--${boundary}\r\n`;
  body += `Content-Disposition: form-data; name="fileToUpload"; filename="${fileName}"\r\n`;
  body += 'Content-Type: application/octet-stream\r\n\r\n';

  const footer = `\r\n--${boundary}--\r\n`;

  const payload = Buffer.concat([
    Buffer.from(body, 'utf8'),
    fileBuffer,
    Buffer.from(footer, 'utf8')
  ]);

  const options = {
    hostname: 'catbox.moe',
    port: 447, // SSL port or fallback to default 443
    path: '/user/api.php',
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data; boundary=' + boundary,
      'Content-Length': payload.length
    }
  };

  // Try standard HTTPS first
  options.port = 443;
  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('Upload finished!');
      console.log('Response from server:', data.trim());
    });
  });

  req.on('error', (e) => {
    console.error('Request failed:', e.message);
  });

  console.log('Starting upload to catbox.moe (78MB)...');
  req.write(payload);
  req.end();
}

upload();
