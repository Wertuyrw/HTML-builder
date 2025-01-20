const fs = require('fs');
const path = require('path');

const secretFolderPath = path.join(__dirname, 'secret-folder');

fs.readdir(secretFolderPath, { withFileTypes: true }, (err, files) => {
  if (err) {
    console.error('Error reading the directory:', err);
    return;
  }
  files.forEach((file) => {
    if (file.isFile()) {
      const filePath = path.join(secretFolderPath, file.name);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error('Error getting file stats:', err);
          return;
        }

        const fileSizeInBytes = stats.size;
        const fileName = path.parse(file.name).name;
        const fileExtension = path.parse(file.name).ext.slice(1);
        const fileSizeInKB = (fileSizeInBytes / 1024).toFixed(3);

        console.log(`${fileName} - ${fileExtension} - ${fileSizeInKB}kb`);
      });
    }
  });
});
