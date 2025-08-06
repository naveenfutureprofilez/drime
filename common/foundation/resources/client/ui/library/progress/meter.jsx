import React from 'react';
import { ProgressBarBase } from '@ui/progress/progress-bar-base';
export function Meter(props) {
  return <ProgressBarBase {...props} role="meter progressbar" />;
}