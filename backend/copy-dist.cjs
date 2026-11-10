const fs = require('fs');
fs.cpSync('public', 'dist', { recursive: true });
console.log('✓ Successfully copied public to dist for Hostinger');
