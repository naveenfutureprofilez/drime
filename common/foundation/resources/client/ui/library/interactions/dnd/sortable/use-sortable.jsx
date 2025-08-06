import { useDraggable } from '../use-draggable';
import { useDroppable } from '../use-droppable';
import { useEffect } from 'react';
import { getScrollParent, mergeProps } from '@react-aria/utils';
import { droppables } from '../drag-state';
import { sortableLineStrategy } from '@ui/interactions/dnd/sortable/sortable-line-strategy';
import { sortableTransformStrategy } from '@ui/interactions/dnd/sortable/sortable-transform-strategy';
import { sortableMoveNodeStrategy } from '@ui/interactions/dnd/sortable/sortable-move-node-strategy';
import { updateRects } from '@ui/interactions/dnd/update-rects';
let sortSession = null;
const strategies = {
  line: sortableLineStrategy,
  liveSort: sortableTransformStrategy,
  moveNode: sortableMoveNodeStrategy
};
export function useSortable({
  item,
  items,
  type,
  ref,
  onSortEnd,
  onSortStart,
  onDragEnd,
  preview,
  disabled,
  onDropPositionChange,
  strategy = 'liveSort'
}) {
  // todo: issue with sorting after scrolling menu editor item list

  // update sortables and active index, in case we lazy load more items while sorting
  useEffect(() => {
    if (sortSession && sortSession.sortables.length !== items.length) {
      sortSession.sortables = [...items];
      sortSession.activeIndex = items.indexOf(item);
    }
  }, [items, item]);
  const {
    draggableProps,
    dragHandleRef
  } = useDraggable({
    id: item,
    ref,
    type,
    preview,
    disabled,
    onDragStart: () => {
      sortSession = {
        sortables: [...items],
        activeSortable: item,
        activeIndex: items.indexOf(item),
        finalIndex: items.indexOf(item),
        dropPosition: null,
        ref,
        scrollParent: ref.current ? getScrollParent(ref.current) : undefined,
        scrollListener: () => {
          updateRects(droppables);
        }
      };
      strategies[strategy].onDragStart(sortSession);
      onSortStart?.();
      sortSession.scrollParent?.addEventListener('scroll', sortSession.scrollListener);
    },
    onDragEnd: () => {
      if (!sortSession) return;
      sortSession.dropPosition = null;
      onDropPositionChange?.(sortSession.dropPosition);
      if (sortSession.activeIndex !== sortSession.finalIndex) {
        onSortEnd?.(sortSession.activeIndex, sortSession.finalIndex);
      }
      sortSession.scrollParent?.removeEventListener('scroll', sortSession.scrollListener);
      strategies[strategy].onDragEnd(sortSession);
      // call "onDragEnd" after "onSortEnd", so listener has a chance to use sort session data
      onDragEnd?.();
      sortSession = null;
    },
    getData: () => {}
  });
  const {
    droppableProps
  } = useDroppable({
    id: item,
    ref,
    types: [type],
    disabled,
    allowDragEventsFromItself: true,
    onDragOver: (target, e) => {
      if (!sortSession) return;
      strategies[strategy].onDragOver({
        e,
        ref,
        item,
        sortSession,
        onDropPositionChange
      });
    },
    onDragEnter: () => {
      if (!sortSession) return;
      const overIndex = sortSession.sortables.indexOf(item);
      const oldIndex = sortSession.sortables.indexOf(sortSession.activeSortable);
      strategies[strategy].onDragEnter(sortSession, overIndex, oldIndex);
    },
    onDragLeave: () => {
      if (!sortSession) return;
      sortSession.dropPosition = null;
      onDropPositionChange?.(sortSession.dropPosition);
    }
  });
  return {
    sortableProps: {
      ...mergeProps(draggableProps, droppableProps)
    },
    dragHandleRef
  };
}