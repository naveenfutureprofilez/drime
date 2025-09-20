import clsx from 'clsx';
import { getButtonSizeStyle } from '@ui/buttons/button-size';
export function getInputFieldClassNames(props = {}) {
  const {
    size = 'md',
    startAppend,
    endAppend,
    className,
    labelPosition,
    labelDisplay = 'block',
    wrapLabel = false,
    inputClassName,
    inputWrapperClassName,
    unstyled,
    invalid,
    disabled,
    background = 'bg-transparent',
    flexibleHeight,
    inputShadow = 'shadow-sm',
    descriptionPosition = 'bottom',
    inputRing,
    inputFontSize,
    labelSuffix
  } = {
    ...props
  };
  if (unstyled) {
    return {
      label: '',
      input: inputClassName || '',
      wrapper: className || '',
      inputWrapper: inputWrapperClassName || '',
      adornment: '',
      append: {
        size: '',
        radius: ''
      },
      size: {
        font: '',
        height: ''
      },
      description: '',
      error: ''
    };
  }
  const sizeClass = inputSizeClass({
    size: props.size,
    flexibleHeight
  });
  if (inputFontSize) {
    sizeClass.font = inputFontSize;
  }
  const isInputGroup = startAppend || endAppend;
  const ringColor = invalid ? 'focus:ring-danger/focus focus:border-danger/60' : 'focus:ring-primary/focus focus:border-primary/60';
  const ringClassName = inputRing || `focus:ring ${ringColor}`;
  const radius = getRadius(props);
  return {
    label: clsx(labelDisplay, !wrapLabel && 'whitespace-nowrap', 'first-letter:capitalize text-left', disabled && 'text-disabled', sizeClass.font, labelSuffix ? '' : labelPosition === 'side' ? 'mr-16' : 'mb-4'),
    input: clsx('block text-left relative w-full appearance-none transition-shadow text', background,
    // radius
    radius.input, getInputBorder(props), !disabled && `${ringClassName} focus:outline-none ${inputShadow}`, disabled && 'text-disabled cursor-not-allowed', inputClassName, sizeClass.font, sizeClass.height, getInputPadding(props)),
    adornment: iconSizeClass(size),
    append: {
      size: getButtonSizeStyle(size),
      radius: radius.append
    },
    wrapper: clsx(className, sizeClass.font, {
      'flex items-center': labelPosition === 'side'
    }),
    inputWrapper: clsx('isolate relative', inputWrapperClassName, isInputGroup && 'flex items-stretch'),
    size: sizeClass,
    description: `text-muted ${descriptionPosition === 'bottom' ? 'pt-4' : 'pb-4'} text-xs`,
    error: 'text-danger pt-4 text-xs'
  };
}
function getInputBorder({
  startAppend,
  endAppend,
  inputBorder,
  invalid
}) {
  if (inputBorder) return inputBorder;
  const isInputGroup = startAppend || endAppend;
  const borderColor = invalid ? 'border-danger' : 'border-divider';
  if (!isInputGroup) {
    return `${borderColor} border`;
  }
  if (startAppend) {
    return `${borderColor} border-y border-r`;
  }
  return `${borderColor} border-y border-l`;
}
function getInputPadding({
  startAdornment,
  endAdornment,
  inputRadius
}) {
  if (inputRadius === 'rounded-full') {
    return clsx(startAdornment ? 'pl-54' : 'pl-28', endAdornment ? 'pr-54' : 'pr-28');
  }
  return clsx(startAdornment ? 'pl-46' : 'pl-6', endAdornment ? 'pr-46' : 'pr-48');
}
function getRadius(props) {
  const {
    startAppend,
    endAppend,
    inputRadius
  } = props;
  const isInputGroup = startAppend || endAppend;
  if (inputRadius === 'rounded-full') {
    return {
      input: clsx(!isInputGroup && 'rounded-full', startAppend && 'rounded-r-full rounded-l-none', endAppend && 'rounded-l-full rounded-r-none'),
      append: startAppend ? 'rounded-l-full' : 'rounded-r-full'
    };
  } else if (inputRadius === 'rounded-none') {
    return {
      input: '',
      append: ''
    };
  } else if (inputRadius) {
    return {
      input: inputRadius,
      append: inputRadius
    };
  }
  return {
    input: clsx(!isInputGroup && 'rounded-input', startAppend && 'rounded-r-input rounded-l-none', endAppend && 'rounded-l-input rounded-r-none'),
    append: startAppend ? 'rounded-l-input' : 'rounded-r-input'
  };
}
function inputSizeClass({
  size,
  flexibleHeight
}) {
  switch (size) {
    case '2xs':
      return {
        font: 'text-xs',
        height: flexibleHeight ? 'min-h-24' : 'h-24'
      };
    case 'xs':
      return {
        font: 'text-xs',
        height: flexibleHeight ? 'min-h-30' : 'h-30'
      };
    case 'sm':
      return {
        font: 'text-sm',
        height: flexibleHeight ? 'min-h-36' : 'h-12'
      };
    case 'lg':
      return {
        font: 'text-md md:text-lg',
        height: flexibleHeight ? 'min-h-50' : 'h-50'
      };
    case 'xl':
      return {
        font: 'text-xl',
        height: flexibleHeight ? 'min-h-60' : 'h-60'
      };
    default:
      return {
        font: 'text-sm',
        height: flexibleHeight ? 'min-h-42' : 'h-42'
      };
  }
}
function iconSizeClass(size) {
  switch (size) {
    case '2xs':
      return 'icon-2xs';
    case 'xs':
      return 'icon-xs';
    case 'sm':
      return 'icon-sm';
    case 'md':
      return 'icon-sm';
    case 'lg':
      return 'icon-lg';
    case 'xl':
      return 'icon-xl';
    default:
      // can't return "size" variable here, append in field will not work with it
      return '';
  }
}