import { m } from 'framer-motion';
import clsx from 'clsx';
import { opacityAnimation } from '@ui/animation/opacity-animation';
export function Underlay({
  position = 'absolute',
  className,
  isTransparent = false,
  isBlurred = true,
  disableInitialTransition,
  ...domProps
}) {
  return <m.div {...domProps} className={clsx(className, !isTransparent && 'bg-background/80', 'inset-0 z-10 h-full w-full', position, isBlurred && 'backdrop-blur-sm')} aria-hidden initial={disableInitialTransition ? undefined : {
    opacity: 0
  }} animate={{
    opacity: 1
  }} exit={{
    opacity: 0
  }} {...opacityAnimation} transition={{
    duration: 0.15
  }} />;
}