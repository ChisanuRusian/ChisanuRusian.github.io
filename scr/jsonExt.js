
async function minifyAllJson(paths) {
  const minifiedFiles = await Promise.all(paths.map(async ({ path, file }) => {
    const json = await (await fetch(file)).json();
    const [, ...folderParts] = path.split('/');
    const root = folderParts.pop();
    const fileName = path.split('/').pop();
    const minifiedJson = JSON.stringify(json);
    const minifiedFile = new File(
      [minifiedJson],
      [...folderParts, fileName].join('/'),
      { type: 'application/json' }
    );
    return minifiedFile;
  }));

  return minifiedFiles;
}
