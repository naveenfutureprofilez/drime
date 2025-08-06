import { useLayoutEffect, useRef } from 'react';
import { droppables } from '../drag-state';
export const mouseSelectables = new Map();
export function useMouseSelectable(options) {
  const {
    id,
    ref
  } = options;
  const optionsRef = useRef(options);
  optionsRef.current = options;
  useLayoutEffect(() => {
    if (!ref.current) return;
    // register droppable regardless if it's enabled or not, it might be used by mouse selection box
    mouseSelectables.set(id, {
      ...mouseSelectables.get(id),
      id,
      ref,
      // avoid stale closures
      onSelected: () => {
        optionsRef.current.onSelected?.();
      },
      onDeselected: () => optionsRef.current.onDeselected?.()
    });
    return () => {
      droppables.delete(id);
    };
  }, [id, optionsRef, ref]);
}