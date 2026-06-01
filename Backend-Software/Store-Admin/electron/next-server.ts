import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';

let server: http.Server | null = null;

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
};

export async function startNextServer(): Promise<string> {
  return new Promise((resolve, reject) => {
    const outDir = path.join(__dirname, '..', '..', '..', 'Store-Admin', 'frontend', 'out');
    
    server = http.createServer((req, res) => {
      // Decode URL to handle spaces and special chars
      let safeUrl = decodeURIComponent(req.url || '/');
      
      // Remove query parameters
      const queryIdx = safeUrl.indexOf('?');
      if (queryIdx !== -1) {
        safeUrl = safeUrl.substring(0, queryIdx);
      }
      
      // Default to index.html for root path
      if (safeUrl === '/') {
        safeUrl = '/index.html';
      }
      
      let filePath = path.join(outDir, safeUrl);
      
      // Check if file exists, if not, fallback to index.html for SPA routing
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        const trailingSlashPath = path.join(filePath, 'index.html');
        if (fs.existsSync(trailingSlashPath)) {
          filePath = trailingSlashPath;
        } else {
          filePath = path.join(outDir, 'index.html');
        }
      }
      
      // Read file and serve
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
          return;
        }
        
        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        
        res.writeHead(200, {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache',
          'X-Content-Type-Options': 'nosniff',
        });
        res.end(data);
      });
    });
    
    // Start listening on port 3000
    server.listen(3000, '127.0.0.1', () => {
      console.log('Static Next.js production server running on http://127.0.0.1:3000');
      resolve('http://localhost:3000');
    });
    
    server.on('error', (err: any) => {
      console.error('Static server error:', err);
      reject(err);
    });
  });
}

export function stopNextServer() {
  if (server) {
    server.close();
    server = null;
  }
}
