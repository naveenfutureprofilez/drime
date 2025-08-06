import { usePlayerStore } from '@common/player/hooks/use-player-store';
export function useIsMediaPlaying(mediaId, groupId) {
  return usePlayerStore(s => {
    return s.isPlaying && s.cuedMedia?.id === mediaId && (!groupId || groupId === s.cuedMedia.groupId);
  });
}