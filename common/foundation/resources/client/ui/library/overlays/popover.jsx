import React, { forwardRef, useCallback, useEffect, useRef } from 'react';
import { m } from 'framer-motion';
import { mergeProps, useObjectRef } from '@react-aria/utils';
import { FocusScope } from '@react-aria/focus';
import { useOverlayViewport } from '@ui/overlays/use-overlay-viewport';
import { PopoverAnimation } from '@ui/overlays/popover-animation';
export const Popover = forwardRef(({
  children,
  style,
  autoFocus = false,
  restoreFocus = true,
  isDismissable,
  isContextMenu,
  isOpen,
  onClose,
  triggerRef,
  arrowRef,
  arrowStyle,
  onPointerLeave,
  onPointerEnter
}, ref) => {
  const viewPortStyle = useOverlayViewport();
  const objRef = useObjectRef(ref);
  const {
    domProps
  } = useCloseOnInteractOutside({
    isDismissable,
    isOpen,
    onClose,
    triggerRef,
    isContextMenu
  }, objRef);
  return <m.div className="isolate z-popover" role="presentation" ref={objRef} style={{
    ...viewPortStyle,
    ...style,
    position: 'fixed'
  }} {...PopoverAnimation} {...mergeProps(domProps, {
    onPointerLeave,
    onPointerEnter
  })}>
        <FocusScope restoreFocus={restoreFocus} autoFocus={autoFocus} contain={false}>
          {children}
        </FocusScope>
      </m.div>;
});

// this should only be rendered when overlay is open
const visibleOverlays = [];
function useCloseOnInteractOutside({
  onClose,
  isDismissable = true,
  triggerRef,
  isContextMenu = false
}, ref) {
  const stateRef = useRef({
    isPointerDown: false,
    isContextMenu,
    onClose
  });
  const state = stateRef.current;
  state.isContextMenu = isContextMenu;
  state.onClose = onClose;
  const isValidEvent = useCallback(e => {
    // if (e.button > 0 && (!state.isContextMenu || e.button !== 2)) {
    //   return false;
    // }

    const target = e.target;

    // if the event target is no longer in the document
    if (target) {
      const ownerDocument = target.ownerDocument;
      if (!ownerDocument || !ownerDocument.documentElement.contains(target)) {
        return false;
      }
    }
    return ref.current && !ref.current.contains(target);
  }, [ref]);

  // Only hide the overlay when it is the topmost visible overlay in the stack.
  // For context menu, hide it regardless
  const isTopMostPopover = useCallback(() => {
    return visibleOverlays[visibleOverlays.length - 1] === ref;
  }, [ref]);
  const hideOverlay = useCallback(() => {
    if (isTopMostPopover()) {
      state.onClose();
    }
  }, [isTopMostPopover, state]);
  const clickedOnTriggerElement = useCallback(el => {
    if (triggerRef.current && 'contains' in triggerRef.current) {
      return triggerRef.current.contains?.(el);
    }
    return false;
  }, [triggerRef]);
  const onInteractOutsideStart = useCallback(e => {
    if (!clickedOnTriggerElement(e.target)) {
      if (isTopMostPopover()) {
        e.stopPropagation();
        e.preventDefault();
      }
    }
  }, [clickedOnTriggerElement, isTopMostPopover]);
  const onInteractOutside = useCallback(e => {
    if (!clickedOnTriggerElement(e.target)) {
      if (isTopMostPopover()) {
        e.stopPropagation();
        e.preventDefault();
      }
      // don't close context menu on right click, it will be done in "onInteractOutsideStart" already.
      // And it would prevent repositioning of context menu when right-clicking on the same element
      if (!state.isContextMenu || e.button !== 2) {
        hideOverlay();
      }
    }
  }, [clickedOnTriggerElement, hideOverlay, state, isTopMostPopover]);

  // Add popover ref to the stack of visible popovers on mount, and remove on unmount.
  useEffect(() => {
    visibleOverlays.push(ref);

    // handle pointer up and down events
    const onPointerDown = e => {
      if (isValidEvent(e)) {
        onInteractOutsideStart(e);
        stateRef.current.isPointerDown = true;
      }
    };
    const onPointerUp = e => {
      if (stateRef.current.isPointerDown && isValidEvent(e)) {
        stateRef.current.isPointerDown = false;
        onInteractOutside(e);
      }
    };

    // handle context menu event
    const onContextMenu = e => {
      e.preventDefault();
      if (isValidEvent(e)) {
        hideOverlay();
      }
    };

    // handle closing on scroll
    const onScroll = e => {
      if (!triggerRef.current) {
        return;
      }
      const scrollableRegion = e.target;
      let triggerEl;
      if (triggerRef.current instanceof Node) {
        triggerEl = triggerRef.current;
      } else if ('contextElement' in triggerRef.current) {
        triggerEl = triggerRef.current.contextElement;
      }
      // window is not a Node and doesn't have "contain", but window contains everything
      if (!(scrollableRegion instanceof Node) || !triggerEl || scrollableRegion.contains(triggerEl)) {
        state.onClose();
      }
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('pointerup', onPointerUp, true);
    document.addEventListener('contextmenu', onContextMenu, true);
    document.addEventListener('scroll', onScroll, true);
    return () => {
      const index = visibleOverlays.indexOf(ref);
      if (index >= 0) {
        visibleOverlays.splice(index, 1);
      }
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('pointerup', onPointerUp, true);
      document.removeEventListener('contextmenu', onContextMenu, true);
      document.removeEventListener('scroll', onScroll, true);
    };
  }, [ref, isValidEvent, state, onInteractOutside, onInteractOutsideStart, triggerRef, clickedOnTriggerElement, hideOverlay]);

  // Handle the escape key
  const onKeyDown = e => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      e.preventDefault();
      hideOverlay();
    }
  };
  return {
    domProps: {
      onKeyDown
    }
  };
}