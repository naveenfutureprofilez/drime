import { useForm } from 'react-hook-form';
import React from 'react';
import { CrupdateResourceLayout } from '@common/admin/crupdate-resource-layout';
import { Trans } from '@ui/i18n/trans';
import { PageStatus } from '@common/http/page-status';
import { useChannel } from '@common/channels/requests/use-channel';
import { useUpdateChannel } from '@common/admin/channels/requests/use-update-channel';
export function EditChannelPageLayout({
  children
}) {
  const query = useChannel(undefined, 'editChannelPage');
  if (query.data) {
    return <PageContent channel={query.data.channel}>{children}</PageContent>;
  }
  return <PageStatus query={query} loaderIsScreen={false} />;
}
function PageContent({
  channel,
  children
}) {
  const form = useForm({
    // @ts-ignore
    defaultValues: {
      ...channel
    }
  });
  const updateChannel = useUpdateChannel(form);
  return <CrupdateResourceLayout form={form} onSubmit={values => {
    updateChannel.mutate(values);
  }} title={<Trans message="Edit “:name“ channel" values={{
    name: channel.name
  }} />} isLoading={updateChannel.isPending}>
      {children}
    </CrupdateResourceLayout>;
}