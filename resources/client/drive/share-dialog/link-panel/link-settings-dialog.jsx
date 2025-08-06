import { useForm } from 'react-hook-form';
import { Fragment, useState } from 'react';
import clsx from 'clsx';
import { m } from 'framer-motion';
import { getLocalTimeZone, now } from '@internationalized/date';
import { Button } from '@ui/buttons/button';
import { FormTextField } from '@ui/forms/input-field/text-field/text-field';
import { DialogFooter } from '@ui/overlays/dialog/dialog-footer';
import { useEntryShareableLink } from '@app/drive/shareable-link/queries/use-entry-shareable-link';
import { Form } from '@ui/forms/form';
import { useUpdateShareableLink } from '@app/drive/shareable-link/queries/use-update-shareable-link';
import { FormSwitch, Switch } from '@ui/forms/toggle/switch';
import { toast } from '@ui/toast/toast';
import { useDialogContext } from '@ui/overlays/dialog/dialog-context';
import { DialogHeader } from '@ui/overlays/dialog/dialog-header';
import { DialogBody } from '@ui/overlays/dialog/dialog-body';
import { FormDatePicker } from '@ui/forms/input-field/date/date-picker/date-picker';
import { useTrans } from '@ui/i18n/use-trans';
import { Trans } from '@ui/i18n/trans';
import { message } from '@ui/i18n/message';
export function LinkSettingsDialog({
  className,
  setActivePanel,
  entry
}) {
  const {
    formId
  } = useDialogContext();
  const {
    data
  } = useEntryShareableLink(entry.id);
  const link = data?.link;
  const form = useForm({
    defaultValues: {
      allowDownload: link?.allow_download,
      allowEdit: link?.allow_edit,
      expiresAt: link?.expires_at,
      entryId: entry.id
    }
  });
  const updateLink = useUpdateShareableLink(form);
  return <Fragment>
      <DialogHeader onDismiss={() => {
      setActivePanel('main');
    }}>
        <Trans message="Shareable Link Settings" />
      </DialogHeader>
      <DialogBody>
        <m.div key="link-settings-content" className="min-h-[335px]" animate={{
        opacity: 1,
        y: 0
      }} initial={{
        opacity: 0,
        y: 20
      }} exit={{
        opacity: 0,
        y: -20
      }} transition={{
        duration: 0.1
      }}>
          <Form id={formId} className={className} form={form} onSubmit={value => {
          updateLink.mutate(value, {
            onSuccess: () => {
              setActivePanel('main');
              toast(message('Link settings saved'));
            }
          });
        }}>
            <LinkExpirationOption showField={!!link?.expires_at} />
            <LinkPasswordOption showField={!!link?.password} />
            <LinkOption>
              <Trans message="Allow download" />
              <FormSwitch name="allowDownload">
                <Trans message="Users with link can download this item" />
              </FormSwitch>
            </LinkOption>
            <LinkOption showBorder={false}>
              <Trans message="Allow import" />
              <FormSwitch name="allowEdit">
                <Trans message="Users with link can import this item into their own drive" />
              </FormSwitch>
            </LinkOption>
          </Form>
        </m.div>
      </DialogBody>
      <DialogFooter>
        <Button type="button" onClick={() => {
        setActivePanel('main');
      }}>
          <Trans message="Cancel" />
        </Button>
        <Button type="submit" form={formId} variant="flat" color="primary" disabled={updateLink.isPending}>
          <Trans message="Save" />
        </Button>
      </DialogFooter>
    </Fragment>;
}
const minDate = now(getLocalTimeZone());
function LinkExpirationOption({
  showField: showFieldDefault
}) {
  const {
    trans
  } = useTrans();
  const [showField, setShowField] = useState(showFieldDefault);
  return <LinkOption>
      <Trans message="Link expiration" />
      <div>
        <Switch checked={showField} onChange={e => {
        setShowField(e.target.checked);
      }}>
          <Trans message="Link is valid until" />
        </Switch>
        {showField && <FormDatePicker min={minDate} name="expiresAt" granularity="minute" className="mt-20" aria-label={trans({
        message: 'Link expiration date and time'
      })} />}
      </div>
    </LinkOption>;
}
function LinkPasswordOption({
  showField: showFieldDefault
}) {
  const {
    trans
  } = useTrans();
  const [showField, setShowField] = useState(showFieldDefault);
  return <LinkOption>
      <Trans message="Password protect" />
      <div>
        <Switch checked={showField} onChange={e => {
        setShowField(e.target.checked);
      }}>
          <Trans message="Users will need to enter password in order to view this link" />
        </Switch>
        {showField && <FormTextField type="password" autoFocus name="password" className="mt-20" aria-label={trans({
        message: 'Link password'
      })} description={<Trans message="Password will not be requested when viewing the link as file owner." />} placeholder={trans({
        message: 'Enter new password...'
      })} />}
      </div>
    </LinkOption>;
}
function LinkOption({
  children,
  showBorder = true
}) {
  const [title, content] = children;
  return <div className={clsx(showBorder && 'mb-20 border-b pb-20')}>
      <div className="mb-8 text-sm font-medium">{title}</div>
      {content}
    </div>;
}