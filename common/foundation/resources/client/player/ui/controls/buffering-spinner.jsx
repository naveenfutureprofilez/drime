import { ProgressCircle } from '@ui/progress/progress-circle';
import { usePlayerStore } from '@common/player/hooks/use-player-store';
import { AnimatePresence, m } from 'framer-motion';
import { opacityAnimation } from '@ui/animation/opacity-animation';
export function BufferingSpinner({
  className,
  trackColor,
  fillColor,
  size
}) {
  const isActive = usePlayerStore(s =>
  // YouTube will already show a spinner, no need for a custom one
  s.isBuffering && s.providerName !== 'youtube' || s.playbackStarted && !s.providerReady);
  return <AnimatePresence initial={false}>
      {isActive && <m.div {...opacityAnimation} className={className}>
          <ProgressCircle isIndeterminate trackColor={trackColor} fillColor={fillColor} size={size} />
        </m.div>}
    </AnimatePresence>;
}