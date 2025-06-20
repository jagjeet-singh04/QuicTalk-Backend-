// build.cjs
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Building project with NCC...');

// Clean dist directory
const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir);

// Build with NCC
try {
  execSync('ncc build src/index.js -o dist', { stdio: 'inherit' });
  console.log('✅ NCC build completed successfully!');
} catch (error) {
  console.error('❌ NCC build failed:', error);
  process.exit(1);
}

// Copy public directory
const publicSrc = path.join(__dirname, 'src', 'public');
const publicDest = path.join(distDir, 'public');
if (fs.existsSync(publicSrc)) {
  console.log('📁 Copying public directory...');
  fs.cpSync(publicSrc, publicDest, { recursive: true });
}

// Copy .env file if exists
if (fs.existsSync('.env')) {
  console.log('📄 Copying .env file...');
  fs.copyFileSync('.env', path.join(distDir, '.env'));
}

console.log('🚀 Build completed successfully!');