export function isAbsoluteUrl(url) {
  if (!url) return false;
  return /^[a-zA-Z][a-zA-Z\d+\-.]*?:/.test(url);
}