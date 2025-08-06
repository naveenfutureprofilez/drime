import React from 'react';
import { Adornment } from '@ui/forms/input-field/adornment';
import clsx from 'clsx';
import { removeEmptyValuesFromObject } from '@ui/utils/objects/remove-empty-values-from-object';
export const Field = React.forwardRef((props, ref) => {
  const {
    children,
    // Not every component that uses <Field> supports help text.
    description,
    errorMessage,
    descriptionProps = {},
    errorMessageProps = {},
    startAdornment,
    endAdornment,
    adornmentPosition,
    startAppend,
    endAppend,
    fieldClassNames,
    disabled,
    wrapperProps
  } = props;
  return <div className={fieldClassNames.wrapper} ref={ref} {...wrapperProps}>
        <Label {...props} />
        <div className={fieldClassNames.inputWrapper}>
          <Adornment direction="start" className={fieldClassNames.adornment} position={adornmentPosition}>
            {startAdornment}
          </Adornment>
          {startAppend && <Append style={fieldClassNames.append} disabled={disabled}>
              {startAppend}
            </Append>}
          {children}
          {endAppend && <Append style={fieldClassNames.append} disabled={disabled}>
              {endAppend}
            </Append>}
          <Adornment direction="end" className={fieldClassNames.adornment} position={adornmentPosition}>
            {endAdornment}
          </Adornment>
        </div>
        {description && !errorMessage && <div className={fieldClassNames.description} {...descriptionProps}>
            {description}
          </div>}
        {errorMessage && <div className={fieldClassNames.error} {...errorMessageProps}>
            {errorMessage}
          </div>}
      </div>;
});
function Label({
  labelElementType,
  fieldClassNames,
  labelProps,
  label,
  labelSuffix,
  labelSuffixPosition = 'spaced',
  required
}) {
  if (!label) {
    return null;
  }
  const ElementType = labelElementType || 'label';
  const labelNode = <ElementType className={fieldClassNames.label} {...labelProps}>
      {label}
      {required && <span className="text-danger"> *</span>}
    </ElementType>;
  if (labelSuffix) {
    return <div className={clsx('mb-4 flex w-full gap-4', labelSuffixPosition === 'spaced' ? 'items-end' : 'items-center')}>
        {labelNode}
        <div className={clsx('text-xs text-muted', labelSuffixPosition === 'spaced' ? 'ml-auto' : '')}>
          {labelSuffix}
        </div>
      </div>;
  }
  return labelNode;
}
function Append({
  children,
  style,
  disabled
}) {
  return React.cloneElement(children, {
    ...children.props,
    disabled: children.props.disabled || disabled,
    // make sure append styles are not overwritten with empty values
    ...removeEmptyValuesFromObject(style)
  });
}