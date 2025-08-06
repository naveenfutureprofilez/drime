import React from 'react';
import clsx from 'clsx';
export function IllustratedMessage({
  image,
  title,
  description,
  action,
  className,
  size = 'md',
  imageHeight,
  imageMargin = 'mb-24'
}) {
  const style = getSizeClassName(size, imageHeight);
  return <div className={clsx('text-center', className)}>
      {image && <div className={clsx(style.image, imageMargin)}>{image}</div>}
      {title && <div className={clsx(style.title, 'mb-2 text-main')}>{title}</div>}
      {description && <div className={clsx(style.description, 'text-muted')}>
          {description}
        </div>}
      {action && <div className="mt-20">{action}</div>}
    </div>;
}
function getSizeClassName(size, imageHeight) {
  switch (size) {
    case 'xs':
      return {
        image: imageHeight || 'h-60',
        title: 'text-sm',
        description: 'text-xs'
      };
    case 'sm':
      return {
        image: imageHeight || 'h-80',
        title: 'text-base',
        description: 'text-sm'
      };
    default:
      return {
        image: imageHeight || 'h-128',
        title: 'text-lg',
        description: 'text-base'
      };
  }
}