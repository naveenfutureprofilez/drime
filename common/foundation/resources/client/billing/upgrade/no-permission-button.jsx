import { LockIcon } from '@ui/icons/material/Lock';
import { Trans } from '@ui/i18n/trans';
import { DialogTrigger } from '@ui/overlays/dialog/dialog-trigger';
import { Tooltip } from '@ui/tooltip/tooltip';
import { useSettings } from '@ui/settings/use-settings';
import { FeatureLockedDialog } from '@common/billing/upgrade/feature-locked-dialog';
import clsx from 'clsx';
import { IconButton } from '@ui/buttons/icon-button';
import { Button } from '@ui/buttons/button';
export function NoPermissionButton({
  message,
  className,
  iconButton
}) {
  const {
    billing
  } = useSettings();
  if (!billing.enable) {
    return <GenericButton className={className} />;
  }
  return <DialogTrigger type="popover" triggerOnHover>
      {iconButton ? <IconButton className={className} color="primary" size="sm">
          <LockIcon />
        </IconButton> : <Button variant="flat" color="primary" size="2xs" startIcon={<LockIcon />} className={className}>
          <Trans message="Upgrade" />
        </Button>}
      <FeatureLockedDialog message={message} />
    </DialogTrigger>;
}
function GenericButton({
  className
}) {
  return <Tooltip label={<Trans message="You don't have permissions to access this feature." />}>
      <LockIcon size="sm" className={clsx('text-muted', className)} />
    </Tooltip>;
}