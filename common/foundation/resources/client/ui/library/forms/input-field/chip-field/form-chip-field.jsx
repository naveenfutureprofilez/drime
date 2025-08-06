import { useController } from 'react-hook-form';
import { mergeProps } from '@react-aria/utils';
import React from 'react';
import { ChipField } from './chip-field';
export function FormChipField({
  children,
  ...props
}) {
  const {
    field: {
      onChange,
      onBlur,
      value = [],
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
    onChange,
    onBlur,
    value,
    invalid,
    errorMessage: error?.message
  };
  return <ChipField ref={ref} {...mergeProps(formProps, props)}>
      {children}
    </ChipField>;
}