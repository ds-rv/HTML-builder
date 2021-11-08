const fs = require('fs/promises');
const path = require('path');

const createFolder = async (destination) => {
  try {
    const folderPath = await fs.mkdir(destination, {recursive: true});
    return folderPath;
  } catch (error) {
    console.log('Error while creating folder ' + destination);
    throw error;
  }
}

const deleteFolder = async (path) => {
  try {
    await fs.rm(path, {force: true, recursive: true});
  } catch (error) {
    console.log('Failed to delete directory ' + path);
    throw error;
  }
};

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
}

const createFile = async (fileUrl, content) => {
  try {
    await fs.writeFile(fileUrl, content);
  } catch (error) {
    console.log('Error while creating a file: ' + fileUrl);
    throw error;
  }
}

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

const copyFile = async (source, destination) => {
  try {
    await fs.copyFile(source, destination);
  } catch(error) {
    console.log('The file ' + source + ' could not be copied');
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

const buildTemplate = async (componentsUrl, templateUrl, resultUrl) => {
  let result = await readFile(templateUrl);
  result = result.toString();

  let tags = result.match(/{{.*}}/g);
  // get rid of repeating elements of the array
  tags = Array.from(new Set(tags));

  for (const tag of tags) {
    const fileName = tag.replace(/[{}]/g, '') + '.html';
    const componentUrl = path.join(componentsUrl, fileName);

    let component = '';
    try {
      component = await readFile(componentUrl);

    } catch (err) {
      console.log('Failed to open the component at: ' + componentUrl);
    }

    const regexp = new RegExp(tag, 'g');
    result = result.replace(regexp, component.toString());
  }

  await createFile(resultUrl, result);
};

const buildPage = async () => {

  try {
    const assetsUrl = path.join(__dirname, '/assets');
    const componentsUrl = path.join(__dirname, '/components');
    const styleSourceUrl = path.join(__dirname, '/styles');
    const templateUrl = path.join(__dirname, '/template.html')

    let buildFolderUrl = path.join(__dirname, '/project-dist');
    await deleteFolder(buildFolderUrl);
    buildFolderUrl = await createFolder(buildFolderUrl);

    const stylesBundleUrl = path.join(buildFolderUrl, 'style.css');
    const assetsDestinationUrl = path.join(buildFolderUrl, '/assets');
    const resultUrl = path.join(buildFolderUrl, '/index.html');

    await mergeStyles(styleSourceUrl, stylesBundleUrl);
    await copyFolder(assetsUrl, assetsDestinationUrl);
    await buildTemplate(componentsUrl, templateUrl, resultUrl);

  } catch (err) {
    console.error(err.name + ': ' + err.message);
  }

}

buildPage();