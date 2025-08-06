export function removeProtocol(url) {
  if (!url) return url;
  return url.replace(/(^\w+:|^)\/\//, '');
}