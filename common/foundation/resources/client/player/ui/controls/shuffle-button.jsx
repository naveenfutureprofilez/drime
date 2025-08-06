import { usePlayerStore } from '@common/player/hooks/use-player-store';
import { usePlayerActions } from '@common/player/hooks/use-player-actions';
import { IconButton } from '@ui/buttons/icon-button';
import { MediaShuffleIcon } from '@ui/icons/media/media-shuffle';
import { MediaShuffleOnIcon } from '@ui/icons/media/media-shuffle-on';
import { Trans } from '@ui/i18n/trans';
import { Tooltip } from '@ui/tooltip/tooltip';
export function ShuffleButton({
  size = 'md',
  iconSize,
  color,
  activeColor = 'primary',
  className
}) {
  const playerReady = usePlayerStore(s => s.providerReady);
  const isShuffling = usePlayerStore(s => s.shuffling);
  const player = usePlayerActions();
  const label = isShuffling ? <Trans message="Disable shuffle" /> : <Trans message="Enable shuffle" />;
  return <Tooltip label={label}>
      <IconButton disabled={!playerReady} size={size} color={isShuffling ? activeColor : color} iconSize={iconSize} className={className} onClick={() => {
      player.toggleShuffling();
    }}>
        {isShuffling ? <MediaShuffleOnIcon /> : <MediaShuffleIcon />}
      </IconButton>
    </Tooltip>;
}