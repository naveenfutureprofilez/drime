import { ConfirmationDialog } from '@ui/overlays/dialog/confirmation-dialog';
import { Trans } from '@ui/i18n/trans';
import { driveState } from '../../drive-store';
import { useRestoreEntries } from '../queries/use-restore-entries';
import { useDialogContext } from '@ui/overlays/dialog/dialog-context';
export function BlockTrashFolderViewDialog({
  entries
}) {
  const restoreEntries = useRestoreEntries();
  const {
    close
  } = useDialogContext();
  return <ConfirmationDialog title={<Trans message="This folder is in your trash" />} body={<Trans message="To view this folder, restore it from the trash." />} confirm={<Trans message="Restore" />} isLoading={restoreEntries.isPending} onConfirm={() => {
    restoreEntries.mutate({
      entryIds: entries.map(e => e.id)
    }, {
      onSuccess: () => {
        close();
        driveState().selectEntries([]);
      }
    });
  }} />;
}