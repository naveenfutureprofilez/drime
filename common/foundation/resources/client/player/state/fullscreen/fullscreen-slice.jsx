import { ScreenOrientation } from '@common/player/state/fullscreen/screen-orientation';
import { IS_IPHONE } from '@ui/utils/platform';
import { createNativeFullscreenAdapter } from '@common/player/state/fullscreen/create-native-fullscreen-adapter';
import { createIphoneFullscreenAdapter } from '@common/player/state/fullscreen/create-iphone-fullscreen-adapter';
const iPhoneProviderBlacklist = ['youtube'];
export const createFullscreenSlice = (set, get) => {
  let subscription;
  const orientation = new ScreenOrientation();
  let adapter;
  const onFullscreenChange = async () => {
    const isFullscreen = adapter?.isFullscreen();
    if (isFullscreen) {
      // lock orientation to landscape
      orientation.lock();
    } else {
      orientation.unlock();
    }
    set({
      isFullscreen
    });
  };
  const isSupported = () => {
    // iPhone only allows putting video element in fullscreen, and
    // there's no way to get access to it with YouTube iframe api
    if (IS_IPHONE && iPhoneProviderBlacklist.includes(get().providerName)) {
      return false;
    }
    return adapter?.canFullScreen() ?? false;
  };
  return {
    isFullscreen: false,
    canFullscreen: false,
    enterFullscreen: () => {
      if (!isSupported() || adapter?.isFullscreen()) return;

      // exit pip if it's active
      if (get().isPip) {
        get().exitPip();
      }
      return adapter?.enter();
    },
    exitFullscreen: () => {
      if (!adapter?.isFullscreen()) return;
      return adapter.exit();
    },
    toggleFullscreen: () => {
      if (get().isFullscreen) {
        get().exitFullscreen();
      } else {
        get().enterFullscreen();
      }
    },
    initFullscreen: () => {
      subscription = get().subscribe({
        providerReady: ({
          el
        }) => {
          // when changing adapters, remove previous adapter events and exit fullscreen
          adapter?.unbindEvents();
          if (get().isFullscreen) {
            adapter?.exit();
          }
          // create new adapter, and if fullscreen is supported, bind events
          adapter = IS_IPHONE ? createIphoneFullscreenAdapter(el, onFullscreenChange) : createNativeFullscreenAdapter(el, onFullscreenChange);
          const canFullscreen = isSupported();
          set({
            canFullscreen
          });
          if (canFullscreen) {
            adapter.bindEvents();
          }
        }
      });
    },
    destroyFullscreen: () => {
      get().exitFullscreen();
      subscription?.();
    }
  };
};