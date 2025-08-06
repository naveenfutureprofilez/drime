import { FormTextField } from '@ui/forms/input-field/text-field/text-field';
import { Trans } from '@ui/i18n/trans';
import { FormSelect } from '@ui/forms/select/select';
import { Item } from '@ui/forms/listbox/item';
import { FilterOperatorNames } from '@common/datatable/filters/filter-operator-names';
import { Fragment } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
export function InputFilterPanel({
  filter
}) {
  const control = filter.control;
  const form = useFormContext();
  const selectedOperator = useWatch({
    control: form.control,
    name: `${filter.key}.operator`
  });
  return <Fragment>
      {filter.operators?.length ? <FormSelect selectionMode="single" name={`${filter.key}.operator`} className="mb-14" size="sm">
          {filter.operators?.map(operator => <Item key={operator} value={operator}>
              {<Trans {...FilterOperatorNames[operator]} />}
            </Item>)}
        </FormSelect> : null}
      {selectedOperator === 'notNull' ? null : <FormTextField size="sm" name={`${filter.key}.value`} type={filter.control.inputType} min={'minValue' in control ? control.minValue : undefined} max={'maxValue' in control ? control.maxValue : undefined} minLength={'minLength' in control ? control.minLength : undefined} maxLength={'maxLength' in control ? control.maxLength : undefined} />}
    </Fragment>;
}