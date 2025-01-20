const fs = require('fs');
const path = require('path');

const stylesDir = path.join(__dirname, 'styles');
const outputDir = path.join(__dirname, 'project-dist');
const outputFilePath = path.join(outputDir, 'bundle.css');

fs.mkdir(outputDir, { recursive: true }, (err) => {
  if (err) {
    console.error('Error creating output directory:', err);
    return;
  }

  fs.readdir(stylesDir, (err, files) => {
    if (err) {
      console.error('Error reading styles directory:', err);
      return;
    }

    const cssFiles = files.filter((file) => path.extname(file) === '.css');

    const writeStream = fs.createWriteStream(outputFilePath);

    cssFiles.forEach((file) => {
      const filePath = path.join(stylesDir, file);
      const readStream = fs.createReadStream(filePath, 'utf8');

      readStream.pipe(writeStream, { end: false });
      readStream.on('end', () => {
        writeStream.write('\n');
      });
      readStream.on('error', (err) => {
        console.error('Error reading file:', err);
      });
    });

    writeStream.on('finish', () => {
      console.log('Styles have been merged into bundle.css');
    });
  });
});
