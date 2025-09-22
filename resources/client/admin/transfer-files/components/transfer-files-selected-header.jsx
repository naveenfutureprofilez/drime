import React from 'react';
import { Trans } from '@ui/i18n/trans';

export function TransferFilesSelectedHeader({ selectedItemsCount, actions }) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-sm font-medium text-blue-900">
            <Trans message=":count items selected" values={{ count: selectedItemsCount }} />
          </span>
        </div>
        <div className="flex items-center gap-3">
          {actions}
        </div>
      </div>
    </div>
  );
}
