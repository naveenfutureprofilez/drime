import React, { useContext } from 'react';
import { driveState, useDriveStore } from '../../drive-store';
import { mergeProps } from '@react-aria/utils';
import { useFileViewDnd } from '../use-file-view-dnd';
import { useViewItemActionHandler } from '../use-view-item-action-handler';
import { BaseFileGridItem } from './base-file-grid-item';
import { EntryActionMenuTrigger } from '../../entry-actions/entry-action-menu-trigger';
import { IconButton } from '@ui/buttons/icon-button';
import { MoreVertIcon } from '@ui/icons/material/MoreVert';
import { Checkbox } from '@ui/forms/toggle/checkbox';
import { DashboardLayoutContext } from '@common/ui/dashboard-layout/dashboard-layout-context';
import { isCtrlOrShiftPressed } from '@ui/utils/keybinds/is-ctrl-or-shift-pressed';
import { usePointerEvents } from '@ui/interactions/use-pointer-events';
import { createEventHandler } from '@ui/utils/dom/create-event-handler';
export function FileGridItem({
  entry
}) {
  const isSelected = useDriveStore(s => s.selectedEntries.has(entry.id));
  const {
    performViewItemAction
  } = useViewItemActionHandler();
  const {
    isMobileMode
  } = useContext(DashboardLayoutContext);
  const {
    draggableProps,
    droppableProps,
    itemClassName,
    ref
  } = useFileViewDnd(entry);
  const toggleEntry = () => {
    if (isSelected) {
      driveState().deselectEntries([entry.id]);
    } else {
      driveState().selectEntries([entry.id], true);
    }
  };
  const pressHandler = (e, el) => {
    if (isMobileMode) {
      if (driveState().selectedEntries.size) {
        toggleEntry();
      } else {
        performViewItemAction(entry);
      }
    } else {
      if (isCtrlOrShiftPressed(e)) {
        toggleEntry();
      } else {
        driveState().selectEntries([entry.id]);
      }
    }
  };
  const {
    domProps: pressProps
  } = usePointerEvents({
    onLongPress: isMobileMode ? () => toggleEntry() : undefined,
    onPress: pressHandler
  });
  const keyboardHandler = e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      performViewItemAction(entry);
    }
  };
  const contextMenuHandler = e => {
    e.preventDefault();
    e.stopPropagation();
    if (!isMobileMode) {
      if (!driveState().selectedEntries.has(entry.id)) {
        driveState().selectEntries([entry.id]);
      }
      driveState().setContextMenuData({
        x: e.clientX,
        y: e.clientY
      });
    }
  };
  return <BaseFileGridItem {...mergeProps(draggableProps, droppableProps, pressProps, {
    onKeyDown: createEventHandler(keyboardHandler)
  })} ref={ref} entry={entry} isSelected={isSelected} isMobileMode={!!isMobileMode} tabIndex={-1} onDoubleClick={e => {
    e.preventDefault();
    e.stopPropagation();
    if (!isMobileMode) {
      performViewItemAction(entry);
    }
  }} footerAdornment={isMobileMode && <FooterAdornment entry={entry} isSelected={isSelected} />} onContextMenu={createEventHandler(contextMenuHandler)} className={itemClassName} />;
}
function FooterAdornment({
  entry,
  isSelected
}) {
  const anySelected = useDriveStore(s => s.selectedEntries.size);
  if (anySelected) {
    return <Checkbox className="mr-8 block" checked={isSelected} />;
  }
  return <EntryActionMenuTrigger entries={[entry]}>
      <IconButton className="text-muted" onPointerDown={e => {
      e.stopPropagation();
    }}>
        <MoreVertIcon />
      </IconButton>
    </EntryActionMenuTrigger>;
}