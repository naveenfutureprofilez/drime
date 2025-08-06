import React from 'react';
import { useTrans } from '@ui/i18n/use-trans';
import { message } from '@ui/i18n/message';
export function DismissButton({
  onDismiss
}) {
  const {
    trans
  } = useTrans();
  const onClick = () => {
    if (onDismiss) {
      onDismiss();
    }
  };
  return <button className="sr-only" aria-label={trans(message('Dismiss'))} tabIndex={-1} onClick={onClick} />;
}