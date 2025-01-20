const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, 'files');
const destDir = path.join(__dirname, 'files-copy');

function copyDirectory(src, dest) {
  fs.mkdir(dest, { recursive: true }, (err) => {
    if (err) {
      console.error('Error creating directory:', err);
      return;
    }

    fs.readdir(src, (err, files) => {
      if (err) {
        console.error('Error reading source directory:', err);
        return;
      }

      files.forEach((file) => {
        const srcFilePath = path.join(src, file);
        const destFilePath = path.join(dest, file);

        fs.stat(srcFilePath, (err, stats) => {
          if (err) {
            console.error('Error getting file stats:', err);
            return;
          }

          if (stats.isFile()) {
            fs.copyFile(srcFilePath, destFilePath, (err) => {
              if (err) {
                console.error('Error copying file:', err);
              } else {
                console.log(`Copied: ${file}`);
              }
            });
          } else if (stats.isDirectory()) {
            copyDirectory(srcFilePath, destFilePath);
          }
        });
      });
    });
  });
}

copyDirectory(sourceDir, destDir);
