/**
 * Load image avoiding xhr/fetch CORS issues. Server status can't be obtained this way
 * unfortunately, so this uses "naturalWidth" to determine if the image has been loaded. By
 * default, it checks if it is at least 1px.
 */
export const loadImage = (src, minWidth = 1) => new Promise((resolve, reject) => {
  const image = new Image();
  const handler = () => {
    // @ts-expect-error
    delete image.onload;
    // @ts-expect-error
    delete image.onerror;
    if (image.naturalWidth >= minWidth) {
      resolve(image);
    } else {
      reject('Could not load youtube image');
    }
  };
  Object.assign(image, {
    onload: handler,
    onerror: handler,
    src
  });
});