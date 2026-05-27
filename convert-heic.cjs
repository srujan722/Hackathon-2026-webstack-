const fs = require('fs');
const heicConvert = require('heic-convert');

(async () => {
  const inputBuffer = fs.readFileSync('C:\\Users\\DELL\\Desktop\\iphone 11 data\\freshyyy\\IMG_E2994.HEIC');
  console.log('Read file, size:', inputBuffer.length);
  const outputBuffer = await heicConvert({
    buffer: inputBuffer, // the HEIC file buffer
    format: 'JPEG',      // output format
    quality: 0.8         // the jpeg compression quality, between 0 and 1
  });
  console.log('Converted, output size:', outputBuffer.length);
  fs.writeFileSync('public/devansh-profile.jpg', outputBuffer);
  console.log('Saved to public/devansh-profile.jpg');
})();
