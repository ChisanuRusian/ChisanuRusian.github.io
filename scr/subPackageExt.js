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
