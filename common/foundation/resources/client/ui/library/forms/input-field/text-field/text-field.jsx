import React, { forwardRef } from 'react';
import { useController } from 'react-hook-form';
import { mergeProps, useObjectRef } from '@react-aria/utils';
import { getInputFieldClassNames } from '../get-input-field-class-names';
import { Field } from '../field';
import { useField } from '../use-field';
export const TextField = forwardRef(({
  inputElementType = 'input',
  flexibleHeight,
  inputRef,
  inputTestId,
  ...props
}, ref) => {
  const inputObjRef = useObjectRef(inputRef);
  const {
    fieldProps,
    inputProps
  } = useField({
    ...props,
    focusRef: inputObjRef
  });
  const isTextArea = inputElementType === 'textarea';
  const ElementType = isTextArea ? 'textarea' : 'input';
  const inputFieldClassNames = getInputFieldClassNames({
    ...props,
    flexibleHeight: flexibleHeight || inputElementType === 'textarea'
  });
  if (inputElementType === 'textarea' && !props.unstyled) {
    inputFieldClassNames.input = `${inputFieldClassNames.input} py-12`;
  }
  return <Field ref={ref} fieldClassNames={inputFieldClassNames} {...fieldProps}>
        <ElementType data-testid={inputTestId} ref={inputObjRef} {...inputProps} rows={isTextArea ? inputProps.rows || 4 : undefined} className={inputFieldClassNames.input} />
      </Field>;
});
export const FormTextField = React.forwardRef(({
  name,
  ...props
}, ref) => {
  const {
    field: {
      onChange,
      onBlur,
      value = '',
      ref: inputRef
    },
    fieldState: {
      invalid,
      error
    }
  } = useController({
    name
  });
  const formProps = {
    onChange,
    onBlur,
    // avoid `value` prop on `input` should not be null error when setting form defaults from backend model
    value: value == null ? '' : value,
    invalid,
    errorMessage: error?.message,
    inputRef,
    name
  };
  return <TextField ref={ref} {...mergeProps(formProps, props)} />;
});