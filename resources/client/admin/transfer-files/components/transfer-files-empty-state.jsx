import React, { cloneElement } from 'react';

export function TransferFilesEmptyState({ emptyStateMessage, isFiltering }) {
  return (
    <div className="pt-50">
      {cloneElement(emptyStateMessage, { isFiltering })}
    </div>
  );
}