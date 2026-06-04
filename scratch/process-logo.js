// @ts-nocheck
const sharp = require('../cafe-canvas-store-admin/node_modules/sharp');
const fs = require('fs');
const path = require('path');

const inputPath = 'C:\\Users\\yash\\.gemini\\antigravity-ide\\brain\\58568dcd-421f-45c8-83fc-08b91a5f0112\\media__1780569941252.jpg';
const outputPath = path.join(__dirname, 'logo_transparent.png');

async function processImage() {
  try {
    console.log('Reading image details...');
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    const width = metadata.width;
    const height = metadata.height;
    console.log(`Image dimensions: ${width}x${height}`);

    // Get raw pixel buffer
    const { data, info } = await image
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Create alpha channel buffer
    // info.channels will be 3 (RGB) or 4 (RGBA)
    const channels = info.channels;
    const newBuffer = Buffer.alloc(width * height * 4);

    // Flood fill visited map
    const visited = new Uint8Array(width * height);
    const queue = [];

    // Check if pixel is background (neutral and light)
    function isBackgroundPixel(x, y) {
      const idx = (y * width + x) * channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      
      // Grayscale/neutral check: max difference between color channels is small
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const diff = max - min;
      
      // Checkerboard is light grey (~200) and white (~255)
      // Neutral grayscale colors have very low diff.
      return diff < 20 && min > 165;
    }

    // Add corners to queue
    const corners = [
      [0, 0],
      [width - 1, 0],
      [0, height - 1],
      [width - 1, height - 1]
    ];

    for (const [cx, cy] of corners) {
      const idx = cy * width + cx;
      if (isBackgroundPixel(cx, cy)) {
        queue.push([cx, cy]);
        visited[idx] = 1;
      }
    }

    // BFS Flood Fill
    let head = 0;
    while (head < queue.length) {
      const [x, y] = queue[head++];
      
      // 4-way neighbors
      const neighbors = [
        [x + 1, y],
        [x - 1, y],
        [x, y + 1],
        [x, y - 1]
      ];

      for (const [nx, ny] of neighbors) {
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const nidx = ny * width + nx;
          if (!visited[nidx]) {
            if (isBackgroundPixel(nx, ny)) {
              visited[nidx] = 1;
              queue.push([nx, ny]);
            }
          }
        }
      }
    }

    console.log(`Flood fill completed. Background pixels identified: ${queue.length} of ${width * height}`);

    // Fill new buffer with RGBA values
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const srcIdx = (y * width + x) * channels;
        const dstIdx = (y * width + x) * 4;
        const visitedIdx = y * width + x;

        newBuffer[dstIdx] = data[srcIdx];     // R
        newBuffer[dstIdx + 1] = data[srcIdx + 1]; // G
        newBuffer[dstIdx + 2] = data[srcIdx + 2]; // B

        if (visited[visitedIdx] === 1) {
          newBuffer[dstIdx + 3] = 0; // Transparent background
        } else {
          newBuffer[dstIdx + 3] = 255; // Fully opaque logo
        }
      }
    }

    // Save processed image
    await sharp(newBuffer, {
      raw: {
        width,
        height,
        channels: 4
      }
    })
    .png()
    .toFile(outputPath);

    console.log(`Saved transparent logo to: ${outputPath}`);
  } catch (error) {
    console.error('Error processing image:', error);
  }
}

processImage();
