export function initPlayerMediaSession(state, options) {
  if ('mediaSession' in navigator) {
    const actionHandlers = {
      play: () => state().play(),
      pause: () => state().pause(),
      previoustrack: () => state().playPrevious(),
      nexttrack: () => state().playNext(),
      stop: () => state().stop(),
      seekbackward: () => state().seek(state().getCurrentTime() - 10),
      seekforward: () => state().seek(state().getCurrentTime() + 10),
      seekto: details => state().seek(details.seekTime || 0)
    };
    for (const key in actionHandlers) {
      try {
        navigator.mediaSession.setActionHandler(key, actionHandlers[key]);
      } catch (error) {}
    }
    const cuedMedia = state().cuedMedia;
    if (cuedMedia) {
      options.setMediaSessionMetadata?.(cuedMedia);
    }
  }
}