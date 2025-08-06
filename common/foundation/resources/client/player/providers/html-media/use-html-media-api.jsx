import { useContext, useMemo } from 'react';
import { PlayerStoreContext } from '@common/player/player-context';
export function useHtmlMediaApi({
  ref,
  internalState,
  toggleTextTrackModes
}) {
  const store = useContext(PlayerStoreContext);
  return useMemo(() => ({
    play: async () => {
      try {
        await ref.current?.play();
      } catch (e) {
        store.getState().emit('error', {
          sourceEvent: e
        });
      }
      internalState.current.timeRafLoop.start();
    },
    pause: () => {
      ref.current?.pause();
      internalState.current.timeRafLoop.stop();
    },
    stop: () => {
      if (ref.current) {
        ref.current.pause();
        ref.current.currentTime = 0;
      }
    },
    seek: time => {
      if (time !== internalState.current.currentTime && ref.current) {
        ref.current.currentTime = time;
      }
    },
    setVolume: volume => {
      if (ref.current) {
        ref.current.volume = volume / 100;
      }
    },
    setMuted: muted => {
      if (ref.current) {
        ref.current.muted = muted;
      }
    },
    setPlaybackRate: value => {
      if (ref.current) {
        ref.current.playbackRate = value;
      }
    },
    setTextTrackVisibility: isVisible => {
      toggleTextTrackModes(store.getState().currentTextTrack, isVisible);
    },
    setCurrentTextTrack: newTrackId => {
      toggleTextTrackModes(newTrackId, store.getState().textTrackIsVisible);
    },
    getCurrentTime: () => {
      return internalState.current.currentTime;
    },
    getSrc: () => {
      return ref.current?.src;
    }
  }), [ref, store, internalState, toggleTextTrackModes]);
}