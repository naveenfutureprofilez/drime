import React from 'react';
import { Dialog } from '@ui/overlays/dialog/dialog';
import { DialogHeader } from '@ui/overlays/dialog/dialog-header';
import { DialogBody } from '@ui/overlays/dialog/dialog-body';
import { DialogFooter } from '@ui/overlays/dialog/dialog-footer';
import { Button } from '@ui/buttons/button';
import { FormTextField } from '@ui/forms/input-field/text-field/text-field';
import { FormSelect, Option } from '@ui/forms/select/select';
import { Trans } from '@ui/i18n/trans';
export function SettingsPanel({
  settings,
  onSettingsChange,
  onClose
}) {
  const handlePasswordChange = value => {
    onSettingsChange({
      ...settings,
      password: value
    });
  };
  const handleExpiryChange = value => {
    onSettingsChange({
      ...settings,
      expiresInHours: parseInt(value.toString())
    });
  };
  const handleMaxDownloadsChange = value => {
    const maxDownloads = value ? parseInt(value.toString()) : null;
    onSettingsChange({
      ...settings,
      maxDownloads
    });
  };
  return <Dialog size="md">
      <DialogHeader>
        <Trans message="Transfer Settings" />
      </DialogHeader>
      
      <DialogBody>
        <div className="space-y-6">
          {/* Password Protection */}
          <div>
            <FormTextField name="password" label={<Trans message="Password protection (optional)" />} type="password" value={settings.password} onChange={e => handlePasswordChange(e.target.value)} placeholder="Enter password" description={<Trans message="Add a password to protect your files" />} />
          </div>

          {/* Expiry Time */}
          <div>
            <FormSelect name="expiresInHours" selectionMode="single" label={<Trans message="Delete files after" />} selectedValue={settings.expiresInHours.toString()} onSelectionChange={handleExpiryChange} description={<Trans message="Files will be automatically deleted after this time" />}>
              <Option value="1">
                <Trans message="1 hour" />
              </Option>
              <Option value="6">
                <Trans message="6 hours" />
              </Option>
              <Option value="24">
                <Trans message="1 day" />
              </Option>
              <Option value="72">
                <Trans message="3 days" />
              </Option>
              <Option value="120">
                <Trans message="5 days" />
              </Option>
              <Option value="168">
                <Trans message="7 days" />
              </Option>
            </FormSelect>
          </div>

          {/* Download Limit */}
          <div>
            <FormSelect name="maxDownloads" selectionMode="single" label={<Trans message="Download limit (optional)" />} selectedValue={settings.maxDownloads?.toString() || ''} onSelectionChange={handleMaxDownloadsChange} description={<Trans message="Limit the number of times files can be downloaded" />}>
              <Option value="">
                <Trans message="No limit" />
              </Option>
              <Option value="1">
                <Trans message="1 download" />
              </Option>
              <Option value="5">
                <Trans message="5 downloads" />
              </Option>
              <Option value="10">
                <Trans message="10 downloads" />
              </Option>
              <Option value="25">
                <Trans message="25 downloads" />
              </Option>
            </FormSelect>
          </div>
        </div>
      </DialogBody>

      <DialogFooter>
        <Button variant="text" onClick={onClose}>
          <Trans message="Cancel" />
        </Button>
        <Button variant="flat" color="primary" onClick={onClose}>
          <Trans message="Save settings" />
        </Button>
      </DialogFooter>
    </Dialog>;
}