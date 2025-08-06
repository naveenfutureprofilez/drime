import { useController } from 'react-hook-form';
import { mergeProps } from '@react-aria/utils';
import React from 'react';
import { ComboBox } from './combobox';
export function FormComboBox({
  children,
  ...props
}) {
  const {
    field: {
      onChange,
      onBlur,
      value = '',
      ref
    },
    fieldState: {
      invalid,
      error
    }
  } = useController({
    name: props.name
  });
  const formProps = {
    onSelectionChange: onChange,
    onBlur,
    selectedValue: value,
    defaultInputValue: value,
    invalid,
    errorMessage: error?.message
  };
  return <ComboBox ref={ref} {...mergeProps(formProps, props)}>
      {children}
    </ComboBox>;
}