const fs = require('fs');
const path = require('path');

const projectDistDir = path.join(__dirname, 'project-dist');
const templateFilePath = path.join(__dirname, 'template.html');
const componentsDir = path.join(__dirname, 'components');
const stylesDir = path.join(__dirname, 'styles');
const assetsDir = path.join(__dirname, 'assets');
const outputHtmlPath = path.join(projectDistDir, 'index.html');
const outputCssPath = path.join(projectDistDir, 'style.css');

fs.mkdir(projectDistDir, { recursive: true }, (err) => {
  if (err) {
    console.error('Error creating project-dist directory:', err);
    return;
  }

  fs.readFile(templateFilePath, 'utf-8', (err, template) => {
    if (err) {
      console.error('Error reading template file:', err);
      return;
    }

    const componentTags = template.match(/{{\w+}}/g) || [];
    const promises = componentTags.map((tag) => {
      const componentName = tag.replace(/{{|}}/g, '').trim();
      const componentFilePath = path.join(
        componentsDir,
        `${componentName}.html`,
      );

      return new Promise((resolve, reject) => {
        fs.readFile(componentFilePath, 'utf-8', (err, content) => {
          if (err) {
            reject(`Error reading component ${componentName}: ${err}`);
          } else {
            template = template.replace(tag, content);
            resolve();
          }
        });
      });
    });

    Promise.all(promises)
      .then(() => {
        fs.writeFile(outputHtmlPath, template, (err) => {
          if (err) {
            console.error('Error writing index.html:', err);
          } else {
            console.log('index.html created successfully.');
          }
        });

        compileStyles();
        copyAssets();
      })
      .catch((err) => {
        console.error(err);
      });
  });
});

function compileStyles() {
  const writeStream = fs.createWriteStream(outputCssPath);

  fs.readdir(stylesDir, (err, files) => {
    if (err) {
      console.error('Error reading styles directory:', err);
      return;
    }

    const cssFiles = files.filter((file) => path.extname(file) === '.css');

    let fileReadPromises = cssFiles.map((file) => {
      return new Promise((resolve, reject) => {
        const filePath = path.join(stylesDir, file);
        const readStream = fs.createReadStream(filePath, 'utf8');

        readStream.pipe(writeStream, { end: false });
        readStream.on('end', () => {
          writeStream.write('\n');
          resolve();
        });
        readStream.on('error', (err) => {
          reject(`Error reading file ${file}: ${err}`);
        });
      });
    });

    Promise.all(fileReadPromises)
      .then(() => {
        writeStream.end(() => {
          console.log('style.css created successfully.');
        });
      })
      .catch((err) => {
        console.error(err);
      });
  });
}

function copyAssets() {
  fs.mkdir(path.join(projectDistDir, 'assets'), { recursive: true }, (err) => {
    if (err) {
      console.error('Error creating assets directory:', err);
      return;
    }
  });

  fs.readdir(assetsDir, (err, files) => {
    if (err) {
      console.error('Error reading assets directory:', err);
      return;
    }

    files.forEach((file) => {
      const srcFilePath = path.join(assetsDir, file);
      const destFilePath = path.join(projectDistDir, 'assets', file);

      fs.stat(srcFilePath, (err, stats) => {
        if (err) {
          console.error('Error getting file stats:', err);
          return;
        }
        if (stats.isFile()) {
          const readStream = fs.createReadStream(srcFilePath);
          const writeStream = fs.createWriteStream(destFilePath);
          readStream.pipe(writeStream);
        } else if (stats.isDirectory()) {
          copyDirectory(srcFilePath, destFilePath);
        }
      });
    });
  });
}

function copyDirectory(src, dest) {
  fs.mkdir(dest, { recursive: true }, (err) => {
    if (err) {
      console.error('Error creating nested directory:', err);
      return;
    }
  });

  fs.readdir(src, (err, files) => {
    if (err) {
      console.error('Error reading nested assets directory:', err);
      return;
    }

    files.forEach((file) => {
      const srcFilePath = path.join(src, file);
      const destFilePath = path.join(dest, file);

      fs.stat(srcFilePath, (err, stats) => {
        if (err) {
          console.error('Error getting nested file stats:', err);
          return;
        }

        if (stats.isFile()) {
          const readStream = fs.createReadStream(srcFilePath);
          const writeStream = fs.createWriteStream(destFilePath);

          readStream.pipe(writeStream);
        } else if (stats.isDirectory()) {
          copyDirectory(srcFilePath, destFilePath);
        }
      });
    });
  });
}
