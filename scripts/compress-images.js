// scripts/compress-images.js
const imagemin = require('imagemin');
const imageminWebp = require('imagemin-webp');

async function compress() {
  await imagemin(['public/images/*.{jpg,png}'], {
    destination: 'public/images/webp',
    plugins: [
      imageminWebp({ quality: 75 })
    ]
  });
  console.log('Images compressées en WebP !');
}

compress();