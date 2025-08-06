export function makeFolderTreeDragId(entry) {
  return `${entry.id}-tree`;
}
export function isFolderTreeDragId(id) {
  return `${id}`.endsWith('-tree');
}