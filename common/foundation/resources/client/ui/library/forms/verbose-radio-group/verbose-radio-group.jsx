import React, { Children, cloneElement, forwardRef } from 'react';
import { useControlledState } from '@react-stately/utils';
import clsx from 'clsx';
import { RadioButtonCheckedIcon } from '@ui/icons/material/RadioButtonChecked';
import { RadioButtonUncheckedIcon } from '@ui/icons/material/RadioButtonUnchecked';
import { useController } from 'react-hook-form';
import { mergeProps } from '@react-aria/utils';
export const VerboseRadioGroup = forwardRef((props, ref) => {
  const {
    value,
    defaultValue,
    onChange,
    children,
    className,
    iconHorizPlacement = 'start',
    iconVertPlacement = 'top',
    invalid,
    layout = 'vertical'
  } = props;
  const [controlledValue, setControlledValue] = useControlledState(value, defaultValue, onChange);
  return <div role="radiogroup" className={clsx('flex gap-16', layout === 'horizontalDesktop' ? 'flex-col md:flex-row' : layout === 'vertical' ? 'flex-col' : 'flex-row', className)} ref={ref}>
      {Children.map(children, child => {
      return cloneElement(child, {
        value: child.props.value,
        onToggle: () => setControlledValue(child.props.value),
        checked: controlledValue === child.props.value,
        iconHorizPlacement,
        iconVertPlacement,
        invalid
      });
    })}
    </div>;
});
export function VerboseRadioItem(props) {
  const {
    label,
    description,
    iconHorizPlacement,
    iconVertPlacement,
    onToggle,
    checked,
    invalid
  } = props;
  return <div className={clsx('flex cursor-pointer gap-12 rounded-panel border p-16 transition-button hover:bg-hover', invalid ? 'border-danger' : checked ? 'border-primary' : 'border-divider', iconHorizPlacement === 'end' && 'flex-row-reverse', iconVertPlacement === 'center' && 'items-center', iconVertPlacement === 'bottom' && 'items-end')} role="radio" tabIndex={0} aria-checked={checked} onClick={() => onToggle()}>
      {checked ? <RadioButtonCheckedIcon className={clsx(invalid ? 'text-danger' : 'text-primary')} /> : <RadioButtonUncheckedIcon className={clsx(invalid ? 'text-danger' : 'text-divider')} />}
      <div>
        <div className="mb-4 text-sm font-semibold">{label}</div>
        <div className="text-sm text-muted">{description}</div>
      </div>
    </div>;
}
export function FormVerboseRadioGroup({
  children,
  ...props
}) {
  const {
    field: {
      onChange,
      value,
      ref
    },
    fieldState: {
      invalid
    }
  } = useController({
    name: props.name
  });
  const formProps = {
    onChange,
    value,
    invalid: props.invalid || invalid
  };
  return <VerboseRadioGroup ref={ref} {...mergeProps(formProps, props)}>
      {children}
    </VerboseRadioGroup>;
}