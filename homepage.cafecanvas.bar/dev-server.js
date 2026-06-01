const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3001;
const PUBLIC_DIR = __dirname;

const server = http.createServer((req, res) => {
  let urlPath = (req.url || '/').split('?')[0];

  // Map Vercel rewrites: /themes01 -> /theme-01.html, /themes10 -> /theme-10.html, etc.
  const themeMatch = urlPath.match(/^\/themes(\d{2})$/);
  if (themeMatch) {
    const num = themeMatch[1];
    urlPath = `/theme-${num}.html`;
  } else if (urlPath === '/super-admin') {
    urlPath = '/super-branches-admin.html';
  } else if (urlPath === '/branch-admin') {
    urlPath = '/branches-admin.html';
  } else if (urlPath === '/store-admin') {
    res.statusCode = 307;
    res.setHeader('Location', 'http://localhost:3000/login');
    res.end();
    return;
  }

  // Default to index.html for root
  if (urlPath === '/' || urlPath === '') {
    urlPath = '/index.html';
  }

  const filePath = path.join(PUBLIC_DIR, urlPath);

  // Check if file exists and is within the PUBLIC_DIR
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.statusCode = 403;
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Not Found');
      return;
    }

    // Determine content type
    let contentType = 'text/html';
    if (filePath.endsWith('.js')) contentType = 'application/javascript';
    else if (filePath.endsWith('.css')) contentType = 'text/css';
    else if (filePath.endsWith('.json')) contentType = 'application/json';
    else if (filePath.endsWith('.png')) contentType = 'image/png';
    else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) contentType = 'image/jpeg';
    else if (filePath.endsWith('.svg')) contentType = 'image/svg+xml';
    else if (filePath.endsWith('.ico')) contentType = 'image/x-icon';

    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`Local dev server with clean routes running at http://localhost:${PORT}`);
});
