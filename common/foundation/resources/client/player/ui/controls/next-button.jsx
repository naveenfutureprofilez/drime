import { usePlayerStore } from '@common/player/hooks/use-player-store';
import { usePlayerActions } from '@common/player/hooks/use-player-actions';
import { IconButton } from '@ui/buttons/icon-button';
import { MediaNextIcon } from '@ui/icons/media/media-next';
import { Tooltip } from '@ui/tooltip/tooltip';
import { Trans } from '@ui/i18n/trans';
import React from 'react';
export function NextButton({
  size = 'md',
  iconSize,
  color,
  className,
  stopPropagation
}) {
  const player = usePlayerActions();
  const playerReady = usePlayerStore(s => s.providerReady);
  return <Tooltip label={<Trans message="Next" />} usePortal={false}>
      <IconButton disabled={!playerReady} size={size} color={color} iconSize={iconSize} className={className} onClick={e => {
      if (stopPropagation) {
        e.stopPropagation();
      }
      player.playNext();
    }}>
        <MediaNextIcon />
      </IconButton>
    </Tooltip>;
}