import { useCallback } from 'react';
import { getPathForFolder, TrashPage } from '../drive-page/drive-page';
import { driveState } from '../drive-store';
import { getSelectedEntries } from '../files/use-selected-entries';
import { useNavigate } from '@common/ui/navigation/use-navigate';
export function useViewItemActionHandler() {
  const navigate = useNavigate();
  const performViewItemAction = useCallback(entry => {
    if (entry && entry.type === 'folder') {
      if (driveState().activePage === TrashPage) {
        driveState().setActiveActionDialog('trashFolderBlock', [entry]);
      } else {
        navigate(getPathForFolder(entry.hash));
      }
    } else {
      const selectedEntries = getSelectedEntries();
      driveState().setActiveActionDialog('preview', selectedEntries.length ? selectedEntries : [entry]);
    }
  }, [navigate]);
  return {
    performViewItemAction
  };
}