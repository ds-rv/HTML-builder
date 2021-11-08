const fs = require('fs/promises');
const path = require('path');

const readFile = async (fileUrl) => {
  try {
    const handle = await fs.open(fileUrl, 'r');
    const fileData = await handle.readFile();
    handle.close();
    return fileData;
  } catch (error) {
    console.log('Error while reading a file: ' + fileUrl);
    throw error;
  }
};

const createFile = async (fileUrl, content) => {
  try {
    await fs.writeFile(fileUrl, content);
  } catch (error) {
    console.log('Error while creating a file: ' + fileUrl);
    throw error;
  }
};

const mergeStyles = async (stylesFolderUrl, bundleFileUrl) => {
  try {
    const files = await fs.readdir(stylesFolderUrl, {withFileTypes: true});
    let bundleContent = [];

    for (const file of files) {
      if (file.isFile()) {
        const fileExt = path.extname(file.name).replace('.', '').toLowerCase();
        if (fileExt !== 'css') {
          continue;
        }

        const fileUrl = path.join(__dirname, '/styles', file.name);
        const fileContent = await readFile(fileUrl);

        bundleContent.push('/* ==================== ' + file.name + ' ==================== */\n' + fileContent);
      }
    }

    await createFile(bundleFileUrl, bundleContent.join('\n\n\n'));

  } catch (err) {
    console.error(err.name + ': ' + err.message);
  }
};

const stylesFolderUrl = path.join(__dirname, '/styles');
const bundleFileUrl = path.join(__dirname, '/project-dist', 'bundle.css');

mergeStyles(stylesFolderUrl, bundleFileUrl);