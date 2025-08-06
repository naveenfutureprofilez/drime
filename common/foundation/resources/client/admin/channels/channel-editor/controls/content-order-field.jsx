import { useFormContext } from 'react-hook-form';
import { FormSelect, Option } from '@ui/forms/select/select';
import { Trans } from '@ui/i18n/trans';
export function ContentOrderField({
  config,
  className
}) {
  const {
    watch
  } = useFormContext();
  const contentType = watch('config.contentType');
  const modelConfig = config.models[watch('config.contentModel')];
  const sortMethods = [...modelConfig.sortMethods, 'channelables.order:asc', 'channelables.created_at:desc'];
  return <FormSelect className={className} selectionMode="single" name="config.contentOrder" label={<Trans message="How to order content" />}>
      {sortMethods.map(method => {
      const sortConfig = config.sortingMethods[method];
      if (!sortConfig.contentTypes || sortConfig.contentTypes.includes(contentType)) {
        return <Option value={method} key={method}>
              <Trans {...sortConfig.label} />
            </Option>;
      }
    })}
    </FormSelect>;
}