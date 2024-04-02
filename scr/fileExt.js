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

async function doZip(nameFile, minifiedFiles, callbackProgress) {
  const zip = new JSZip();
  for (const file of minifiedFiles) {
    zip.file(file.name, file);
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' }, callbackProgress);
  const zipUrl = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.href = zipUrl;
  link.download = nameFile + '.zip';
  link.click();
  URL.revokeObjectURL(zipUrl);
}

async function downloadFilesFromUrls(urls, callbackProgress, callbackSuccess, callbackError) {
  const files = [];
  let current = 0;
  const downloadNextFile = async () => {
    if (current >= urls.length) {
      return;
    }

    const {url, pathSave} = urls[current];
    callbackProgress && callbackProgress({ current, total : urls.length, url, pathSave});
    console.log(`Downloading ${url}, ${pathSave} `);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        callbackError && callbackError({ current, total : urls.length, url, pathSave});
        throw new Error(`Failed to download ${url}`);
      }
      const blob = await response.blob();
      const file = new File([blob], pathSave, { type: "application/octet-stream" });
      files.push(file);
      current++;
      callbackSuccess && callbackSuccess({ current, total : urls.length, url, pathSave});
      await downloadNextFile();
    } catch (err) {
      callbackError && callbackError({ current, total : urls.length, url, pathSave});
      console.error(`Failed to download ${url}: ${err.message}`);
      current++;
      await downloadNextFile();
    }
  };
  await downloadNextFile();

  return files;
}



