const fs = require('fs/promises');
const path = require('path');

const folderUrl = path.join(__dirname, '/secret-folder');

(async () => {
  try {
    const files = await fs.readdir(folderUrl, {withFileTypes: true});
    for (const file of files) {
      if (file.isFile()) {
        const fileExt = path.extname(file.name).replace('.', '');
        const fileName = path.basename(file.name, path.extname(file.name));
        const fileUrl = path.join(__dirname, '/secret-folder', file.name);
        const handle = await fs.open(fileUrl, 'r');
        const stats = await handle.stat();
        const fileSize = stats.size;

        console.log(fileName + ' - ' + fileExt + ' - ' + fileSize + ' bytes');
        await handle.close();
      }
    }

  } catch (err) {
    console.error(err.name + ': ' + err.message);
  }
})();
