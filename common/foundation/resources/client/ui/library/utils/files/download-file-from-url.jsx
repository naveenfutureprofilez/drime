export function downloadFileFromUrl(url, name) {
  const link = document.createElement('a');
  link.href = url;
  if (name) link.download = name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}