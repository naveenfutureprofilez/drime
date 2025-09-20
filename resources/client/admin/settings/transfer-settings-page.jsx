import React, { Fragment } from 'react';
import { Trans } from '@ui/i18n/trans';
import { Card } from '@ui/card/card';
import { CardContent } from '@ui/card/card-content';
import { CardHeader } from '@ui/card/card-header';
import { CardTitle } from '@ui/card/card-title';
import { Form } from '@ui/forms/form';
import { FormTextField } from '@ui/forms/input-field/text-field/text-field';
import { FormSwitch } from '@ui/forms/toggle/switch';
import { FormSelect } from '@ui/forms/select/select';
import { Item } from '@ui/forms/listbox/item';
import { Button } from '@ui/buttons/button';
import { SaveIcon } from '@ui/icons/material/Save';
import { RestoreIcon } from '@ui/icons/material/Restore';
import { InfoIcon } from '@ui/icons/material/Info';
import { WarningIcon } from '@ui/icons/material/Warning';
import { SecurityIcon } from '@ui/icons/material/Security';
import { StorageIcon } from '@ui/icons/material/Storage';
import { SpeedIcon } from '@ui/icons/material/Speed';
import { EmailIcon } from '@ui/icons/material/Email';
import { Badge } from '@ui/badge/badge';
import { Tooltip } from '@ui/tooltip/tooltip';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '@common/http/query-client';
import { toast } from '@ui/toast/toast';
import { queryClient } from '@common/http/query-client';

export function TransferSettingsPage() {
  const { data: settings, isLoading } = useQuery({
    queryKey: ['transfer-settings'],
    queryFn: () => apiClient.get('admin/settings/transfer').then(response => response.data),
  });

  const form = useForm({
    defaultValues: settings || {},
  });

  const updateSettings = useMutation({
    mutationFn: (values) => apiClient.put('admin/settings/transfer', values),
    onSuccess: () => {
      toast.positive(<Trans message="Transfer settings updated successfully" />);
      queryClient.invalidateQueries({ queryKey: ['transfer-settings'] });
    },
    onError: (error) => {
      toast.danger(error.response?.data?.message || <Trans message="Failed to update settings" />);
    },
  });

  const resetToDefaults = useMutation({
    mutationFn: () => apiClient.post('admin/settings/transfer/reset'),
    onSuccess: () => {
      toast.positive(<Trans message="Settings reset to defaults" />);
      queryClient.invalidateQueries({ queryKey: ['transfer-settings'] });
    },
  });

  const handleSubmit = (values) => {
    updateSettings.mutate(values);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      resetToDefaults.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Fragment>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">
              <Trans message="Transfer Service Settings" />
            </h1>
            <p className="text-muted mt-1">
              <Trans message="Configure your transfer service parameters and security settings" />
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={resetToDefaults.isPending}
              startIcon={<RestoreIcon />}
            >
              <Trans message="Reset to Defaults" />
            </Button>
          </div>
        </div>

        <Form form={form} onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* General Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <StorageIcon className="text-primary" />
                  <Trans message="General Settings" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormTextField
                    name="max_file_size"
                    label={<Trans message="Maximum File Size (MB)" />}
                    type="number"
                    min="1"
                    max="10240"
                    description={<Trans message="Maximum size for individual files" />}
                  />
                  <FormTextField
                    name="max_total_size"
                    label={<Trans message="Maximum Total Transfer Size (MB)" />}
                    type="number"
                    min="1"
                    max="51200"
                    description={<Trans message="Maximum total size for all files in a transfer" />}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormTextField
                    name="max_files_per_transfer"
                    label={<Trans message="Maximum Files per Transfer" />}
                    type="number"
                    min="1"
                    max="1000"
                    description={<Trans message="Maximum number of files in a single transfer" />}
                  />
                  <FormSelect
                    name="default_expiry"
                    label={<Trans message="Default Expiry Period" />}
                    description={<Trans message="Default expiration time for new transfers" />}
                  >
                    <Item value="1_hour">
                      <Trans message="1 Hour" />
                    </Item>
                    <Item value="24_hours">
                      <Trans message="24 Hours" />
                    </Item>
                    <Item value="7_days">
                      <Trans message="7 Days" />
                    </Item>
                    <Item value="30_days">
                      <Trans message="30 Days" />
                    </Item>
                    <Item value="never">
                      <Trans message="Never" />
                    </Item>
                  </FormSelect>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormSwitch
                    name="allow_anonymous_transfers"
                    description={<Trans message="Allow users to create transfers without registration" />}
                  >
                    <Trans message="Allow Anonymous Transfers" />
                  </FormSwitch>
                  <FormSwitch
                    name="require_email_verification"
                    description={<Trans message="Require email verification for anonymous transfers" />}
                  >
                    <Trans message="Require Email Verification" />
                  </FormSwitch>
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SecurityIcon className="text-success" />
                  <Trans message="Security Settings" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormSwitch
                    name="enable_password_protection"
                    description={<Trans message="Allow users to password protect their transfers" />}
                  >
                    <Trans message="Enable Password Protection" />
                  </FormSwitch>
                  <FormSwitch
                    name="enable_download_notifications"
                    description={<Trans message="Notify senders when files are downloaded" />}
                  >
                    <Trans message="Enable Download Notifications" />
                  </FormSwitch>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormTextField
                    name="max_download_attempts"
                    label={<Trans message="Maximum Download Attempts" />}
                    type="number"
                    min="1"
                    max="100"
                    description={<Trans message="Maximum number of download attempts per transfer" />}
                  />
                  <FormSelect
                    name="virus_scanning"
                    label={<Trans message="Virus Scanning" />}
                    description={<Trans message="Enable virus scanning for uploaded files" />}
                  >
                    <Item value="disabled">
                      <Trans message="Disabled" />
                    </Item>
                    <Item value="enabled">
                      <Trans message="Enabled" />
                    </Item>
                    <Item value="quarantine">
                      <Trans message="Enabled with Quarantine" />
                    </Item>
                  </FormSelect>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormTextField
                    name="blocked_file_extensions"
                    label={<Trans message="Blocked File Extensions" />}
                    placeholder="exe,bat,com,scr"
                    description={<Trans message="Comma-separated list of blocked file extensions" />}
                  />
                  <FormTextField
                    name="allowed_domains"
                    label={<Trans message="Allowed Email Domains" />}
                    placeholder="company.com,partner.org"
                    description={<Trans message="Restrict transfers to specific email domains (leave empty for all)" />}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Performance Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SpeedIcon className="text-info" />
                  <Trans message="Performance Settings" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormTextField
                    name="chunk_size"
                    label={<Trans message="Upload Chunk Size (MB)" />}
                    type="number"
                    min="1"
                    max="100"
                    description={<Trans message="Size of upload chunks for large files" />}
                  />
                  <FormTextField
                    name="concurrent_uploads"
                    label={<Trans message="Concurrent Uploads" />}
                    type="number"
                    min="1"
                    max="10"
                    description={<Trans message="Maximum number of concurrent file uploads" />}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormSwitch
                    name="enable_compression"
                    description={<Trans message="Compress files during upload to save bandwidth" />}
                  >
                    <Trans message="Enable File Compression" />
                  </FormSwitch>
                  <FormSwitch
                    name="enable_deduplication"
                    description={<Trans message="Remove duplicate files to save storage space" />}
                  >
                    <Trans message="Enable File Deduplication" />
                  </FormSwitch>
                </div>
              </CardContent>
            </Card>

            {/* Email Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <EmailIcon className="text-warning" />
                  <Trans message="Email Settings" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormTextField
                    name="sender_email"
                    label={<Trans message="Sender Email Address" />}
                    type="email"
                    description={<Trans message="Email address used for transfer notifications" />}
                  />
                  <FormTextField
                    name="sender_name"
                    label={<Trans message="Sender Name" />}
                    description={<Trans message="Name displayed in transfer notification emails" />}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormSwitch
                    name="send_upload_confirmation"
                    description={<Trans message="Send confirmation email when transfer is uploaded" />}
                  >
                    <Trans message="Send Upload Confirmation" />
                  </FormSwitch>
                  <FormSwitch
                    name="send_expiry_reminder"
                    description={<Trans message="Send reminder email before transfer expires" />}
                  >
                    <Trans message="Send Expiry Reminder" />
                  </FormSwitch>
                </div>

                <FormTextField
                  name="custom_email_footer"
                  label={<Trans message="Custom Email Footer" />}
                  multiline
                  rows={3}
                  description={<Trans message="Custom footer text for transfer notification emails" />}
                />
              </CardContent>
            </Card>

            {/* Storage Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <StorageIcon className="text-purple-500" />
                  <Trans message="Storage Settings" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormSelect
                    name="storage_driver"
                    label={<Trans message="Storage Driver" />}
                    description={<Trans message="Storage backend for transfer files" />}
                  >
                    <Item value="local">
                      <Trans message="Local Storage" />
                    </Item>
                    <Item value="s3">
                      <Trans message="Amazon S3" />
                    </Item>
                    <Item value="gcs">
                      <Trans message="Google Cloud Storage" />
                    </Item>
                    <Item value="azure">
                      <Trans message="Azure Blob Storage" />
                    </Item>
                  </FormSelect>
                  <FormTextField
                    name="cleanup_interval"
                    label={<Trans message="Cleanup Interval (hours)" />}
                    type="number"
                    min="1"
                    max="168"
                    description={<Trans message="How often to clean up expired transfers" />}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormSwitch
                    name="auto_cleanup_expired"
                    description={<Trans message="Automatically delete expired transfers" />}
                  >
                    <Trans message="Auto Cleanup Expired Transfers" />
                  </FormSwitch>
                  <FormSwitch
                    name="backup_before_cleanup"
                    description={<Trans message="Create backup before deleting expired transfers" />}
                  >
                    <Trans message="Backup Before Cleanup" />
                  </FormSwitch>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={updateSettings.isPending}
                startIcon={<SaveIcon />}
              >
                <Trans message="Save Settings" />
              </Button>
            </div>
          </div>
        </Form>
      </div>
    </Fragment>
  );
}