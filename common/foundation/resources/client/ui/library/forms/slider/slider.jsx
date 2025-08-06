import { BaseSlider } from './base-slider';
import { useSlider } from './use-slider';
import React from 'react';
import { SliderThumb } from './slider-thumb';
import { useController } from 'react-hook-form';
import { mergeProps } from '@react-aria/utils';
export function Slider({
  inputRef,
  onBlur,
  ...props
}) {
  const {
    onChange,
    onChangeEnd,
    value,
    defaultValue,
    ...otherProps
  } = props;
  const baseProps = {
    ...otherProps,
    // Normalize `value: number[]` to `value: number`
    value: value != null ? [value] : undefined,
    defaultValue: defaultValue != null ? [defaultValue] : undefined,
    onChange: v => {
      onChange?.(v[0]);
    },
    onChangeEnd: v => {
      onChangeEnd?.(v[0]);
    }
  };
  const slider = useSlider(baseProps);
  return <BaseSlider {...baseProps} slider={slider}>
      <SliderThumb fillColor={props.fillColor} index={0} slider={slider} inputRef={inputRef} onBlur={onBlur} />
    </BaseSlider>;
}
export function FormSlider({
  name,
  ...props
}) {
  const {
    field: {
      onChange,
      onBlur,
      value = '',
      ref
    }
  } = useController({
    name
  });
  const formProps = {
    onChange,
    onBlur,
    value: value || '' // avoid issues with "null" value when setting form defaults from backend model
  };
  return <Slider inputRef={ref} {...mergeProps(formProps, props)} />;
}