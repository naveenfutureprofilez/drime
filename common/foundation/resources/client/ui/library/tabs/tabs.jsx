import React, { useId, useMemo, useRef } from 'react';
import clsx from 'clsx';
import { useControlledState } from '@react-stately/utils';
import { TabContext } from '@ui/tabs/tabs-context';
export function Tabs(props) {
  const {
    size = 'md',
    children,
    className,
    isLazy,
    overflow = 'overflow-hidden'
  } = props;
  const tabsRef = useRef([]);
  const id = useId();
  const [selectedTab, setSelectedTab] = useControlledState(props.selectedTab, props.defaultSelectedTab || 0, props.onTabChange);
  const ContextValue = useMemo(() => {
    return {
      selectedTab,
      setSelectedTab,
      tabsRef,
      size,
      isLazy,
      id
    };
  }, [selectedTab, id, isLazy, setSelectedTab, size]);
  return <TabContext.Provider value={ContextValue}>
      <div className={clsx(className, overflow, 'max-w-full')}>{children}</div>
    </TabContext.Provider>;
}