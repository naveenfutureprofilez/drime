import React, { Children, cloneElement, Fragment, useCallback, useId, useMemo, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useControlledState } from '@react-stately/utils';
import { mergeProps, useLayoutEffect } from '@react-aria/utils';
import { useFloatingPosition } from '../floating-position';
import { useIsMobileMediaQuery } from '@ui/utils/hooks/is-mobile-media-query';
import { DialogContext } from './dialog-context';
import { Popover } from '../popover';
import { Tray } from '../tray';
import { Modal } from '../modal';
import { createPortal } from 'react-dom';
import { createEventHandler } from '@ui/utils/dom/create-event-handler';
import { rootEl } from '@ui/root-el';
import { pointToVirtualElement } from '@ui/menu/context-menu';
import { useCallbackRef } from '@ui/utils/hooks/use-callback-ref';
export function DialogTrigger(props) {
  let {
    children,
    type,
    disableInitialTransition,
    isDismissable = true,
    moveFocusToDialog = true,
    returnFocusToTrigger = true,
    triggerOnHover = false,
    triggerOnContextMenu = false,
    handleTriggerClick = true,
    usePortal = true,
    mobileType,
    alwaysReturnCurrentValueOnClose
  } = props;

  // for context menu we will set triggerRef to VirtualElement in "onContextMenu" event.
  // If dialog is not triggered on context menu, leave triggerRef null (unless it's passed in via props)
  // otherwise it will prevent dialog from opening in "popover" mode.
  const contextMenuTriggerRef = useRef(null);
  const triggerRef = triggerOnContextMenu && !props.triggerRef ? contextMenuTriggerRef : props.triggerRef;
  // initial value can be used to restore state to what it
  // was before opening the dialog, for example in color picker
  const initialValueRef = useRef(props.value);
  const [isOpen, setIsOpen] = useControlledState(props.isOpen, props.defaultIsOpen, props.onOpenChange);
  const [value, setValue] = useControlledState(props.value, props.defaultValue, props.onValueChange);

  // On small devices, show a modal or tray instead of a popover.
  const isMobile = useIsMobileMediaQuery();
  if (isMobile && type === 'popover') {
    type = mobileType || 'modal';
  }
  const hoverTimeoutRef = useRef(null);
  const {
    x,
    y,
    reference,
    strategy,
    refs
  } = useFloatingPosition({
    ...props,
    disablePositioning: type === 'modal'
  });
  const floatingStyle = type === 'popover' ? {
    position: strategy,
    top: y ?? '',
    left: x ?? ''
  } : {};
  const id = useId();
  const labelId = `${id}-label`;
  const descriptionId = `${id}-description`;
  const formId = `${id}-form`;
  const onClose = useCallbackRef(props.onClose);
  const close = useCallback(closeValue => {
    if (typeof closeValue === 'undefined' && alwaysReturnCurrentValueOnClose) {
      closeValue = value;
    }
    // if value is not provided (dialog cancel button or clicking outside of dialog), use initial value
    const finalValue = typeof closeValue !== 'undefined' ? closeValue : initialValueRef.current;
    onClose?.(finalValue, {
      initialValue: initialValueRef.current,
      valueChanged: finalValue !== initialValueRef.current
    });
    setIsOpen(false);
  }, [onClose, setIsOpen, value, alwaysReturnCurrentValueOnClose]);
  const open = useCallback(() => {
    setIsOpen(true);
    // set current value that is active at the time of opening dialog
    initialValueRef.current = props.value;
  }, [props.value, setIsOpen]);

  // position dropdown relative to provided ref, not the trigger
  useLayoutEffect(() => {
    if (triggerRef?.current && refs.reference.current !== triggerRef.current) {
      reference(triggerRef.current);
    }
  }, [reference, triggerRef?.current, refs]);
  const dialogProps = useMemo(() => {
    return {
      'aria-labelledby': labelId,
      'aria-describedby': descriptionId
    };
  }, [labelId, descriptionId]);
  let Overlay;
  if (type === 'modal') {
    Overlay = Modal;
  } else if (type === 'tray') {
    Overlay = Tray;
  } else {
    Overlay = Popover;
  }
  const contextValue = useMemo(() => {
    return {
      dialogProps,
      type,
      labelId,
      descriptionId,
      isDismissable,
      close,
      value,
      initialValue: initialValueRef.current,
      setValue,
      formId
    };
  }, [close, descriptionId, dialogProps, formId, labelId, type, isDismissable, value, setValue]);
  triggerOnHover = triggerOnHover && type === 'popover';
  const handleTriggerHover = {
    onPointerEnter: createEventHandler(e => {
      open();
    }),
    onPointerLeave: createEventHandler(e => {
      hoverTimeoutRef.current = setTimeout(() => {
        close();
      }, 150);
    })
  };
  const handleFloatingHover = {
    onPointerEnter: createEventHandler(e => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    }),
    onPointerLeave: createEventHandler(e => {
      close();
    })
  };
  const handleTriggerContextMenu = {
    onContextMenu: createEventHandler(e => {
      e.preventDefault();
      contextMenuTriggerRef.current = pointToVirtualElement({
        x: e.clientX,
        y: e.clientY
      }, e.currentTarget);
      open();
    })
  };
  const triggerClickHandler = {
    onClick: createEventHandler(e => {
      // prevent propagating to parent, in case floating element
      // is attached to input field and button is inside the field
      e.stopPropagation();
      if (isOpen) {
        close();
      } else {
        open();
      }
    })
  };
  const {
    dialogTrigger,
    dialog
  } = extractChildren(children, contextValue);
  const dialogContent = <AnimatePresence initial={!disableInitialTransition}>
      {isOpen && <DialogContext.Provider value={contextValue}>
          <Overlay {...triggerOnHover ? handleFloatingHover : {}} ref={refs.setFloating} triggerRef={refs.reference} style={floatingStyle} restoreFocus={returnFocusToTrigger} autoFocus={moveFocusToDialog} isOpen={isOpen} onClose={close} isDismissable={isDismissable} isContextMenu={triggerOnContextMenu} placement={props.placement}>
            {dialog}
          </Overlay>
        </DialogContext.Provider>}
    </AnimatePresence>;
  return <Fragment>
      {dialogTrigger && cloneElement(dialogTrigger, mergeProps({
      // make sure ref specified on trigger element is not overwritten
      ...(!triggerRef && !triggerOnContextMenu ? {
        ref: reference
      } : {}),
      ...(!triggerOnContextMenu && handleTriggerClick ? triggerClickHandler : {}),
      ...(triggerOnHover ? handleTriggerHover : {}),
      ...(triggerOnContextMenu ? handleTriggerContextMenu : {})
    }, {
      ...dialogTrigger.props
    }))}
      {usePortal ? rootEl && createPortal(dialogContent, rootEl) : dialogContent}
    </Fragment>;
}
function extractChildren(rawChildren, ctx) {
  const children = Array.isArray(rawChildren) ? rawChildren : Children.toArray(rawChildren);
  let dialog = children.length === 2 ? children[1] : children[0];
  dialog = typeof dialog === 'function' ? dialog(ctx) : dialog;

  // trigger and dialog passed as children
  if (children.length === 2) {
    return {
      dialogTrigger: children[0],
      dialog: dialog
    };
  }

  // only dialog passed as child
  return {
    dialog: dialog
  };
}