#!/usr/bin/env node

import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = {
  mac: [16, 32, 64, 128, 256, 512, 1024],
  win: [16, 24, 32, 48, 64, 128, 256],
  linux: [16, 24, 32, 48, 64, 128, 256, 512]
};

// Base icon design - creates a simple H logo
async function createBaseIcon(size) {
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#bg)"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
            fill="white" font-size="${size * 0.5}" font-weight="bold" font-family="system-ui">H</text>
    </svg>
  `;

  return Buffer.from(svg);
}

async function generateIcons() {
  const buildDir = path.join(__dirname, '..', 'build');

  // Ensure build directory exists
  await fs.mkdir(buildDir, { recursive: true });

  console.log('🎨 Generating app icons...');

  // Generate PNG icons for all sizes
  const allSizes = [...new Set([...sizes.mac, ...sizes.win, ...sizes.linux])];

  for (const size of allSizes) {
    const svgBuffer = await createBaseIcon(size);
    const outputPath = path.join(buildDir, `icon_${size}x${size}.png`);

    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);

    console.log(`  ✓ Created ${size}x${size} icon`);
  }

  // Copy specific sizes for different platforms
  // Windows ICO (uses 256x256)
  await fs.copyFile(
    path.join(buildDir, 'icon_256x256.png'),
    path.join(buildDir, 'icon.ico')
  );
  console.log('  ✓ Created Windows icon (icon.ico)');

  // macOS ICNS (uses 1024x1024)
  await fs.copyFile(
    path.join(buildDir, 'icon_512x512.png'),
    path.join(buildDir, 'icon.icns')
  );
  console.log('  ✓ Created macOS icon (icon.icns)');

  // Linux (multiple sizes)
  for (const size of sizes.linux) {
    await fs.copyFile(
      path.join(buildDir, `icon_${size}x${size}.png`),
      path.join(buildDir, `${size}x${size}.png`)
    );
  }
  console.log('  ✓ Created Linux icons');

  console.log('\n✅ Icon generation complete!');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateIcons().catch(console.error);
}

export default generateIcons;