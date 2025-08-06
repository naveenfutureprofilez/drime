import { AddIcon } from '@ui/icons/material/Add';
import { Button } from '@ui/buttons/button';
import React from 'react';
import { useIsMobileMediaQuery } from '@ui/utils/hooks/is-mobile-media-query';
import { IconButton } from '@ui/buttons/icon-button';
export const DataTableAddItemButton = React.forwardRef(({
  children,
  to,
  elementType,
  onClick,
  href,
  download,
  icon,
  disabled
}, ref) => {
  const isMobile = useIsMobileMediaQuery();
  if (isMobile) {
    return <IconButton ref={ref} variant="flat" color="primary" className="flex-shrink-0" size="sm" to={to} href={href} download={download} elementType={elementType} onClick={onClick} disabled={disabled}>
          {icon || <AddIcon />}
        </IconButton>;
  }
  return <Button ref={ref} startIcon={icon || <AddIcon />} variant="flat" color="primary" size="sm" to={to} href={href} download={download} elementType={elementType} onClick={onClick} disabled={disabled}>
        {children}
      </Button>;
});