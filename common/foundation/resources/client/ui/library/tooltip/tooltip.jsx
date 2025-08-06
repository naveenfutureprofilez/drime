import { cloneElement, forwardRef, Fragment, useCallback, useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import clsx from 'clsx';
import { createPortal } from 'react-dom';
import { mergeProps } from '@react-aria/utils';
import { useFloatingPosition } from '@ui/overlays/floating-position';
import { PopoverAnimation } from '@ui/overlays/popover-animation';
import { rootEl } from '@ui/root-el';
const TOOLTIP_COOLDOWN = 500;
const tooltips = {};
let globalWarmedUp = false;
let globalWarmUpTimeout = null;
let globalCooldownTimeout = null;
const closeOpenTooltips = tooltipId => {
  for (const hideTooltipId in tooltips) {
    if (hideTooltipId !== tooltipId) {
      tooltips[hideTooltipId]?.(true);
      delete tooltips[hideTooltipId];
    }
  }
};
export const Tooltip = forwardRef(({
  children,
  label,
  placement = 'top',
  offset = 10,
  variant = 'neutral',
  delay = 1500,
  isDisabled,
  usePortal = true,
  ...domProps
}, ref) => {
  const {
    x,
    y,
    reference,
    strategy,
    arrowRef,
    arrowStyle,
    refs
  } = useFloatingPosition({
    placement,
    offset,
    ref,
    showArrow: true
  });
  const [isOpen, setIsOpen] = useState(false);
  const tooltipId = useId();
  const closeTimeout = useRef();
  const showTooltip = () => {
    clearTimeout(closeTimeout.current);
    closeTimeout.current = undefined;
    closeOpenTooltips(tooltipId);
    tooltips[tooltipId] = hideTooltip;
    globalWarmedUp = true;
    setIsOpen(true);
    if (globalWarmUpTimeout) {
      clearTimeout(globalWarmUpTimeout);
      globalWarmUpTimeout = null;
    }
    if (globalCooldownTimeout) {
      clearTimeout(globalCooldownTimeout);
      globalCooldownTimeout = null;
    }
  };
  const hideTooltip = useCallback(immediate => {
    if (immediate) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = undefined;
      setIsOpen(false);
    } else if (!closeTimeout.current) {
      closeTimeout.current = setTimeout(() => {
        closeTimeout.current = undefined;
        setIsOpen(false);
      }, TOOLTIP_COOLDOWN);
    }
    if (globalWarmUpTimeout) {
      clearTimeout(globalWarmUpTimeout);
      globalWarmUpTimeout = null;
    }
    if (globalWarmedUp) {
      if (globalCooldownTimeout) {
        clearTimeout(globalCooldownTimeout);
      }
      globalCooldownTimeout = setTimeout(() => {
        delete tooltips[tooltipId];
        globalCooldownTimeout = null;
        globalWarmedUp = false;
      }, TOOLTIP_COOLDOWN);
    }
  }, [tooltipId]);
  const warmupTooltip = () => {
    closeOpenTooltips(tooltipId);
    tooltips[tooltipId] = hideTooltip;
    if (!isOpen && !globalWarmUpTimeout && !globalWarmedUp) {
      globalWarmUpTimeout = setTimeout(() => {
        globalWarmUpTimeout = null;
        globalWarmedUp = true;
        showTooltip();
      }, delay);
    } else if (!isOpen) {
      showTooltip();
    }
  };
  const showTooltipWithWarmup = immediate => {
    if (!immediate && delay > 0 && !closeTimeout.current) {
      warmupTooltip();
    } else {
      showTooltip();
    }
  };

  // close on unmount
  useEffect(() => {
    return () => {
      clearTimeout(closeTimeout.current);
      const tooltip = tooltips[tooltipId];
      if (tooltip) {
        delete tooltips[tooltipId];
      }
    };
  }, [tooltipId]);

  // close on "escape" key press
  useEffect(() => {
    const onKeyDown = e => {
      if (e.key === 'Escape') {
        hideTooltip(true);
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', onKeyDown, true);
      return () => {
        document.removeEventListener('keydown', onKeyDown, true);
      };
    }
  }, [isOpen, hideTooltip]);
  const tooltipContent = <AnimatePresence>
        {isOpen && <m.div {...PopoverAnimation} ref={refs.setFloating} id={tooltipId} role="tooltip" onPointerEnter={() => {
      showTooltipWithWarmup(true);
    }} onPointerLeave={() => {
      hideTooltip();
    }} className={clsx('z-tooltip my-4 max-w-240 break-words rounded px-8 py-4 text-xs text-white shadow', variant === 'positive' && 'bg-positive', variant === 'danger' && 'bg-danger', variant === 'neutral' && 'bg-toast')} style={{
      position: strategy,
      top: y ?? '',
      left: x ?? ''
    }}>
            <div ref={arrowRef} className="absolute h-8 w-8 rotate-45 bg-inherit" style={arrowStyle} />
            {label}
          </m.div>}
      </AnimatePresence>;
  return <Fragment>
        {cloneElement(children,
    // pass dom props down to child element, in case tooltip is wrapped in menu trigger
    mergeProps({
      'aria-describedby': isOpen ? tooltipId : undefined,
      ref: reference,
      onPointerEnter: e => {
        if (e.pointerType === 'mouse') {
          showTooltipWithWarmup();
        }
      },
      onFocus: e => {
        if (e.target.matches(':focus-visible')) {
          showTooltipWithWarmup(true);
        }
      },
      onPointerLeave: e => {
        if (e.pointerType === 'mouse') {
          hideTooltip();
        }
      },
      onPointerDown: () => {
        hideTooltip(true);
      },
      onBlur: () => {
        hideTooltip();
      },
      'aria-label': typeof label === 'string' ? label : label.props.message
    }, domProps))}
        {usePortal ? rootEl && createPortal(tooltipContent, rootEl) : tooltipContent}
      </Fragment>;
});