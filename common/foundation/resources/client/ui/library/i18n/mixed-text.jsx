import { Trans } from '@ui/i18n/trans';
export function MixedText({
  value
}) {
  if (!value) {
    return null;
  }
  if (typeof value === 'string') {
    return <Trans message={value} />;
  }
  return <Trans {...value} />;
}