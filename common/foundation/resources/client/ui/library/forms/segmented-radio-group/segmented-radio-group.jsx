import { Children, cloneElement, forwardRef, isValidElement, useId, useRef } from 'react';
import { ActiveIndicator } from './active-indicator';
import { useControlledState } from '@react-stately/utils';
import clsx from 'clsx';
export const SegmentedRadioGroup = forwardRef((props, ref) => {
  const {
    children,
    size,
    className
  } = props;
  const id = useId();
  const name = props.name || id;
  const labelsRef = useRef({});
  const [selectedValue, setSelectedValue] = useControlledState(props.value, props.defaultValue, props.onChange);
  return <fieldset ref={ref} className={clsx(className, props.width ?? 'w-min')}>
      <div className="relative isolate flex rounded bg-chip p-4">
        <ActiveIndicator selectedValue={selectedValue} labelsRef={labelsRef} />
        {Children.map(children, (child, index) => {
        if (isValidElement(child)) {
          return cloneElement(child, {
            isFirst: index === 0,
            name,
            size,
            onChange: e => {
              setSelectedValue(e.target.value);
              child.props.onChange?.(e);
            },
            labelRef: el => {
              if (el) {
                labelsRef.current[child.props.value] = el;
              }
            },
            isSelected: selectedValue === child.props.value
          });
        }
      })}
      </div>
    </fieldset>;
});