import { getFromLocalStorage } from '@ui/utils/hooks/local-storage';
export function getPlayerStateFromLocalStorage(id, options) {
  const defaultVolume = options?.defaultVolume || 30;
  return {
    state: {
      muted: getFromLocalStorage(`player.${id}.muted`) ?? false,
      repeat: getFromLocalStorage(`player.${id}.repeat`) ?? 'all',
      shuffling: getFromLocalStorage(`player.${id}.shuffling`) ?? false,
      volume: getFromLocalStorage(`player.${id}.volume`) ?? defaultVolume
    },
    queue: getFromLocalStorage(`player.${id}.queue`, []),
    cuedMediaId: getFromLocalStorage(`player.${id}.cuedMediaId`)
  };
}