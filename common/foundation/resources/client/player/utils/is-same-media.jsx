export function isSameMedia(a, b) {
  if (!a || !b) return false;
  return a.id === b.id && a.groupId === b.groupId;
}