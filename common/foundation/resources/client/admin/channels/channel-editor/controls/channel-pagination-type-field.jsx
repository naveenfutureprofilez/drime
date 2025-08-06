import { FormSelect, Option } from '@ui/forms/select/select';
import { Trans } from '@ui/i18n/trans';
export function ChannelPaginationTypeField({
  className
}) {
  return <FormSelect className={className} selectionMode="single" name="config.paginationType" label={<Trans message="Pagination type" />}>
      <Option value="infiniteScroll">
        <Trans message="Infinite scroll" />
      </Option>
      <Option value="lengthAware">
        <Trans message="List of page buttons" />
      </Option>
      <Option value="simple">
        <Trans message="Next/previous page buttons only" />
      </Option>
    </FormSelect>;
}