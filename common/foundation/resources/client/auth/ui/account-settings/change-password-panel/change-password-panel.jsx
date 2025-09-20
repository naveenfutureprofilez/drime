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
  return <AccountSettingsPanel id={AccountSettingsId.Password} actions={<Button className="button" type="submit" form={formId} variant="flat" color="primary" disabled={!form.formState.isValid || updatePassword.isPending}>
    <span className='text-[18px] font-semibold'>Update Password </span>
  </Button>}>
    <Form className=" bg-white " form={form} id={formId} onSubmit={newValues => {
      updatePassword.mutate(newValues, {
        onSuccess: () => {
          form.reset();
        }
      });
    }}>
      <div className='flex flex-wrap items-start mt-3'>
        <div className='w-full w-full lg:w-5/12 xl:w-4/12 lg:pr-3 mb-2 lg:mb-0'>
          <h3 className='block text-[#000000] font-medium text-base xl:text-xl mb-1 tracking-[-0.04em]'> Current Password </h3>
          <p className='block text-[#535353] font-medium text-sm xl:text-base  tracking-[-0.04em] mb-0'>Please current password
          </p>
        </div>
        <div className="w-full lg:w-6/12 xl:w-5/12 lg:pl-3 relative">

          <FormTextField className="mb-4" name="current_password"  type="password" autoComplete="current-password" required />
        </div>
      </div>
      <div className='flex flex-wrap items-start mt-3'>

        <div className='w-full w-full lg:w-5/12 xl:w-4/12 lg:pr-3 mb-2 lg:mb-0'>
          <h3 className='block text-[#000000] font-medium text-base xl:text-xl mb-1 tracking-[-0.04em]'> New  Password </h3>
          <p className='block text-[#535353] font-medium text-sm xl:text-base  tracking-[-0.04em] mb-0'>Please new password
          </p>
        </div>
        <div className="w-full lg:w-6/12 xl:w-5/12 lg:pl-3 relative">

          <FormTextField className="mb-4" name="password" type="password" autoComplete="new-password" required />
        </div>
      </div>
      <div className='flex flex-wrap items-start mt-3'>
        <div className='w-full w-full lg:w-5/12 xl:w-4/12 lg:pr-3 mb-2 lg:mb-0'>
          <h3 className='block text-[#000000] font-medium text-base xl:text-xl mb-1 tracking-[-0.04em]'> Confirm Password </h3>
          <p className='block text-[#535353] font-medium text-sm xl:text-base  tracking-[-0.04em] mb-0'>Please confirm password
          </p>
        </div>
        <div className="w-full lg:w-6/12 xl:w-5/12 lg:pl-3 relative">
          <FormTextField name="password_confirmation" type="password" autoComplete="new-password" required />
        </div>
      </div>

    </Form>
  </AccountSettingsPanel>;
}