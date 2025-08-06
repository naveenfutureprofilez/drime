import { useDroppable } from '@ui/interactions/dnd/use-droppable';
import { driveState } from '../../drive-store';
import { useState } from 'react';
import { folderAcceptsDrop, useFolderDropAction } from '../../files/use-folder-drop-action';
import { makeFolderTreeDragId } from './folder-tree-drag-id';
export function useSidebarTreeDropTarget({
  folder,
  ref
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const {
    onDrop
  } = useFolderDropAction(folder);
  const dropProps = useDroppable({
    id: makeFolderTreeDragId(folder),
    ref,
    types: ['fileEntry', 'nativeFile'],
    acceptsDrop: draggable => folderAcceptsDrop(draggable, folder),
    onDragEnter: draggable => {
      if (folderAcceptsDrop(draggable, folder)) {
        setIsDragOver(true);
      }
    },
    onDragLeave: () => {
      setIsDragOver(false);
    },
    onDropActivate: () => {
      if (!driveState().sidebarExpandedKeys.includes(folder.id)) {
        driveState().setSidebarExpandedKeys([...driveState().sidebarExpandedKeys, folder.id]);
      }
    },
    onDrop
  });
  return {
    ...dropProps,
    isDragOver
  };
}