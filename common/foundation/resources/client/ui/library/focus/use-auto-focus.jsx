import { useEffect, useRef } from 'react';
export function useAutoFocus({
  autoFocus,
  autoSelectText
}, ref) {
  const autoFocusRef = useRef(autoFocus);
  useEffect(() => {
    if (autoFocusRef.current && ref.current) {
      // run inside animation frame to prevent issues when opening
      // dialog with via keyboard shortcut and focusing input
      requestAnimationFrame(() => {
        ref.current?.focus();
        if (autoSelectText && ref.current?.nodeName.toLowerCase() === 'input') {
          ref.current.select();
        }
      });
    }
    autoFocusRef.current = false;
  }, [ref, autoSelectText]);
}