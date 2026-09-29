import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1x1 Minimal PNG Base64
const basePngBuffer = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

const publicDir = path.join(__dirname, '..', 'public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Copy icon.svg to favicon.svg if exists
if (fs.existsSync(path.join(publicDir, 'icon.svg'))) {
  const svgContent = fs.readFileSync(path.join(publicDir, 'icon.svg'));
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent);
}

const pngFiles = [
  'pwa-192x192.png',
  'pwa-512x512.png',
  'pwa-maskable-512x512.png',
  'apple-touch-icon.png',
  'favicon.ico'
];

pngFiles.forEach((file) => {
  const filePath = path.join(publicDir, file);
  fs.writeFileSync(filePath, basePngBuffer);
});

console.log('PWA Icon assets generated successfully in public/');
