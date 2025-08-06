import { usePlayerStore } from '@common/player/hooks/use-player-store';
export function useIsMediaCued(mediaId) {
  return usePlayerStore(s => s.cuedMedia?.id === mediaId);
}