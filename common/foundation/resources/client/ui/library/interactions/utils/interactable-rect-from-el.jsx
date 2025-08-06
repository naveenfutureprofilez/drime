export function interactableRectFromEl(el) {
  const translateStr = el.style.transform.match(/translate\((.+?)\)/)?.[1];
  const translateValues = (translateStr || '').split(',');
  const top = translateValues[1] || '0';
  const left = translateValues[0] || '0';
  const rect = {
    width: el.offsetWidth,
    height: el.offsetHeight,
    left: parseInt(left),
    top: parseInt(top),
    angle: 0
  };
  const initialAspectRatio = rect.width / rect.height;
  return {
    rect,
    initialAspectRatio
  };
}