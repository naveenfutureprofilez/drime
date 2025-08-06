import { useController } from 'react-hook-form';
import React, { useMemo } from 'react';
import { mergeProps } from '@react-aria/utils';
import { ChipField } from '@ui/forms/input-field/chip-field/chip-field';
export function JsonChipField({
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
  const arrayValue = useMemo(() => {
    const mixedValue = value;
    return typeof mixedValue === 'string' ? JSON.parse(mixedValue) : mixedValue;
  }, [value]);
  const formProps = {
    onChange,
    onBlur,
    value: arrayValue,
    invalid,
    errorMessage: error?.message
  };
  return <ChipField valueKey="name" ref={ref} {...mergeProps(formProps, props)} />;
}