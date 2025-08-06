import { FormNormalizedModelField } from '@common/ui/normalized-model/normalized-model-field';
export function NormalizedModelFilterPanel({
  filter
}) {
  return <FormNormalizedModelField name={`${filter.key}.value`} endpoint={filter.control.endpoint ? filter.control.endpoint : `normalized-models/${filter.control.model}`} />;
}