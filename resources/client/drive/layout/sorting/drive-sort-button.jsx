import { driveState, useDriveStore } from '../../drive-store';
import { EntriesSortButton } from './entries-sort-button';
import React from 'react';
export function DriveSortButton({
  isDisabled
}) {
  const descriptor = useDriveStore(s => s.sortDescriptor);
  return <EntriesSortButton isDisabled={isDisabled} descriptor={descriptor} onChange={value => {
    driveState().setSortDescriptor(value);
  }} />;
}