import { Fragment, memo } from 'react';
import { prettyBytes } from '@ui/utils/files/pretty-bytes';
export const FormattedBytes = memo(({
  bytes
}) => {
  return <Fragment>{prettyBytes(bytes)}</Fragment>;
});