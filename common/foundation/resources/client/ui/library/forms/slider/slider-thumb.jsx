import React, { useCallback, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { useGlobalListeners, useObjectRef } from '@react-aria/utils';
import { createEventHandler } from '@ui/utils/dom/create-event-handler';
export function SliderThumb({
  index,
  slider,
  isDisabled: isThumbDisabled,
  ariaLabel,
  inputRef,
  onBlur,
  fillColor = 'primary'
}) {
  const inputObjRef = useObjectRef(inputRef);
  const {
    addGlobalListener,
    removeGlobalListener
  } = useGlobalListeners();
  const {
    step,
    values,
    focusedThumb,
    labelId,
    thumbIds,
    isDisabled: isSliderDisabled,
    getThumbPercent,
    getThumbMinValue,
    getThumbMaxValue,
    getThumbValueLabel,
    setThumbValue,
    updateDraggedThumbs,
    isThumbDragging,
    setThumbEditable,
    setFocusedThumb,
    isPointerOver,
    showThumbOnHoverOnly,
    thumbSize = 'w-18 h-18'
  } = slider;
  const isDragging = isThumbDragging(index);
  const value = values[index];

  // Immediately register editability with the state
  setThumbEditable(index, !isThumbDisabled);
  const isDisabled = isThumbDisabled || isSliderDisabled;
  const focusInput = useCallback(() => {
    if (inputObjRef.current) {
      inputObjRef.current.focus({
        preventScroll: true
      });
    }
  }, [inputObjRef]);

  // we will focus the native range input when slider is clicked or thumb is
  // focused in some other way, and let browser handle keyboard interactions
  const isFocused = focusedThumb === index;
  useEffect(() => {
    if (isFocused) {
      focusInput();
    }
  }, [isFocused, focusInput]);
  const currentPointer = useRef(undefined);
  const handlePointerUp = e => {
    if (e.pointerId === currentPointer.current) {
      focusInput();
      updateDraggedThumbs(index, false);
      removeGlobalListener(window, 'pointerup', handlePointerUp, false);
    }
  };
  const className = clsx('outline-none rounded-full top-1/2 -translate-y-1/2 -translate-x-1/2 absolute inset-0 transition-button duration-200', thumbSize, !isDisabled && 'shadow-md', thumbColor({
    fillColor,
    isDisabled,
    isDragging: isDragging
  }),
  // show thumb on hover and while dragging, otherwise "blur" event will fire on thumb and dragging will stop
  !showThumbOnHoverOnly || showThumbOnHoverOnly && isDragging || isPointerOver ? 'visible' : 'invisible');
  return <div role="presentation" className={className} style={{
    left: `${Math.max(getThumbPercent(index) * 100, 0)}%`
  }} onPointerDown={e => {
    if (e.button !== 0 || e.altKey || e.ctrlKey || e.metaKey) {
      return;
    }
    focusInput();
    currentPointer.current = e.pointerId;
    updateDraggedThumbs(index, true);
    addGlobalListener(window, 'pointerup', handlePointerUp, false);
  }}>
      <input id={thumbIds[index]} onKeyDown={createEventHandler(() => {
      updateDraggedThumbs(index, true);
    })} onKeyUp={createEventHandler(() => {
      // make sure "onChangeEnd" is fired on keyboard navigation
      updateDraggedThumbs(index, false);
    })} ref={inputObjRef} tabIndex={!isDisabled ? 0 : undefined} min={getThumbMinValue(index)} max={getThumbMaxValue(index)} step={step} value={value} disabled={isDisabled} aria-label={ariaLabel} aria-labelledby={labelId} aria-orientation="horizontal" aria-valuetext={getThumbValueLabel(index)} onFocus={() => {
      setFocusedThumb(index);
    }} onBlur={e => {
      setFocusedThumb(undefined);
      updateDraggedThumbs(index, false);
      onBlur?.(e);
    }} onChange={e => {
      setThumbValue(index, parseFloat(e.target.value));
    }} type="range" className="sr-only" />
    </div>;
}
function thumbColor({
  isDisabled,
  isDragging,
  fillColor
}) {
  if (isDisabled) {
    return 'bg-slider-disabled cursor-default';
  }
  if (fillColor && fillColor !== 'primary') {
    return fillColor;
  }
  return clsx('hover:bg-primary-dark', isDragging ? 'bg-primary-dark' : 'bg-primary');
}