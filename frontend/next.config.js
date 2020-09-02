module.exports = require('next-transpile-modules')(['common'])({
  distDir: 'build',
  assetPrefix: process.env.NEXT_PUBLIC_URL || '',
});
