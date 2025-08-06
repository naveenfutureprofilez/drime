import React, { forwardRef } from 'react';
import { Field } from '../field';
import { getInputFieldClassNames } from '../get-input-field-class-names';
export const TextFieldBase = forwardRef((props, ref) => {
  const {
    label,
    startAdornment,
    endAdornment,
    startAppend,
    endAppend,
    errorMessage,
    description,
    labelProps,
    inputProps,
    inputRef,
    descriptionProps,
    errorMessageProps,
    inputWrapperClassName,
    className,
    inputClassName,
    disabled,
    inputElementType,
    rows
  } = props;
  const isTextArea = inputElementType === 'textarea';
  const ElementType = isTextArea ? 'textarea' : 'input';
  const fieldClassNames = getInputFieldClassNames(props);
  return <Field ref={ref} label={label} labelProps={labelProps} startAdornment={startAdornment} endAdornment={endAdornment} startAppend={startAppend} endAppend={endAppend} errorMessage={errorMessage} description={description} descriptionProps={descriptionProps} errorMessageProps={errorMessageProps} inputWrapperClassName={inputWrapperClassName} className={className} inputClassName={inputClassName} fieldClassNames={fieldClassNames} disabled={disabled}>
      <ElementType ref={inputRef} {...inputProps} rows={isTextArea ? rows || 4 : undefined} className={fieldClassNames.input} />
    </Field>;
});