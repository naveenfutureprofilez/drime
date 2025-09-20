import { useForm } from 'react-hook-form';
import { useId } from 'react';
import { AccountSettingsPanel } from '../account-settings-panel';
import { Button } from '@ui/buttons/button';
import { Form } from '@ui/forms/form';
import { FormTextField } from '@ui/forms/input-field/text-field/text-field';
import { useUpdateAccountDetails } from './update-account-details';
import { Trans } from '@ui/i18n/trans';
import { useUploadAvatar } from '../avatar/upload-avatar';
import { useRemoveAvatar } from '../avatar/remove-avatar';
import { FormImageSelector } from '@common/uploads/components/image-selector';
import { FileUploadProvider } from '@common/uploads/uploader/file-upload-provider';
import { AccountSettingsId } from '@common/auth/ui/account-settings/account-settings-sidenav';
export function BasicInfoPanel({ user }) {
  const uploadAvatar = useUploadAvatar({
    user,
  });
  const removeAvatar = useRemoveAvatar({ user });
  const formId = useId();
  const form = useForm({
    defaultValues: {
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      image: user.image,
    },
  });
  const updateDetails = useUpdateAccountDetails(user.id, form);
  return (
    <AccountSettingsPanel
      id={AccountSettingsId.AccountDetails}
      title={<h2 className=''>Update name and profile image </h2>}
      actions={
        <Button
          type="submit"
          variant="flat"
          color="primary"
          form={formId}
          disabled={updateDetails.isPending || !form.formState.isValid}
        >
          Profile Update
        </Button>
      }
    >
      <Form
        form={form}
        className="flex flex-col gap-6"
        onSubmit={newDetails => {
          updateDetails.mutate(newDetails);
        }}
        id={formId}
      >
        {/* Profile Photo Card */}
        <div className="w-full border-b border-[rgba(0,0,0,.1)] py-6 lg:py-8 flex flex-wrap items-center">

          <div className="w-full lg:w-5/12 xl:w-4/12 lg:pr-3 mb-3 lg:mb-0">
            <label className="block text-[#000000] tracking-[-0.04em] font-medium text-base xl:text-xl mb-1">
              Your Photo
            </label>
            <p className="block text-[#535353] text-sm xl:text-base tracking-[-0.04em] font-medium">
              This will be displayed in your profile
            </p>
          </div>
          <div className="w-full lg:w-6/12 xl:w-5/12 lg:pl-3 mt-3 lg:mt-0">
            <div className="flex items-center">
              {/* Avatar Preview */}
              <FileUploadProvider>
                <FormImageSelector
                  className="flex-shrink-0 ml-4"
                  variant="avatar"
                  previewSize="w-20 h-20 md:w-24 md:h-24"
                  showRemoveButton
                  name="image"
                  diskPrefix="avatars"
                  onChange={(url) => {
                    if (url) {
                      uploadAvatar.mutate({ url });
                    } else {
                      removeAvatar.mutate();
                    }
                  }}
                />
              </FileUploadProvider>
            </div>
          </div>
        </div>

        {/* Name Fields */}
        <div className="border-b border-[rgba(0,0,0,.1)]  py-6 lg:py-8 space-y-4 lg:space-y-6 w-full ">
          <div className='flex flex-wrap flex-row'>
            <div className='w-full w-full lg:w-5/12 xl:w-4/12 lg:pr-3 mb-2 lg:mb-0'>
              <h3 className='block text-[#000000] font-medium text-base xl:text-xl mb-1 tracking-[-0.04em]'> Name </h3>
              <p className='block text-[#535353] font-medium text-sm xl:text-base  tracking-[-0.04em] mb-0'>please enter name
              </p>
            </div>
            <FormTextField
              className="mb-4"
              name="first_name"
            />
          </div>

          <div className='flex flex-wrap flex-row'>
            <div className='w-full w-full lg:w-5/12 xl:w-4/12 lg:pr-3 mb-2 lg:mb-0'>
              <h3 className='block text-[#000000] font-medium text-base xl:text-xl mb-1 tracking-[-0.04em]'> Last Name </h3>
              <p className='block text-[#535353] font-medium text-sm xl:text-base  tracking-[-0.04em] mb-0'>please enter last name
              </p>
            </div>
            <FormTextField
              className="mb-4"
              name="last_name"
            />
          </div>

          {/* Email Field */}
          <div className='flex flex-wrap flex-row'>
            <div className='w-full w-full lg:w-5/12 xl:w-4/12 lg:pr-3 mb-2 lg:mb-0'>
              <h3 className='block text-[#000000] font-medium text-base xl:text-xl mb-1 tracking-[-0.04em]'> Email </h3>
              <p className='block text-[#535353] font-medium text-sm xl:text-base  tracking-[-0.04em] mb-0'>your email address
              </p>
            </div>
            <FormTextField
              className="mb-4"
              name="email"
              type="email"
            />
          </div>
        </div>
      </Form>
    </AccountSettingsPanel>

  );
}
