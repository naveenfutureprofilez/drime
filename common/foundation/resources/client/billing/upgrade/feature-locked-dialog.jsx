import { Trans } from '@ui/i18n/trans';
import { UpgradeDialog } from '@common/billing/upgrade/upgrade-dialog';
export function FeatureLockedDialog({
  message,
  messageSuffix
}) {
  return <UpgradeDialog message={message} messageSuffix={messageSuffix === undefined ? <Trans message="Upgrade to unlock this feature and many more." /> : messageSuffix} />;
}