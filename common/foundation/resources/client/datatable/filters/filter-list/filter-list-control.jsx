import { FilterControlType } from '../backend-filter';
import { FilterListTriggerButton } from './filter-list-trigger-button';
import { Trans } from '@ui/i18n/trans';
import { SelectFilterPanel } from '../panels/select-filter-panel';
import { FilterListItemDialogTrigger } from './filter-list-item-dialog-trigger';
import { Avatar } from '@ui/avatar/avatar';
import { NormalizedModelFilterPanel } from '../panels/normalized-model-filter-panel';
import { DateRangeFilterPanel } from '../panels/date-range-filter-panel';
import { Fragment } from 'react';
import { DateRangePresets } from '@ui/forms/input-field/date/date-range-picker/dialog/date-range-presets';
import { FormattedDateTimeRange } from '@ui/i18n/formatted-date-time-range';
import { InputFilterPanel } from '../panels/input-filter-panel';
import { FilterOperatorNames } from '../filter-operator-names';
import { useNormalizedModel } from '@common/ui/normalized-model/use-normalized-model';
import { Skeleton } from '@ui/skeleton/skeleton';
import { useTrans } from '@ui/i18n/use-trans';
import { ChipFieldFilterPanel } from '@common/datatable/filters/panels/chip-field-filter-panel';
import { FormattedNumber } from '@ui/i18n/formatted-number';
export function FilterListControl(props) {
  switch (props.filter.control.type) {
    case FilterControlType.DateRangePicker:
      return <DatePickerControl {...props} />;
    case FilterControlType.BooleanToggle:
      return <BooleanToggleControl {...props} />;
    case FilterControlType.Select:
      return <SelectControl {...props} />;
    case FilterControlType.ChipField:
      return <ChipFieldControl {...props} />;
    case FilterControlType.Input:
      return <InputControl {...props} />;
    case FilterControlType.SelectModel:
      return <SelectModelControl {...props} />;
    case FilterControlType.Custom:
      const Control = props.filter.control.listItem;
      return <Control {...props} />;
    default:
      return null;
  }
}
function DatePickerControl(props) {
  const {
    value,
    filter
  } = props;
  let valueLabel;
  if (value.preset !== undefined) {
    valueLabel = <Trans {...DateRangePresets[value.preset].label} />;
  } else {
    valueLabel = <FormattedDateTimeRange start={new Date(value.start)} end={new Date(value.end)} options={{
      dateStyle: 'medium'
    }} />;
  }
  return <FilterListItemDialogTrigger {...props} label={valueLabel} panel={<DateRangeFilterPanel filter={filter} />} />;
}
function BooleanToggleControl({
  filter,
  isInactive,
  onValueChange
}) {
  // todo: toggle control on or off here
  return <FilterListTriggerButton onClick={() => {
    onValueChange({
      value: filter.control.defaultValue
    });
  }} filter={filter} isInactive={isInactive} />;
}
function SelectControl(props) {
  const {
    filter,
    value
  } = props;
  const option = filter.control.options.find(o => o.key === value);
  return <FilterListItemDialogTrigger {...props} label={option ? typeof option.label === 'string' ? option.label : <Trans {...option.label} /> : null} panel={<SelectFilterPanel filter={filter} />} />;
}
function ChipFieldControl(props) {
  return <FilterListItemDialogTrigger {...props} label={<MultipleValues {...props} />} panel={<ChipFieldFilterPanel filter={props.filter} />} />;
}
function MultipleValues(props) {
  const {
    trans
  } = useTrans();
  const {
    filter,
    value
  } = props;
  const options = value.map(v => filter.control.options.find(o => o.key === v));
  const maxShownCount = 3;
  const notShownCount = value.length - maxShownCount;

  // translate names, add commas and limit to 3
  const names = <Fragment>
      {options.filter(Boolean).slice(0, maxShownCount).map((o, i) => {
      let name = '';
      if (i !== 0) {
        name += ', ';
      }
      name += typeof o.label === 'string' ? o.label : trans(o.label);
      return name;
    })}
    </Fragment>;

  // indicate that there are some names not shown
  return notShownCount > 0 ? <Trans message=":names + :count more" values={{
    names: names,
    count: notShownCount
  }} /> : names;
}
function InputControl(props) {
  const {
    filter,
    value,
    operator
  } = props;
  const operatorLabel = operator ? <Trans {...FilterOperatorNames[operator]} /> : null;
  const formattedValue = filter.control.inputType === 'number' ? <FormattedNumber value={value} /> : value;
  return <FilterListItemDialogTrigger {...props} label={<Fragment>
          {operatorLabel} {formattedValue}
        </Fragment>} panel={<InputFilterPanel filter={filter} />} />;
}
function SelectModelControl(props) {
  const {
    value,
    filter
  } = props;
  const {
    isLoading,
    data
  } = useNormalizedModel(filter.control.endpoint ? `${filter.control.endpoint}/${value}` : `normalized-models/${filter.control.model}/${value}`, undefined, {
    enabled: !!value
  });
  const skeleton = <Fragment>
      <Skeleton variant="avatar" size="w-18 h-18 mr-6" />
      <Skeleton variant="rect" size="w-50" />
    </Fragment>;
  const modelPreview = <Fragment>
      <Avatar size="xs" src={data?.model.image} label={data?.model.name} className="mr-6" />
      {data?.model.name}
    </Fragment>;
  const label = isLoading || !data ? skeleton : modelPreview;
  return <FilterListItemDialogTrigger {...props} label={label} panel={<NormalizedModelFilterPanel filter={filter} />} />;
}