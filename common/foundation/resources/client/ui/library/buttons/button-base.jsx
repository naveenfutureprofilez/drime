import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { getSharedButtonStyle } from './get-shared-button-style';
import { createEventHandler } from '@ui/utils/dom/create-event-handler';
export const ButtonBase = forwardRef((props, ref) => {
  const {
    children,
    color = null,
    variant,
    radius,
    shadow,
    whitespace,
    justify = 'justify-center',
    className,
    href,
    form,
    border,
    elementType,
    to,
    state,
    relative,
    replace,
    end,
    display,
    type = 'button',
    onClick,
    onPointerDown,
    onPointerUp,
    onKeyDown,
    ...domProps
  } = props;
  const Element = elementType || (href ? 'a' : 'button');
  const isLink = Element === 'a';
  return <Element ref={ref} form={isLink ? undefined : form} href={href} to={to} state={state} relative={relative} type={isLink ? undefined : type} replace={replace} end={end} onPointerDown={createEventHandler(onPointerDown)} onPointerUp={createEventHandler(onPointerUp)} onClick={createEventHandler(onClick)} onKeyDown={createEventHandler(onKeyDown)} className={clsx('focus-visible:ring', getSharedButtonStyle({
    variant,
    color,
    border,
    whitespace,
    display,
    shadow
  }), radius, justify, className)} {...domProps}>
    {children}
  </Element>;
});