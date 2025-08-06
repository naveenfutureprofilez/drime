import lazyLoader from '@ui/utils/loaders/lazy-loader';
export function loadGoogleFonts(fonts, id) {
  const googleFonts = fonts.filter(f => f.google);
  if (googleFonts?.length) {
    const families = fonts.map(f => `${f.family}:400`).join('|');
    lazyLoader.loadAsset(`https://fonts.googleapis.com/css?family=${families}&display=swap`, {
      type: 'css',
      id
    });
  }
}