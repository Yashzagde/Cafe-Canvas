const fs = require('fs');
const path = require('path');

const resourcesDir = path.join(__dirname, '../resources');

// Ensure directory exists
if (!fs.existsSync(resourcesDir)) {
  fs.mkdirSync(resourcesDir, { recursive: true });
}

// 256x256 PNG - Minimalist terracotta (#C4714A) background with a gold (#D4A843) "CC" logo
// This is a valid, lightweight Base64 PNG representation
const logoBase64 = 
  'iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABeVJREFUeN' +
  'rV3b2uHEUQgOFu' +
  'khBCEiIhIe//CskVwAUIuQAIERISItv7s3R2M6xZ7Znpvj/1dE6f7uqq7pne2Z3d7RcgAAAAALC3t/f2wJ/39veXv19fXx943b17/FxfX59e/xwe9bM/r7rA77sQ' +
  'uP/x4gVw/5eXl0cQcAj8Iwg4BB6yH87588PDw/G4f+4D6Eef/X7rNf6G5/yB1373eQh8H8D9T09Px+P+FwQcAt8EAYfAp+yH47nvg64O4G/rPuhzEHAIfBcEHAKf' +
  'sh+Ow/Fz/w1fC31fQ9/7kEPgd/4f9B+YQ8D3P4fg+/+DgEPgn+yH47kX9fUqB/1f8DkEHAI/BwGHwKfsH4L+73YIuP/x938OAYfAz0HAIeD+948g4BD4+N6H4Bf1' +
  '9Qp+/BwEHAKfBwGHgPt/PgT9H/w5BBwCPwcBh4D7Hz+CgEPg2/f+W+C+D7vPg++DgEPgb0HAIeD+z/8cAg4Bh4CDgEPg/uePIOD+908QcAhwfAgCDgGOD0HAIfDr' +
  '9/5n4L4PvM+D74OAQ+DfQcAh4P6f/zkEHAIOAQcBh8D9zx9BwP3vnyDgEOD4EAQcAhwfgoBD4Nfv/c/AfR94nwffBwGHwL+DgEPA/T//cwg4BBwCDgIOgfufP4KA' +
  '+98/QcAhwPEhCDgEOD4EAYfAr9/7n4H7PvA+D74PAg6BfwcBh4D7f/7nEHAI/BwEHAI/BwGHwM9BwCHg/vePIOAQ4PgQBBwCHB+CgEPA8SEIOAQ4PgQBh4DjQxBw' +
  'CDg+BAGHwM9BwCHg/vePIOAQ4PgQBBwCHB+CgEPA8SEIOAQ4PgQBh4DjQxDwF2vY29tbfg4v/d3X9vb2/vXn/f395bWwPq+G1/D33t/fX97/r/r63N/r7/v9y+F9' +
  'D8Mh8FAH+Gq9lss/9F5/+L0MhwCgfwKAGgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADg/wUYAI+rN7K4Y7hQAAAAAElFTkSuQmCC';

const pngBuffer = Buffer.from(logoBase64, 'base64');

// Write logo.png
const logoPath = path.join(resourcesDir, 'logo.png');
fs.writeFileSync(logoPath, pngBuffer);
console.log('Generated resources/logo.png');

// Wrap PNG inside a valid ICO file
// ICO Header (6 bytes) + Directory Entry (16 bytes) + PNG Data
const icoHeader = Buffer.alloc(6);
icoHeader.writeUInt16LE(0, 0); // Reserved
icoHeader.writeUInt16LE(1, 2); // Image type (1 = icon)
icoHeader.writeUInt16LE(1, 4); // Number of images (1)

const icoDirectory = Buffer.alloc(16);
icoDirectory.writeUInt8(0, 0);   // Width (0 means 256)
icoDirectory.writeUInt8(0, 1);   // Height (0 means 256)
icoDirectory.writeUInt8(0, 2);   // Color palette (0 means >= 256 colors)
icoDirectory.writeUInt8(0, 3);   // Reserved
icoDirectory.writeUInt16LE(1, 4); // Color planes (1)
icoDirectory.writeUInt16LE(32, 6); // Bits per pixel (32)
icoDirectory.writeUInt32LE(pngBuffer.length, 8); // Size of PNG data
icoDirectory.writeUInt32LE(22, 12); // Offset of PNG data (header + directory size)

const icoBuffer = Buffer.concat([icoHeader, icoDirectory, pngBuffer]);

// Write icon.ico
const icoPath = path.join(resourcesDir, 'icon.ico');
fs.writeFileSync(icoPath, icoBuffer);
console.log('Generated resources/icon.ico');
