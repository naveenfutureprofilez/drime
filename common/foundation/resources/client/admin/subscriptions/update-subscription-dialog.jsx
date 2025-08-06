import { Dialog } from '@ui/overlays/dialog/dialog';
import { DialogHeader } from '@ui/overlays/dialog/dialog-header';
import { Trans } from '@ui/i18n/trans';
import { DialogBody } from '@ui/overlays/dialog/dialog-body';
import { DialogFooter } from '@ui/overlays/dialog/dialog-footer';
import { Button } from '@ui/buttons/button';
import { useDialogContext } from '@ui/overlays/dialog/dialog-context';
import { useForm } from 'react-hook-form';
import { useUpdateSubscription } from './requests/use-update-subscription';
import { CrupdateSubscriptionForm } from './crupdate-subscription-form';
export function UpdateSubscriptionDialog({
  subscription
}) {
  const {
    close,
    formId
  } = useDialogContext();
  const form = useForm({
    defaultValues: {
      id: subscription.id,
      product_id: subscription.product_id,
      price_id: subscription.price_id,
      description: subscription.description,
      renews_at: subscription.renews_at,
      ends_at: subscription.ends_at,
      user_id: subscription.user_id
    }
  });
  const updateSubscription = useUpdateSubscription(form);
  return <Dialog size="md">
      <DialogHeader>
        <Trans message="Update subscription" />
      </DialogHeader>
      <DialogBody>
        <CrupdateSubscriptionForm formId={formId} form={form} onSubmit={values => {
        updateSubscription.mutate(values, {
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
        <Button form={formId} disabled={updateSubscription.isPending} variant="flat" color="primary" type="submit">
          <Trans message="Save" />
        </Button>
      </DialogFooter>
    </Dialog>;
}