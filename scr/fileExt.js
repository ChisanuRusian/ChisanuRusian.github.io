async function openOneFile(extensionAllow = '.json') {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = extensionAllow;
  input.style.display = 'none';
  document.body.appendChild(input);
  input.click();

  return new Promise(resolve => {
    input.addEventListener('change', async () => {
      const file = input.files[0];
      if (file?.type === 'application/json') {
        resolve(URL.createObjectURL(file));
      }
    });
  });
}

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
          paths.push({ path: file.webkitRelativePath, file: URL.createObjectURL(file), origin: file });
        }
      }
      resolve(paths);
    });
  })
}

async function doZip(nameFile, minifiedFiles) {
  const zip = new JSZip();
  for (const file of minifiedFiles) {
    zip.file(file.name, file);
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const zipUrl = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.href = zipUrl;
  link.download = nameFile + '.zip';
  link.click();
  URL.revokeObjectURL(zipUrl);
}



