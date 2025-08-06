export function isSubdomain(host) {
  return (host.replace('www.', '').match(/\./g) || []).length > 1;
}