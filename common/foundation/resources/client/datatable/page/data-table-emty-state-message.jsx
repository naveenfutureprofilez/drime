import React from 'react';
import { IllustratedMessage } from '@ui/images/illustrated-message';
import { SvgImage } from '@ui/images/svg-image';
import { Trans } from '@ui/i18n/trans';
import { useIsMobileMediaQuery } from '@ui/utils/hooks/is-mobile-media-query';
export function DataTableEmptyStateMessage({
  isFiltering,
  title,
  filteringTitle,
  image,
  size,
  className
}) {
  const isMobile = useIsMobileMediaQuery();
  if (!size) {
    size = isMobile ? 'sm' : 'md';
  }

  // allow user to disable filtering message variation by not passing in "filteringTitle"
  return <IllustratedMessage className={className} size={size} image={<SvgImage src={image} />} title={isFiltering && filteringTitle ? filteringTitle : title} description={isFiltering && filteringTitle ? <Trans message="Try another search query or different filters" /> : undefined} />;
}