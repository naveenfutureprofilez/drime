import { FilterControlType } from '../backend-filter';
import { forwardRef } from 'react';
import { Button } from '@ui/buttons/button';
import { KeyboardArrowDownIcon } from '@ui/icons/material/KeyboardArrowDown';
import { Trans } from '@ui/i18n/trans';
import clsx from 'clsx';
export const FilterListTriggerButton = forwardRef((props, ref) => {
  // pass through all props from menu trigger and dialog trigger to button
  const {
    isInactive,
    filter,
    ...domProps
  } = props;
  if (isInactive) {
    return <InactiveFilterButton filter={filter} {...domProps} ref={ref} />;
  }
  return <ActiveFilterButton filter={filter} {...domProps} ref={ref} />;
});
export const InactiveFilterButton = forwardRef(({
  filter,
  ...domProps
}, ref) => {
  return <Button variant="outline" size="xs" color="paper" radius="rounded-md" border="border" ref={ref} endIcon={<KeyboardArrowDownIcon />} {...domProps}>
      <Trans {...filter.label} />
    </Button>;
});
export const ActiveFilterButton = forwardRef(({
  filter,
  children,
  ...domProps
}, ref) => {
  const isBoolean = filter.control.type === FilterControlType.BooleanToggle;
  return <Button variant="outline" size="xs" color="primary" radius="rounded-r-md" border="border-y border-r" endIcon={!isBoolean && <KeyboardArrowDownIcon />} ref={ref} {...domProps}>
      <span className={clsx(!isBoolean && 'mr-8 border-r border-r-primary-light pr-8')}>
        <Trans {...filter.label} />
      </span>
      {children}
    </Button>;
});