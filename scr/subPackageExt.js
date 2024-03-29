async function fetchSubPackage(host,file) {
  const json = await (await fetch(file)).json();

  const listPath = json.listPath;
  const listMd5 = json.listMd5;
  const map = [];
  // const host = "https://o-gl-sg.ihago.net/file/game/ludoduliyouxi_yn/subpackage/";

  listPath.forEach((path, i) => {
    if (listMd5[i]) {
      let extension = path.split('.').pop(); // change get file extension on web
      let preName = path.substring(0, path.length - extension.length - 1);
      preName += ("."+ listMd5[i] + "." + extension);
      map.push({
          url: host + preName,
          pathSave:  path
      })
    } else {
      cc.log("File no have MD5", path)
    }
  });

  return map;
}

async function downloadFilesFromUrls(urls, labelProgress) {
  const files = [];
  let nextUrlIndex = 0;
  labelProgress.textContent = 'Get Sub Package: Start Download...';

  const downloadNextFile = async () => {
    if (nextUrlIndex >= urls.length) {
      return;
    }

    const {url, pathSave} = urls[nextUrlIndex];
    labelProgress.textContent = 'Get Sub Package: Download...' + (nextUrlIndex + 1) + '/' + urls.length + '...' + pathSave;

    console.log(`Downloading ${url}, ${pathSave} `);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to download ${url}`);
      }
      const blob = await response.blob();
      const file = new File([blob], pathSave, { type: "application/octet-stream" });
      files.push(file);
      nextUrlIndex++;
      await downloadNextFile();
    } catch (err) {
      console.error(`Failed to download ${url}: ${err.message}`);
      nextUrlIndex++;
      await downloadNextFile();
    }
  };
  await downloadNextFile();

  return files;
}


