import { arrow, autoUpdate, flip, offset as offsetMiddleware, shift, size, useFloating } from '@floating-ui/react-dom';
import { useMemo, useRef } from 'react';
import { mergeRefs } from 'react-merge-refs';
export function useFloatingPosition({
  floatingWidth,
  ref,
  disablePositioning = false,
  placement = 'bottom',
  offset = 2,
  showArrow = false,
  maxHeight,
  shiftMainAxis = true,
  shiftCrossAxis = true,
  fallbackPlacements
}) {
  const arrowRef = useRef(null);
  const floatingConfig = {
    placement,
    strategy: 'fixed'
  };
  if (!disablePositioning) {
    floatingConfig.whileElementsMounted = autoUpdate;
    floatingConfig.middleware = [offsetMiddleware(offset), shift({
      padding: 16,
      crossAxis: shiftCrossAxis,
      mainAxis: shiftMainAxis
    }), flip({
      padding: 16,
      fallbackPlacements
    }), size({
      apply({
        rects,
        availableHeight,
        availableWidth,
        elements
      }) {
        if (floatingWidth === 'matchTrigger' && maxHeight != null) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
            maxWidth: `${availableWidth}`,
            maxHeight: `${Math.min(availableHeight, maxHeight)}px`
          });
        } else if (maxHeight != null) {
          Object.assign(elements.floating.style, {
            maxHeight: `${Math.min(availableHeight, maxHeight)}px`
          });
        }
      },
      padding: 16
    })];
    if (showArrow) {
      floatingConfig.middleware.push(arrow({
        element: arrowRef
      }));
    }
  }
  const floatingProps = useFloating(floatingConfig);
  const mergedReferenceRef = useMemo(() => mergeRefs([ref, floatingProps.refs.setReference]), [floatingProps.refs.setReference, ref]);
  const {
    x: arrowX,
    y: arrowY
  } = floatingProps.middlewareData.arrow || {};
  const staticSide = {
    top: 'bottom',
    right: 'left',
    bottom: 'top',
    left: 'right'
  }[floatingProps.placement.split('-')[0]];
  const arrowStyle = {
    left: arrowX,
    top: arrowY,
    right: '',
    bottom: '',
    [staticSide]: '-4px'
  };
  return {
    ...floatingProps,
    reference: mergedReferenceRef,
    arrowRef,
    arrowStyle
  };
}