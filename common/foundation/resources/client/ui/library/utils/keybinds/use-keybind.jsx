import { useGlobalListeners } from '@react-aria/utils';
import { useCallbackRef } from '@ui/utils/hooks/use-callback-ref';
import { useEffect } from 'react';
import { isCtrlKeyPressed } from '@ui/utils/keybinds/is-ctrl-key-pressed';
import { isAnyInputFocused } from '@ui/utils/dom/is-any-input-focused';
export function useKeybind(el, shortcut, userCallback, {
  allowedInputSelector
} = {}) {
  const {
    addGlobalListener,
    removeAllGlobalListeners
  } = useGlobalListeners();
  const callback = useCallbackRef(userCallback);
  useEffect(() => {
    const target = el === 'window' ? window : el;
    addGlobalListener(target, 'keydown', e => {
      if (!shouldIgnoreActiveEl(allowedInputSelector) && isAnyInputFocused()) {
        return;
      }
      const matches = shortcut.split('+').every(key => {
        if (key === 'ctrl') {
          return isCtrlKeyPressed(e);
        } else {
          return e.key === key;
        }
      });
      if (matches) {
        e.preventDefault();
        e.stopPropagation();
        callback(e);
      }
    });
    return removeAllGlobalListeners;
  }, [addGlobalListener, shortcut, removeAllGlobalListeners, callback, el, allowedInputSelector]);
}
function shouldIgnoreActiveEl(selector) {
  if (!selector || !document.activeElement) {
    return false;
  }
  return document.activeElement.closest(selector);
}