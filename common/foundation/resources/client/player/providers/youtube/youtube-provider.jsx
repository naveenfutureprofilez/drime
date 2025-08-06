import { useGlobalListeners } from '@react-aria/utils';
import { useCallback, useContext, useEffect, useRef } from 'react';
import { PlayerStoreContext } from '@common/player/player-context';
import { YoutubeCommand } from '@common/player/providers/youtube/youtube-types';
import { handleYoutubeEmbedMessage } from '@common/player/providers/youtube/handle-youtube-embed-message';
import { useYoutubeProviderSrc } from '@common/player/providers/youtube/use-youtube-provider-src';
export function YoutubeProvider() {
  const {
    addGlobalListener,
    removeAllGlobalListeners
  } = useGlobalListeners();
  const iframeRef = useRef(null);
  const youtubeApi = useCallback((command, arg) => iframeRef.current?.contentWindow?.postMessage(JSON.stringify({
    event: 'command',
    func: command,
    args: arg ? [arg] : undefined
  }), '*'), []);
  const loadVideoById = useCallback(videoId => {
    // using "YoutubeCommand.Cue" does not play video when changing sources,
    // it requires double click on play button without this
    youtubeApi(YoutubeCommand.CueAndPlay, videoId);
  }, [youtubeApi]);
  const {
    initialVideoUrl,
    origin
  } = useYoutubeProviderSrc(loadVideoById);
  const store = useContext(PlayerStoreContext);
  const internalStateRef = useRef({
    duration: 0,
    currentTime: 0,
    lastTimeUpdate: 0,
    playbackRate: 1,
    state: -1,
    playbackReady: false,
    buffered: 0,
    firedPlaybackEnd: false
  });
  const registerApi = useCallback(() => {
    const internalProviderApi = {
      loadVideoById
    };
    store.setState({
      providerApi: {
        play: () => {
          youtubeApi(YoutubeCommand.Play);
        },
        pause: () => {
          youtubeApi(YoutubeCommand.Pause);
        },
        stop: () => {
          youtubeApi(YoutubeCommand.Stop);
        },
        seek: time => {
          if (time !== internalStateRef.current.currentTime) {
            youtubeApi(YoutubeCommand.Seek, time);
          }
        },
        setVolume: volume => {
          youtubeApi(YoutubeCommand.SetVolume, volume);
        },
        setMuted: muted => {
          if (muted) {
            youtubeApi(YoutubeCommand.Mute);
          } else {
            youtubeApi(YoutubeCommand.Unmute);
          }
        },
        setPlaybackRate: value => {
          youtubeApi(YoutubeCommand.SetPlaybackRate, value);
        },
        setPlaybackQuality: value => {
          youtubeApi(YoutubeCommand.SetPlaybackQuality, value);
        },
        getCurrentTime: () => {
          return internalStateRef.current.currentTime;
        },
        getSrc: () => {
          return internalStateRef.current.videoId;
        },
        internalProviderApi
      }
    });
  }, [store, loadVideoById, youtubeApi]);
  useEffect(() => {
    addGlobalListener(window, 'message', event => {
      const e = event;
      if (e.origin === origin && e.source === iframeRef.current?.contentWindow) {
        handleYoutubeEmbedMessage(e, internalStateRef, iframeRef, store);
      }
    });
    registerApi();
    return () => {
      removeAllGlobalListeners();
    };
  }, [addGlobalListener, removeAllGlobalListeners, store, origin, registerApi]);
  if (!initialVideoUrl) {
    return null;
  }
  return <iframe className="w-full h-full" ref={iframeRef} src={initialVideoUrl} allowFullScreen allow="autoplay; encrypted-media; picture-in-picture;" onLoad={() => {
    // window does not receive "message" events on safari without waiting a small amount of time for some reason
    setTimeout(() => {
      iframeRef.current?.contentWindow?.postMessage(JSON.stringify({
        event: 'listening'
      }), '*');
      registerApi();
    });
  }} />;
}