import { createElement, Fragment, useState } from 'react';
import { useShareAction } from '@app/drive/entry-actions/use-entry-actions';
import { Button } from '@ui/buttons/button';
import { Trans } from '@ui/i18n/trans';
import { IconButton } from '@ui/buttons/icon-button';
import { useEntries } from '@app/drive/files/queries/use-entries';
import { FilePreviewDialog } from '@common/uploads/components/file-preview/file-preview-dialog';
export function EntryPreviewDialog({
  selectedEntry
}) {
  const files = useEntries().filter(entry => entry.type !== 'folder');
  const defaultActiveIndex = files.findIndex(file => file.id === selectedEntry?.id);
  const [activeIndex, setActiveIndex] = useState(defaultActiveIndex);
  return <FilePreviewDialog allowDownload={selectedEntry.permissions['files.download']} headerActionsLeft={<DriveActions activeIndex={activeIndex} entries={files} />} activeIndex={activeIndex} onActiveIndexChange={setActiveIndex} entries={files} />;
}
function DriveActions({
  activeIndex,
  entries
}) {
  const selectedEntry = entries[activeIndex];
  const share = useShareAction([selectedEntry]);
  if (!selectedEntry || !share) return null;
  return <Fragment>
      <IconButton className="md:hidden" onClick={() => {
      share.execute();
    }}>
        {createElement(share.icon)}
      </IconButton>
      <Button className="max-md:hidden" variant="text" startIcon={createElement(share.icon)} onClick={() => {
      share.execute();
    }}>
        <Trans {...share.label} />
      </Button>
    </Fragment>;
}