import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔨 Building project with NCC...');

// Clean dist directory
const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir);

// Build with NCC
execSync('ncc build src/index.js -o dist', { stdio: 'inherit' });

// Copy public directory
const publicSrc = path.join(__dirname, 'src', 'public');
const publicDest = path.join(distDir, 'public');
if (fs.existsSync(publicSrc)) {
  console.log('📁 Copying public directory...');
  fs.cpSync(publicSrc, publicDest, { recursive: true });
}

console.log('✅ Build completed successfully!');