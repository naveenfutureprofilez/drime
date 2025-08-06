import { CheckIcon } from '@ui/icons/material/Check';
import { CloseIcon } from '@ui/icons/material/Close';
import React from 'react';
export function BooleanIndicator({
  value
}) {
  if (value) {
    return <CheckIcon className="text-positive icon-md" />;
  }
  return <CloseIcon className="text-danger icon-md" />;
}