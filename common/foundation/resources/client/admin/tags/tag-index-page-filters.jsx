import { FilterControlType, FilterOperator } from '../../datatable/filters/backend-filter';
import { message } from '@ui/i18n/message';
import { createdAtFilter, updatedAtFilter } from '@common/datatable/filters/timestamp-filters';
export const TagIndexPageFilters = types => {
  return [{
    key: 'type',
    label: message('Type'),
    description: message('Type of the tag'),
    defaultOperator: FilterOperator.ne,
    control: {
      type: FilterControlType.Select,
      defaultValue: types[0].name,
      options: types.map(type => ({
        key: type.name,
        label: message(type.name),
        value: type.name
      }))
    }
  }, createdAtFilter({
    description: message('Date tag was created')
  }), updatedAtFilter({
    description: message('Date tag was last updated')
  })];
};