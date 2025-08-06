import { Trans } from '@ui/i18n/trans';
import React from 'react';
import { HeaderLayout } from '@common/datatable/data-table-header';
export function SelectedStateDatatableHeader({
  actions,
  selectedItemsCount
}) {
  return <HeaderLayout data-testid="datatable-selected-header">
      <div className="mr-auto">
        <Trans message="[one 1 item|other :count items] selected" values={{
        count: selectedItemsCount
      }} />
      </div>
      {actions}
    </HeaderLayout>;
}