import { interactableEvent } from './interactable-event';
import { usePointerEvents } from './use-pointer-events';
import { activeInteraction, setActiveInteraction } from './active-interaction';
import { calcNewSizeFromAspectRatio } from './utils/calc-new-size-from-aspect-ratio';
import { restrictResizableWithinBoundary } from './utils/restrict-resizable-within-boundary';
import { domRectToObj } from './utils/dom-rect-to-obj';
export let resizeHandlePosition = /*#__PURE__*/function (resizeHandlePosition) {
  resizeHandlePosition["topLeft"] = "topLeft";
  resizeHandlePosition["topRight"] = "topRight";
  resizeHandlePosition["bottomLeft"] = "bottomLeft";
  resizeHandlePosition["bottomRight"] = "bottomRight";
  return resizeHandlePosition;
}({});
let state = {};
const resetState = (value = {}) => {
  setActiveInteraction(null);
  state = value;
};
export function useResize({
  aspectRatio,
  boundaryRef,
  boundaryRect,
  restrictWithinBoundary = true,
  minWidth = 50,
  minHeight = 50,
  ...props
}) {
  const pointerProps = {
    onMoveStart: (e, resizable) => {
      const target = e.target;
      if (!target.dataset.resizeHandle || activeInteraction) {
        return false;
      }
      resetState({
        currentRect: domRectToObj(resizable.getBoundingClientRect()),
        resizeDir: target.dataset.resizeHandle
      });
      if (!state.currentRect) {
        return false;
      }
      setActiveInteraction('resize');
      if (boundaryRect) {
        state.boundaryRect = boundaryRect;
      } else if (boundaryRef?.current) {
        state.boundaryRect = domRectToObj(boundaryRef.current.getBoundingClientRect());
      }

      // if we have a boundary, x, y will be relative to that boundary, otherwise it will be relative to window
      if (state.currentRect && state.boundaryRect) {
        state.currentRect.left -= state.boundaryRect.left;
        state.currentRect.top -= state.boundaryRect.top;
      }
      state.initialAspectRatio = state.currentRect.width / state.currentRect.height;
      props.onResizeStart?.(interactableEvent({
        rect: state.currentRect,
        e
      }));
    },
    onMove: (e, deltaX, deltaY) => {
      if (!state.resizeDir || !state.currentRect) return;
      const ratio = aspectRatio === 'initial' ? state.initialAspectRatio : aspectRatio;
      const newRect = resizeRect(state.currentRect, deltaX, deltaY, ratio);
      const boundedRect = applyBounds(newRect, minWidth, minHeight, ratio);
      props.onResize?.(interactableEvent({
        rect: boundedRect,
        e,
        deltaX,
        deltaY
      }));
      state.currentRect = newRect;
    },
    onMoveEnd: e => {
      if (state.currentRect) {
        props.onResizeEnd?.(interactableEvent({
          rect: state.currentRect,
          e
        }));
      }
      resetState();
    }
  };
  const {
    domProps
  } = usePointerEvents(pointerProps);
  return {
    resizeProps: domProps
  };
}
function resizeRect(rect, deltaX, deltaY, ratio) {
  const prevRect = {
    ...rect
  };
  const newRect = {
    ...rect
  };
  if (state.resizeDir === resizeHandlePosition.topRight) {
    newRect.width = Math.floor(newRect.width + deltaX);
    if (ratio) {
      newRect.height = Math.floor(newRect.width / ratio);
    } else {
      newRect.height = Math.floor(newRect.height - deltaY);
    }
    newRect.top = Math.floor(newRect.top + (prevRect.height - newRect.height));
  } else if (state.resizeDir === resizeHandlePosition.bottomRight) {
    newRect.width = Math.floor(newRect.width + deltaX);
    if (ratio) {
      newRect.height = Math.floor(newRect.width / ratio);
    } else {
      newRect.height = Math.floor(newRect.height + deltaY);
    }
  } else if (state.resizeDir === resizeHandlePosition.topLeft) {
    newRect.width = Math.floor(newRect.width - deltaX);
    if (ratio) {
      newRect.height = Math.floor(newRect.width / ratio);
    } else {
      newRect.height = Math.floor(newRect.height - deltaY);
    }
    newRect.left = Math.floor(newRect.left + (prevRect.width - newRect.width));
    newRect.top = Math.floor(newRect.top + (prevRect.height - newRect.height));
  } else if (state.resizeDir === resizeHandlePosition.bottomLeft) {
    newRect.width = Math.floor(newRect.width - deltaX);
    if (ratio) {
      newRect.height = Math.floor(newRect.width / ratio);
    } else {
      newRect.height = Math.floor(newRect.height + deltaY);
    }
    newRect.left = Math.floor(newRect.left + deltaX);
  }
  return newRect;
}
function applyBounds(rect, minWidth, minHeight, ratio) {
  const isLeftSideHandle = state.resizeDir === resizeHandlePosition.bottomLeft || state.resizeDir === resizeHandlePosition.topLeft;
  const isTopSideHandle = state.resizeDir === resizeHandlePosition.topRight || state.resizeDir === resizeHandlePosition.topLeft;

  // bound width and height
  let boundedRect = {
    ...rect
  };
  boundedRect.width = Math.max(minWidth, rect.width);
  boundedRect.height = Math.max(minHeight, rect.height);

  // compensate left when width is bounded
  const widthRestriction = boundedRect.width - rect.width;
  if (isLeftSideHandle && widthRestriction > 0) {
    boundedRect.left -= widthRestriction;
  }

  // compensate top when height is bounded
  const heightRestriction = boundedRect.height - rect.height;
  if (isTopSideHandle && heightRestriction > 0) {
    boundedRect.top -= heightRestriction;
  }
  if (state.boundaryRect) {
    boundedRect = restrictResizableWithinBoundary(boundedRect, state.boundaryRect);
  }
  if (ratio) {
    // adjust width/height based on specified aspect ratio
    const oldWidth = boundedRect.width;
    const oldHeight = boundedRect.height;
    const size = calcNewSizeFromAspectRatio(ratio, boundedRect.width, boundedRect.height);
    boundedRect.width = size.width;
    boundedRect.height = size.height;

    // compensate top/left that was bound previously
    if (isTopSideHandle) {
      boundedRect.top += oldHeight - boundedRect.height;
    }
    if (isLeftSideHandle) {
      boundedRect.left += oldWidth - boundedRect.width;
    }
  }
  return boundedRect;
}