import React, { createElement } from 'react';
import { Trans } from '@ui/i18n/trans';
import { useEntryActions } from './use-entry-actions';
import { RootFolderPage, TrashPage } from '../drive-page/drive-page';
import { useDrivePageActions } from './use-drive-page-actions';
import { Menu, MenuItem, MenuTrigger } from '@ui/menu/menu-trigger';
export function EntryActionMenuTrigger({
  children,
  entries,
  page,
  showIfNoActions
}) {
  if (page?.name === RootFolderPage.name) {
    return <PageMenu page={RootFolderPage} showIfNoActions={showIfNoActions}>
        {children}
      </PageMenu>;
  }
  if (page === TrashPage) {
    return <PageMenu page={TrashPage} showIfNoActions={showIfNoActions}>
        {children}
      </PageMenu>;
  }
  if (page?.folder) {
    return <EntriesMenu entries={[page.folder]} showIfNoActions={showIfNoActions}>
        {children}
      </EntriesMenu>;
  }
  if (entries?.length) {
    return <EntriesMenu entries={entries} showIfNoActions={showIfNoActions}>
        {children}
      </EntriesMenu>;
  }
  return null;
}
function EntriesMenu({
  entries,
  children,
  showIfNoActions
}) {
  const actions = useEntryActions(entries);
  return <BaseMenu actions={actions} showIfNoActions={showIfNoActions}>
      {children}
    </BaseMenu>;
}
function PageMenu({
  page,
  children,
  showIfNoActions
}) {
  const actions = useDrivePageActions(page);
  return <BaseMenu actions={actions} showIfNoActions={showIfNoActions}>
      {children}
    </BaseMenu>;
}
function BaseMenu({
  actions,
  children,
  showIfNoActions
}) {
  if (!actions.length && !showIfNoActions) {
    return null;
  }
  return <MenuTrigger>
      {children}
      <Menu>
        {actions.map(action => {
        return <MenuItem onSelected={() => {
          action.execute();
        }} key={action.key} value={action.key} startIcon={createElement(action.icon)}>
              <Trans {...action.label} />
            </MenuItem>;
      })}
      </Menu>
    </MenuTrigger>;
}