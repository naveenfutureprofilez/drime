import React from 'react';
import clsx from 'clsx';
export function ButtonGroup({
  children,
  color,
  variant,
  radius = 'rounded-button',
  size,
  className,
  value,
  onChange,
  multiple,
  disabled
}) {
  const isActive = childValue => {
    // assume that button group is not used as a toggle group, if there is no value given
    if (value === undefined) return false;
    if (multiple) {
      return value.includes(childValue);
    }
    return childValue === value;
  };
  const toggleMultipleValue = childValue => {
    const newValue = [...value];
    const childIndex = value.indexOf(childValue);
    if (childIndex > -1) {
      newValue.splice(childIndex, 1);
    } else {
      newValue.push(childValue);
    }
    return newValue;
  };
  const buttons = React.Children.map(children, (button, i) => {
    if (React.isValidElement(button)) {
      const active = isActive(button.props.value);
      const adjustedColor = active ? 'primary' : color;
      return React.cloneElement(button, {
        color: active ? 'primary' : color,
        variant,
        size,
        radius: null,
        disabled: button.props.disabled || disabled,
        ...button.props,
        onClick: e => {
          if (button.props.onClick) {
            button.props.onClick(e);
          }
          if (!onChange) return;
          if (multiple) {
            onChange?.(toggleMultipleValue(button.props.value));
          } else {
            onChange?.(button.props.value);
          }
        },
        className: clsx(button.props.className,
        // borders are hidden via negative margin, make sure both are visible for active item
        active ? 'z-20' : 'z-10', getStyle(i, children, radius, adjustedColor))
      });
    }
  });
  return <div className={clsx(radius, 'isolate inline-flex', className)}>
      {buttons}
    </div>;
}
function getStyle(i, children, radius, color) {
  // first
  if (i === 0) {
    return clsx(radius, 'rounded-tr-none rounded-br-none', !color && 'border-r-transparent disabled:border-r-transparent');
  }
  // last
  if (i === children.length - 1) {
    return clsx(radius, 'rounded-tl-none rounded-bl-none -ml-1');
  }
  return clsx('rounded-none -ml-1', !color && 'border-r-transparent disabled:border-r-transparent');
}