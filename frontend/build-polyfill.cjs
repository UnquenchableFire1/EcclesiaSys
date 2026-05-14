const crypto = require('node:crypto');
if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = crypto.webcrypto || crypto;
}
if (typeof global.crypto === 'undefined') {
  global.crypto = crypto.webcrypto || crypto;
}
console.log('Build polyfill loaded: crypto is defined.');
