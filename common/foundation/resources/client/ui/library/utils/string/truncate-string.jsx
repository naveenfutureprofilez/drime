export function truncateString(str, length, end = '...') {
  if (length == null || length >= str.length) {
    return str;
  }
  return str.slice(0, Math.max(0, length - end.length)) + end;
}