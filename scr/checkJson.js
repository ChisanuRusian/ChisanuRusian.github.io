async function openFolder(){
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
        if (file.name.endsWith('.json')) {
          console.log(`Adding ${file.webkitRelativePath}`);
          paths.push({ path: file.webkitRelativePath, file: URL.createObjectURL(file) });
        }
      }
      resolve(paths);
    });
  })
}

async function minifyAllJsonAndZip(paths) {
  const minifiedFiles = await Promise.all(paths.map(async (path) => {
    const response = await fetch(path.file);
    const json = await response.json();
    const minifiedJson = JSON.stringify(json, null, 2);
    const fileNameParts = path.path.split('/');
    const folderParts = fileNameParts.slice(0, -1);
    const fileName = fileNameParts.pop();
    const minifiedFileName = fileName.split('.').shift() + '.json';
    const minifiedFile = new File(
      [minifiedJson],
      folderParts.concat(minifiedFileName).join('/'),
      { type: 'application/json' }
    );
    return minifiedFile;
  }));
  
  const zip = new JSZip();
  for (const file of minifiedFiles) {
    zip.file(file.name, file);
  }

  const zipBlob = await zip.generateAsync({type: 'blob'});
  const zipUrl = URL.createObjectURL(zipBlob);
  const downloadLink = document.createElement('a');
  downloadLink.href = zipUrl;
  downloadLink.download = `minified_json.zip`;
  downloadLink.click();
  URL.revokeObjectURL(zipUrl);
}


async function doActions() {
  const paths = await openFolder();
  await minifyAllJsonAndZip(paths);
}


