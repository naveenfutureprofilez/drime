import { useFormContext } from 'react-hook-form';
import { FormSelect, Option } from '@ui/forms/select/select';
import { Trans } from '@ui/i18n/trans';
import React from 'react';
export function ContentModelField({
  config,
  className,
  exclude
}) {
  const {
    setValue,
    getValues
  } = useFormContext();
  return <FormSelect className={className} selectionMode="single" name="config.contentModel" label={<Trans message="Type of content" />} onSelectionChange={newValue => {
    const modelConfig = config.models[newValue];
    if (getValues('config.contentType') === 'autoUpdate' && !modelConfig.autoUpdateMethods?.length) {
      setValue('config.contentType', 'manual');
    }

    // sync auto update config
    const firstAutoUpdateMethod = modelConfig.autoUpdateMethods?.[0];
    setValue('config.autoUpdateMethod', firstAutoUpdateMethod);
    setValue('config.autoUpdateProvider', firstAutoUpdateMethod ? config.autoUpdateMethods[firstAutoUpdateMethod]?.providers[0] : undefined);

    // sync restrictions
    setValue('config.restriction', null);
    setValue('config.restrictionModelId', null);

    // sync order
    setValue('config.contentOrder', modelConfig.sortMethods[0] || 'channelables.order:asc');

    // sync layout
    setValue('config.layout', modelConfig.layoutMethods[0]);
  }}>
      {Object.entries(config.models).filter(([model]) => !exclude?.includes(model)).map(([model, {
      label
    }]) => <Option value={model} key={model}>
            <Trans {...label} />
          </Option>)}
    </FormSelect>;
}