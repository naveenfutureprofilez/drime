import world from '@common/custom-domains/datatable/world.svg';
import { Trans } from '@ui/i18n/trans';
import { DataTableEmptyStateMessage } from '@common/datatable/page/data-table-emty-state-message';
import React from 'react';
export function DomainsEmptyStateMessage(props) {
  return <DataTableEmptyStateMessage {...props} image={world} title={<Trans message="No domains have been connected yet" />} filteringTitle={<Trans message="No matching domains" />} />;
}