// src/preload-mongoose.js
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import path from 'path';

// Get mongoose installation path
const mongoosePath = path.dirname(require.resolve('mongoose'));

// Explicitly require all necessary Mongoose internal files
require(path.join(mongoosePath, 'lib/connectionstate'));
require(path.join(mongoosePath, 'lib/drivers/node-mongodb-native/collection'));
require(path.join(mongoosePath, 'lib/drivers/node-mongodb-native/index'));
require(path.join(mongoosePath, 'lib/helpers/printJestWarning'));
require(path.join(mongoosePath, 'lib/helpers/getConstructorName'));
require(path.join(mongoosePath, 'lib/helpers/specialProperties'));

console.log('Mongoose internal modules preloaded successfully');