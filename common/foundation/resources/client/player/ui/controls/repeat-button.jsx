import { usePlayerStore } from '@common/player/hooks/use-player-store';
import { usePlayerActions } from '@common/player/hooks/use-player-actions';
import { IconButton } from '@ui/buttons/icon-button';
import { MediaRepeatIcon } from '@ui/icons/media/media-repeat';
import { MediaRepeatOnIcon } from '@ui/icons/media/media-repeat-on';
import { Trans } from '@ui/i18n/trans';
import { Tooltip } from '@ui/tooltip/tooltip';
export function RepeatButton({
  size = 'md',
  iconSize,
  color,
  activeColor = 'primary',
  className
}) {
  const playerReady = usePlayerStore(s => s.providerReady);
  const repeating = usePlayerStore(s => s.repeat);
  const player = usePlayerActions();
  let label;
  if (repeating === 'all') {
    label = <Trans message="Enable repeat one" />;
  } else if (repeating === 'one') {
    label = <Trans message="Disable repeat" />;
  } else {
    label = <Trans message="Enable repeat" />;
  }
  return <Tooltip label={label}>
      <IconButton disabled={!playerReady} size={size} color={repeating ? activeColor : color} iconSize={iconSize} className={className} onClick={() => {
      player.toggleRepeatMode();
    }}>
        {repeating === 'one' ? <MediaRepeatOnIcon /> : <MediaRepeatIcon />}
      </IconButton>
    </Tooltip>;
}