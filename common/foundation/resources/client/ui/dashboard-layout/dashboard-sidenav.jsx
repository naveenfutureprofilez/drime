import clsx from 'clsx';
import { m } from 'framer-motion';
import { cloneElement, useContext } from 'react';
import { DashboardLayoutContext } from './dashboard-layout-context';
export function DashboardSidenav({
  className,
  position,
  children,
  size = 'md',
  mode,
  overlayPosition = 'fixed',
  display = 'flex',
  overflow = 'overflow-hidden',
  forceClosed = false
}) {
  const {
    isMobileMode,
    leftSidenavStatus,
    setLeftSidenavStatus,
    rightSidenavStatus,
    setRightSidenavStatus
  } = useContext(DashboardLayoutContext);
  const isOverlayMode = isMobileMode || mode === 'overlay';
  let status = position === 'left' ? leftSidenavStatus : rightSidenavStatus;
  // on mobile always overlay full size sidebar, instead of compact
  if (isOverlayMode && status === 'compact') {
    status = 'open';
  }
  const variants = {
    open: {
      display,
      width: getAnimateSize(status === 'compact' ? 'compact' : size)
    },
    closed: {
      width: 0,
      transitionEnd: {
        display: 'none'
      }
    }
  };
  const sizeClassName = getSizeClassName(status === 'compact' ? 'compact' : size);
  return <m.div variants={variants} initial={false} animate={forceClosed || status === 'closed' ? 'closed' : 'open'} transition={{
    type: 'tween',
    duration: 0.15
  }} onClick={e => {
    // close sidenav when user clicks a link or button on mobile
    const target = e.target;
    if (isMobileMode && (target.closest('button') || target.closest('a'))) {
      setLeftSidenavStatus('closed');
      setRightSidenavStatus('closed');
    }
  }} className={clsx(className, position === 'left' ? 'dashboard-grid-sidenav-left' : 'dashboard-grid-sidenav-right', overflow, sizeClassName, isOverlayMode && `${overlayPosition} bottom-0 top-0 z-20 shadow-2xl`, isOverlayMode && position === 'left' && 'left-0', isOverlayMode && position === 'right' && 'right-0')}>
      {cloneElement(children, {
      className: clsx(children.props.className, 'w-full h-full overflow-y-auto compact-scrollbar', status === 'compact' && 'hidden-scrollbar'),
      isCompactMode: status === 'compact',
      isOverlayMode
    })}
    </m.div>;
}
function getSizeClassName(size) {
  switch (size) {
    case 'compact':
      return 'w-60';
    case 'sm':
      return 'w-224';
    case 'md':
      return 'w-240';
    case 'lg':
      return 'w-288';
    default:
      return size || '';
  }
}
function getAnimateSize(size) {
  switch (size) {
    case 'compact':
      return 60;
    case 'sm':
      return 224;
    case 'md':
      return 240;
    case 'lg':
      return 288;
    default:
      return null;
  }
}