export function getButtonSizeStyle(size, {
  padding,
  equalWidth,
  variant
} = {}) {
  switch (size) {
    case '2xs':
      if (variant === 'link') return 'text-xs';
      return `text-xs h-28 ${equalWidth ? 'w-28' : padding || 'px-12'}`;
    case 'xs':
      if (variant === 'link') return 'text-xs';
      return `text-xs h-34 ${equalWidth ? 'w-34' : padding || 'px-16'}`;
    case 'sm':
      if (variant === 'link') return 'text-sm';
      return `text-sm h-40 ${equalWidth ? 'w-40' : padding || 'px-20'}`;
    case 'md':
      if (variant === 'link') return 'text-base';
      return `text-base h-48 ${equalWidth ? 'w-48' : padding || 'px-24'}`;
    case 'lg':
      if (variant === 'link') return 'text-lg';
      return `text-base h-56 ${equalWidth ? 'w-56' : padding || 'px-28'}`;
    case 'xl':
      if (variant === 'link') return 'text-xl';
      return `text-lg h-64 ${equalWidth ? 'w-64' : padding || 'px-36'}`;
    default:
      return size || '';
  }
}