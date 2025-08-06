import React from 'react';
import clsx from 'clsx';
import { createFocusManager } from '@react-aria/focus';
import { mergeProps, useObjectRef } from '@react-aria/utils';
import { getInputFieldClassNames } from '../../get-input-field-class-names';
import { Field } from '../../field';
import { Input } from '../../input';
import { useField } from '../../use-field';
export const DatePickerField = React.forwardRef(({
  inputRef,
  wrapperProps,
  children,
  onBlur,
  ...other
}, ref) => {
  const fieldClassNames = getInputFieldClassNames(other);
  const objRef = useObjectRef(ref);
  const {
    fieldProps,
    inputProps
  } = useField({
    ...other,
    focusRef: objRef,
    labelElementType: 'span'
  });
  fieldClassNames.wrapper = clsx(fieldClassNames.wrapper, other.disabled && 'pointer-events-none');
  return <Field wrapperProps={mergeProps(wrapperProps, {
    onBlur: e => {
      if (!objRef.current?.contains(e.relatedTarget)) {
        onBlur?.(e);
      }
    },
    onClick: () => {
      // focus first segment when clicking on label or somewhere else in the field, but no directly on segment
      const focusManager = createFocusManager(objRef);
      focusManager?.focusFirst();
    }
  })} fieldClassNames={fieldClassNames} ref={objRef} {...fieldProps}>
      <Input inputProps={inputProps} className={clsx(fieldClassNames.input, 'gap-10')} ref={inputRef}>
        {children}
      </Input>
    </Field>;
});