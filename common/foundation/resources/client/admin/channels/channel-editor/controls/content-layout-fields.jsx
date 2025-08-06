import { useFormContext } from 'react-hook-form';
import { FormSelect, Option } from '@ui/forms/select/select';
import { Trans } from '@ui/i18n/trans';
import clsx from 'clsx';
export function ContentLayoutFields({
  config,
  className
}) {
  return <div className={clsx('items-end gap-14 md:flex', className)}>
      <LayoutField config={config} name="config.layout" label={<Trans message="Layout" />} />
      <LayoutField config={config} name="config.nestedLayout" label={<Trans message="Layout when nested" />} />
    </div>;
}
function LayoutField({
  config,
  name,
  label
}) {
  const {
    watch
  } = useFormContext();
  const contentModel = watch('config.contentModel');
  const modelConfig = config.models[contentModel];
  if (!modelConfig.layoutMethods?.length) {
    return null;
  }
  return <FormSelect className="w-full flex-auto" selectionMode="single" name={name} label={label}>
      {modelConfig.layoutMethods.map(method => {
      const label = config.layoutMethods[method].label;
      return <Option key={method} value={method}>
            <Trans {...label} />
          </Option>;
    })}
    </FormSelect>;
}