const fs = require('fs/promises');
const path = require('path');

const deleteFolder = async (path) => {
  try {
    await fs.rm(path, {force: true, recursive: true});
  } catch (error) {
    console.log('Failed to delete directory ' + path);
    throw error;
  }
};

const copyFile = async (source, destination) => {
  try {
    await fs.copyFile(source, destination);
  } catch(error) {
    console.log('The file ' + source + ' could not be copied');
    throw error;
  }
};

const createFolder = async (destination) => {
  try {
    const folderPath = await fs.mkdir(destination);
    return folderPath;
  } catch (error) {
    console.log('Error while creating folder ' + destination);
    throw error;
  }
};

const copyFolder = async (source, destination, deleteDestination = false) => {

  try {
    if (deleteDestination) {
      await deleteFolder(destination);
    }
    
    const folderPath = await createFolder(destination);

    const files = await fs.readdir(source, {withFileTypes: true});
    for (const file of files) {
      const sourceFileUrl = path.join(source, file.name);
      const destFileUrl = path.join(destination, file.name);

      if (file.isFile()) {
        await copyFile(sourceFileUrl, destFileUrl);
      } else if (file.isDirectory()) {
        await copyFolder(sourceFileUrl, destFileUrl);
      }
    }

  } catch (err) {
    console.error(err.name + ': ' + err.message);
  }

};

const sourceUrl = path.join(__dirname, '/files');
const destinationUrl = path.join(__dirname, '/files-copy');

copyFolder(sourceUrl, destinationUrl, true);
