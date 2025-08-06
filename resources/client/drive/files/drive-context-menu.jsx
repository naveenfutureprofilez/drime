import { useSelectedEntries } from './use-selected-entries';
import { useEntryActions } from '../entry-actions/use-entry-actions';
import { driveState, useDriveStore } from '../drive-store';
import { ContextMenu } from '@ui/menu/context-menu';
import { MenuItem } from '@ui/menu/menu-trigger';
import React, { createElement } from 'react';
import { Trans } from '@ui/i18n/trans';
import { RootFolderPage } from '../drive-page/drive-page';
import { useDrivePageActions } from '../entry-actions/use-drive-page-actions';
export function DriveContextMenu() {
  const selectedEntries = useSelectedEntries();
  const activePage = useDriveStore(s => s.activePage);
  const data = useDriveStore(s => s.contextMenuData);
  const entries = data?.entry ? [data.entry] : selectedEntries;

  // right-clicked root folder
  if (data?.entry?.id === 0) {
    return <PageContextMenu position={data} page={RootFolderPage} />;
  }
  if (data && entries.length) {
    return <EntriesContextMenu entries={entries} position={data} />;
  }
  if (data && activePage) {
    return <PageContextMenu position={data} page={activePage} />;
  }
  return null;
}
function EntriesContextMenu({
  entries,
  position
}) {
  const actions = useEntryActions(entries);
  return <BaseContextMenu position={position} actions={actions} />;
}
function PageContextMenu({
  page,
  position
}) {
  const actions = useDrivePageActions(page);
  return <BaseContextMenu position={position} actions={actions} />;
}
function BaseContextMenu({
  position,
  actions
}) {
  return <ContextMenu position={position} onOpenChange={isOpen => {
    if (!isOpen) {
      driveState().setContextMenuData(null);
    }
  }}>
      {actions.map(action => <MenuItem value={action.key} key={action.key} onSelected={action.execute} startIcon={createElement(action.icon)}>
          <Trans {...action.label} />
        </MenuItem>)}
    </ContextMenu>;
}