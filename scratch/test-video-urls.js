const https = require('https');

const videoIds = [
  '3047913', // Latte art
  '1437396', // Coffee pouring
  '2909914', // Barista pouring
  '1943481', // Bartender preparing
  '3125396', // Earth (known to work)
  '2894281', // Cafe interior
  '3196123', // Coffee cups
  '3202232', // Cafe bartender
  '3571264', // Pouring espresso
  '4489115', // Bartender shaking cocktail
  '5312984', // Pouring latte
  '4828606', // Pouring milk
];

const patterns = [
  'hd_1920_1080_25fps',
  'hd_1920_1080_30fps',
  'hd_1920_1080_24fps',
  'sd_960_540_25fps',
  'sd_960_540_30fps',
  'uhd_3840_2160_25fps',
  'uhd_3840_2160_30fps',
  'hd_1080_1920_30fps', // Vertical
  'hd_1080_1920_25fps', // Vertical
];

function checkUrl(url) {
  return new Promise((resolve) => {
    const req = https.request(url, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.end();
  });
}

async function run() {
  console.log('Testing video URLs on Pexels CDN...');
  for (const id of videoIds) {
    for (const pat of patterns) {
      const url = `https://videos.pexels.com/video-files/${id}/${id}-${pat}.mp4`;
      const exists = await checkUrl(url);
      if (exists) {
        console.log(`FOUND WORKING URL: ${url}`);
      }
    }
  }
  console.log('Done testing.');
}

run();
