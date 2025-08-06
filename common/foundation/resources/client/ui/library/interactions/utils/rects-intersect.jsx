export function rectsIntersect(rectA, rectB) {
  if (!rectA || !rectB) return false;
  return rectA.left <= rectB.left + rectB.width && rectA.left + rectA.width >= rectB.left && rectA.top <= rectB.top + rectB.height && rectA.top + rectA.height >= rectB.top;
}