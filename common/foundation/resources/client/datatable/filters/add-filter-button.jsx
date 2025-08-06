import { Button } from '@ui/buttons/button';
import { FilterAltIcon } from '@ui/icons/material/FilterAlt';
import { Trans } from '@ui/i18n/trans';
import { useIsMobileMediaQuery } from '@ui/utils/hooks/is-mobile-media-query';
import { IconButton } from '@ui/buttons/icon-button';
import { DialogTrigger } from '@ui/overlays/dialog/dialog-trigger';
import { AddFilterDialog } from './add-filter-dialog';
export function AddFilterButton({
  filters,
  icon = <FilterAltIcon />,
  color = 'primary',
  variant = 'outline',
  size = 'sm',
  disabled,
  className
}) {
  const isMobile = useIsMobileMediaQuery();
  const desktopButton = <Button variant={variant} color={color} startIcon={icon} disabled={disabled} size={size} className={className}>
      <Trans message="Filter" />
    </Button>;
  const mobileButton = <IconButton color={color} size="sm" variant={variant} disabled={disabled} className={className}>
      {icon}
    </IconButton>;
  return <DialogTrigger type="popover">
      {isMobile ? mobileButton : desktopButton}
      <AddFilterDialog filters={filters} />
    </DialogTrigger>;
}