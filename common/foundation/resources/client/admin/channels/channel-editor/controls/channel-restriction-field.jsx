import { Trans } from '@ui/i18n/trans';
import { Item } from '@ui/forms/listbox/item';
import { FormSelect } from '@ui/forms/select/select';
import React, { Fragment } from 'react';
import { useFormContext } from 'react-hook-form';
import { InfoDialogTrigger } from '@ui/overlays/dialog/info-dialog-trigger/info-dialog-trigger';
import clsx from 'clsx';
import { ChannelsDocsLink } from '@common/admin/channels/channels-docs-link';
export function ChannelRestrictionField({
  config,
  className,
  children
}) {
  const {
    setValue
  } = useFormContext();
  const {
    watch
  } = useFormContext();
  const modelConfig = config.models[watch('config.contentModel')];
  const contentType = watch('config.contentType');
  if (!modelConfig.restrictions || contentType === 'manual') {
    return null;
  }
  return <div className={clsx('items-end gap-14 md:flex', className)}>
      <FormSelect className="w-full flex-auto" name="config.restriction" selectionMode="single" label={<Fragment>
            <Trans message="Filter content by" />
            <InfoTrigger />
          </Fragment>} onSelectionChange={() => {
      setValue('config.restrictionModelId', 'urlParam');
    }}>
        <Item value={null}>
          <Trans message="Don't filter content" />
        </Item>
        {Object.values(config.restrictions).map(r => <Item key={r.value} value={r.value}>
            <Trans {...r.label} />
          </Item>)}
      </FormSelect>
      {children}
    </div>;
}
function InfoTrigger() {
  return <InfoDialogTrigger body={<Fragment>
          <Trans message="Allows specifying additional condition channel content should be filtered on. " />
          <ChannelsDocsLink className="mt-20" hash="filter-content-by" />
        </Fragment>} />;
}