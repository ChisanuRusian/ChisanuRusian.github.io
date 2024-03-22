async function openFolder(extensionAllow = ['.json']) {
  const input = document.createElement('input');
  input.type = 'file';
  input.webkitdirectory = true;
  input.style.display = 'none';
  document.body.appendChild(input);
  input.click();

  return new Promise(resolve => {
    input.addEventListener('change', async () => {
      const paths = [];
      for (const file of input.files) {
        if (extensionAllow.some(ext => file.name.endsWith(ext))) {
          paths.push({ path: file.webkitRelativePath, file: URL.createObjectURL(file) });
        }
      }
      resolve(paths);
    });
  })
}


async function minifyAllJson(paths) {
  const minifiedFiles = await Promise.all(paths.map(async ({ path, file }) => {
    const json = await (await fetch(file)).json();
    const [, ...folderParts] = path.split('/');
    const root = folderParts.pop();
    const fileName = path.split('/').pop();
    const minifiedJson = JSON.stringify(json, null, 2);
    const minifiedFile = new File(
      [minifiedJson],
      [...folderParts, fileName].join('/'),
      { type: 'application/json' }
    );
    return minifiedFile;
  }));

  return minifiedFiles;
}

async function minifyAllXml(paths) {
  const minifiedFiles = await Promise.all(paths.map(async ({ path, file }) => {
    const xmlText = await (await fetch(file)).text();
    const [, ...folderParts] = path.split('/');
    const root = folderParts.pop();

    const fileName = path.split('/').pop();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'application/xml');
    const xmlString = new XMLSerializer().serializeToString(xmlDoc);
    const minifiedXml = vkbeautify.xmlmin(xmlString);
    const minifiedFile = new File(
      [minifiedXml],
      [...folderParts, fileName].join('/'),
      { type: 'application/xml' }
    );
    return minifiedFile;
  }));

  return minifiedFiles;
}

async function doZip(root, minifiedFiles) {
  const zip = new JSZip();
  for (const file of minifiedFiles) {
    zip.file(file.name, file);
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const zipUrl = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.href = zipUrl;
  link.download = root + '.zip';
  link.click();
  URL.revokeObjectURL(zipUrl);
}

async function doMinifyJson() {
  const paths = await openFolder();
  const minifiedFiles = await minifyAllJson(paths);
  await doZip("json_compress", minifiedFiles);
}

async function doMinifyXml() {
  const paths = await openFolder(['.plist', '.xml']);
  const minifiedFiles = await minifyAllXml(paths);
  await doZip("xml_compress", minifiedFiles);
}
