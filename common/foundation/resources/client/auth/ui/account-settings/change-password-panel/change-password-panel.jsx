import { useForm } from 'react-hook-form';
import { useId } from 'react';
import { Form } from '@ui/forms/form';
import { AccountSettingsPanel } from '@common/auth/ui/account-settings/account-settings-panel';
import { FormTextField } from '@ui/forms/input-field/text-field/text-field';
import { useUpdatePassword } from './use-update-password';
import { Button } from '@ui/buttons/button';
import { Trans } from '@ui/i18n/trans';
import { AccountSettingsId } from '@common/auth/ui/account-settings/account-settings-sidenav';
export function ChangePasswordPanel() {
  const form = useForm();
  const formId = useId();
  const updatePassword = useUpdatePassword(form);
  return <AccountSettingsPanel id={AccountSettingsId.Password} title={<Trans message="Update Password" />} actions={<Button className="button" type="submit" form={formId} variant="flat" color="primary" disabled={!form.formState.isValid || updatePassword.isPending}>
    <span className='text-[18px] font-semibold'>Update Password </span>
  </Button>}>
    <div className="flex justify-center items-center ">
      <Form className="w-full max-w-2xl p-4 bg-white " form={form} id={formId} onSubmit={newValues => {
        updatePassword.mutate(newValues, {
          onSuccess: () => {
            form.reset();
          }
        });
      }}>
        <FormTextField className="mb-4" name="current_password" label={<Trans message="Current password" />} type="password" autoComplete="current-password" required />
        <FormTextField className="mb-4" name="password" label={<Trans message="New password" />} type="password" autoComplete="new-password" required />
        <FormTextField name="password_confirmation" label={<Trans message="Confirm password" />} type="password" autoComplete="new-password" required />
      </Form>
    </div>
  </AccountSettingsPanel>;
}