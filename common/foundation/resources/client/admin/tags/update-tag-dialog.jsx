import { Dialog } from '@ui/overlays/dialog/dialog';
import { DialogHeader } from '@ui/overlays/dialog/dialog-header';
import { Trans } from '@ui/i18n/trans';
import { DialogBody } from '@ui/overlays/dialog/dialog-body';
import { CrupdateTagForm } from './crupdate-tag-form';
import { DialogFooter } from '@ui/overlays/dialog/dialog-footer';
import { Button } from '@ui/buttons/button';
import { useDialogContext } from '@ui/overlays/dialog/dialog-context';
import { useForm } from 'react-hook-form';
import { useUpdateTag } from './requests/use-update-tag';
export function UpdateTagDialog({
  tag
}) {
  const {
    close,
    formId
  } = useDialogContext();
  const form = useForm({
    defaultValues: {
      id: tag.id,
      name: tag.name,
      display_name: tag.display_name,
      type: tag.type
    }
  });
  const updateTag = useUpdateTag(form);
  return <Dialog>
      <DialogHeader>
        <Trans message="Update “:name“ tag" values={{
        name: tag.name
      }} />
      </DialogHeader>
      <DialogBody>
        <CrupdateTagForm formId={formId} form={form} onSubmit={values => {
        updateTag.mutate(values, {
          onSuccess: () => {
            close();
          }
        });
      }} />
      </DialogBody>
      <DialogFooter>
        <Button onClick={() => {
        close();
      }}>
          <Trans message="Cancel" />
        </Button>
        <Button form={formId} disabled={updateTag.isPending} variant="flat" color="primary" type="submit">
          <Trans message="Save" />
        </Button>
      </DialogFooter>
    </Dialog>;
}