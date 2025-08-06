export function isAnyInputFocused(doc) {
  if (!doc) {
    doc = document;
  }
  return doc.activeElement ? ['INPUT', 'TEXTAREA'].includes(doc.activeElement.tagName) || doc.activeElement.isContentEditable : false;
}