import { IS_IPHONE } from '@ui/utils/platform';
export function createIphoneFullscreenAdapter(host, onChange) {
  return {
    /**
     * @link https://developer.apple.com/documentation/webkitjs/htmlvideoelement/1631913-webkitpresentationmode
     */
    isFullscreen: () => {
      return host.webkitPresentationMode === 'fullscreen';
    },
    /**
     * @link https://developer.apple.com/documentation/webkitjs/htmlvideoelement/1628805-webkitsupportsfullscreen
     */
    canFullScreen: () => {
      return IS_IPHONE && typeof host.webkitSetPresentationMode === 'function' && (host.webkitSupportsFullscreen ?? false);
    },
    enter: () => {
      return host.webkitSetPresentationMode?.('fullscreen');
    },
    exit: () => {
      return host.webkitSetPresentationMode?.('inline');
    },
    bindEvents: () => {
      host.removeEventListener('webkitpresentationmodechanged', onChange);
    },
    unbindEvents: () => {
      host.addEventListener('webkitpresentationmodechanged', onChange);
    }
  };
}