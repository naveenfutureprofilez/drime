export function extensionFromFilename(fullFileName) {
  const re = /(?:\.([^.]+))?$/;
  return re.exec(fullFileName)?.[1] || '';
}