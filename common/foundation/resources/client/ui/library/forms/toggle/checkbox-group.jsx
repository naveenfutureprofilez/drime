import { Children, cloneElement, isValidElement, useCallback, useId, useRef } from 'react';
import clsx from 'clsx';
import { useControlledState } from '@react-stately/utils';
import { getInputFieldClassNames } from '../input-field/get-input-field-class-names';
import { useFormContext, useWatch } from 'react-hook-form';
export function CheckboxGroup(props) {
  const {
    label,
    children,
    orientation = 'vertical',
    value,
    defaultValue,
    onChange,
    className,
    disabled,
    readOnly,
    invalid
  } = props;
  const ref = useRef(null);
  const labelId = useId();
  const [selectedValues, setSelectedValues] = useControlledState(value, defaultValue || [], onChange);
  const style = getInputFieldClassNames(props);
  const handleCheckboxToggle = useCallback(e => {
    const c = e.currentTarget.value;
    const i = selectedValues.indexOf(c);
    if (i > -1) {
      selectedValues.splice(i, 1);
    } else {
      selectedValues.push(c);
    }
    setSelectedValues([...selectedValues]);
  }, [selectedValues, setSelectedValues]);
  return <div className={className} role="group" aria-labelledby={labelId} ref={ref}>
      {label && <span id={labelId} className={style.label}>
          {label}
        </span>}
      <div role="presentation" className={clsx('flex gap-6', orientation === 'vertical' ? 'flex-col' : 'flow-row')}>
        {Children.map(children, child => {
        if (isValidElement(child)) {
          return cloneElement(child, {
            disabled: child.props.disabled || disabled,
            readOnly: child.props.readOnly || readOnly,
            invalid: child.props.invalid || invalid,
            checked: selectedValues?.includes(child.props.value),
            onChange: handleCheckboxToggle
          });
        }
      })}
      </div>
    </div>;
}
export function FormCheckboxGroup({
  children,
  ...props
}) {
  const value = useWatch({
    name: props.name
  });
  const {
    setValue
  } = useFormContext();
  return <CheckboxGroup value={value || []} onChange={newValue => {
    setValue(props.name, newValue, {
      shouldDirty: true
    });
  }} {...props}>
      {children}
    </CheckboxGroup>;
}