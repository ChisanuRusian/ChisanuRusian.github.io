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

