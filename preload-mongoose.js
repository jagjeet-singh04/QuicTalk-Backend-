// src/preload-mongoose.js
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import fs from 'fs';
import path from 'path';

function safeRequire(modulePath) {
  try {
    require.resolve(modulePath);
    require(modulePath);
    console.log(`Successfully required: ${modulePath}`);
    return true;
  } catch (error) {
    console.error(`Error requiring ${modulePath}:`, error.message);
    
    // Try to find the file in node_modules
    const fullPath = path.join(process.cwd(), 'node_modules', modulePath);
    if (fs.existsSync(fullPath)) {
      console.log(`Found at: ${fullPath}`);
      require(fullPath);
      return true;
    }
    
    console.error(`File not found: ${fullPath}`);
    return false;
  }
}

console.log('Preloading Mongoose modules...');

// Load critical Mongoose modules
const modulesToLoad = [
  'mongoose/lib/connectionstate.js',
  'mongoose/lib/drivers/node-mongodb-native/collection.js',
  'mongoose/lib/drivers/node-mongodb-native/index.js'
];

modulesToLoad.forEach(modulePath => {
  if (!safeRequire(modulePath)) {
    console.error(`CRITICAL: Failed to load ${modulePath}`);
    // Fallback to empty module to prevent crash
    require.cache[require.resolve(modulePath)] = {
      exports: {}
    };
  }
});

console.log('Mongoose modules preloaded');