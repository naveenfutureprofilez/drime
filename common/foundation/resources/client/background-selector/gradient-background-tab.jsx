import { Trans } from '@ui/i18n/trans';
import { DialogTrigger } from '@ui/overlays/dialog/dialog-trigger';
import { GradientIcon } from '@ui/icons/material/Gradient';
import { Dialog } from '@ui/overlays/dialog/dialog';
import { DialogHeader } from '@ui/overlays/dialog/dialog-header';
import { DialogBody } from '@ui/overlays/dialog/dialog-body';
import { DialogFooter } from '@ui/overlays/dialog/dialog-footer';
import { Button } from '@ui/buttons/button';
import { useDialogContext } from '@ui/overlays/dialog/dialog-context';
import { useCallback, useState } from 'react';
import clsx from 'clsx';
import { ColorPickerDialog } from '@ui/color-picker/color-picker-dialog';
import { IconButton } from '@ui/buttons/icon-button';
import { ArrowDownwardIcon } from '@ui/icons/material/ArrowDownward';
import { ArrowForwardIcon } from '@ui/icons/material/ArrowForward';
import { Tooltip } from '@ui/tooltip/tooltip';
import { ArrowUpwardIcon } from '@ui/icons/material/ArrowUpward';
import { BaseGradientBg, GradientBackgrounds } from '@common/background-selector/gradient-backgrounds';
import { BackgroundSelectorButton } from '@common/background-selector/background-selector-button';
export function GradientBackgroundTab({
  value,
  onChange,
  className,
  isInsideDialog
}) {
  return <div className={className}>
      <CustomGradientButton value={value} onChange={onChange} isInsideDialog={isInsideDialog} />
      {GradientBackgrounds.map(gradient => <BackgroundSelectorButton key={gradient.backgroundImage} label={gradient.label && <Trans {...gradient.label} />} isActive={value?.id === gradient.id} style={{
      backgroundImage: gradient.backgroundImage
    }} onClick={() => {
      onChange?.({
        ...BaseGradientBg,
        ...gradient
      });
    }} />)}
    </div>;
}
function CustomGradientButton({
  value,
  onChange,
  isInsideDialog
}) {
  const isCustomGradient = value?.id === BaseGradientBg.id;
  return <DialogTrigger type="popover" value={value} onValueChange={newValue => onChange?.(newValue)} alwaysReturnCurrentValueOnClose={isInsideDialog} onOpenChange={isOpen => {
    // on dialog open set default gradient as active, if no other gradient is selected
    if (isOpen && !value) {
      onChange?.(GradientBackgrounds[0]);
    }
  }} onClose={gradient => onChange?.(gradient)}>
      <BackgroundSelectorButton label={<Trans {...BaseGradientBg.label} />} className="border-2 border-dashed" style={{
      backgroundImage: isCustomGradient ? value?.backgroundImage : undefined
    }}>
        <span className="inline-block rounded bg-black/20 p-10 text-white">
          <GradientIcon size="lg" />
        </span>
      </BackgroundSelectorButton>
      <CustomGradientDialog hideFooter={isInsideDialog} />
    </DialogTrigger>;
}
function CustomGradientDialog({
  hideFooter
}) {
  const {
    close,
    value: dialogValue,
    setValue
  } = useDialogContext();
  const [state, setLocalState] = useState(() => {
    const parts = dialogValue?.backgroundImage?.match(/\(([0-9]+deg),.?(.+?),.?(.+?)\)/) || [];
    return {
      angle: parts[1] || '45deg',
      colorOne: parts[2] || '#ff9a9e',
      colorTwo: parts[3] || '#fad0c4'
    };
  });
  const buildGradientBackground = s => {
    return {
      ...BaseGradientBg,
      backgroundImage: `linear-gradient(${s.angle}, ${s.colorOne}, ${s.colorTwo})`
    };
  };
  const setState = useCallback(newValues => {
    const newState = {
      ...state,
      ...newValues
    };
    setLocalState(newState);
    setValue(buildGradientBackground(newState));
  }, [state, setValue]);
  return <Dialog size="sm">
      <DialogHeader>
        <Trans message="Custom gradient" />
      </DialogHeader>
      <DialogBody>
        <div className="mb-6">
          <Trans message="Colors" />
        </div>
        <div className="mb-20 flex h-40 items-stretch">
          <ColorPickerButton className="rounded-input" value={state.colorOne} onChange={value => setState({
          colorOne: value
        })} />
          <div className="flex-auto border-y border-[#c3cbdc]" style={{
          backgroundImage: buildGradientBackground(state).backgroundImage
        }} />
          <ColorPickerButton className="rounded-r-input" value={state.colorTwo} onChange={value => setState({
          colorTwo: value
        })} />
        </div>
        <div className="mb-6">
          <Trans message="Direction" />
        </div>
        <DirectionButtons value={state.angle} onChange={value => setState({
        angle: value
      })} />
      </DialogBody>
      {!hideFooter && <DialogFooter dividerTop>
          <Button onClick={() => close()}>
            <Trans message="Cancel" />
          </Button>
          <Button variant="flat" color="primary" onClick={() => close(buildGradientBackground(state))}>
            <Trans message="Apply" />
          </Button>
        </DialogFooter>}
    </Dialog>;
}
function ColorPickerButton({
  className,
  value,
  onChange
}) {
  return <DialogTrigger type="popover" value={value} onValueChange={onChange} alwaysReturnCurrentValueOnClose>
      <Tooltip label={<Trans message="Click to change color" />}>
        <button type="button" className={clsx('w-40 flex-shrink-0 border border-[#c3cbdc]', className)} style={{
        backgroundColor: value
      }} />
      </Tooltip>
      <ColorPickerDialog hideFooter />
    </DialogTrigger>;
}
function DirectionButtons({
  value,
  onChange
}) {
  const activeStyle = 'text-primary border-primary';
  return <div className="flex flex-wrap items-center gap-8 text-muted">
      <IconButton variant="outline" className={value === '0deg' ? activeStyle : undefined} onClick={() => onChange('0deg')}>
        <ArrowUpwardIcon />
      </IconButton>
      <IconButton variant="outline" className={value === '180deg' ? activeStyle : undefined} onClick={() => onChange('180deg')}>
        <ArrowDownwardIcon />
      </IconButton>
      <IconButton variant="outline" className={value === '90deg' ? activeStyle : undefined} onClick={() => onChange('90deg')}>
        <ArrowForwardIcon />
      </IconButton>
      <IconButton variant="outline" className={value === '135deg' ? activeStyle : undefined} onClick={() => onChange('135deg')}>
        <ArrowDownwardIcon className="-rotate-45" />
      </IconButton>
      <IconButton variant="outline" className={value === '225deg' ? activeStyle : undefined} onClick={() => onChange('225deg')}>
        <ArrowDownwardIcon className="rotate-45" />
      </IconButton>
      <IconButton variant="outline" className={value === '45deg' ? activeStyle : undefined} onClick={() => onChange('45deg')}>
        <ArrowUpwardIcon className="rotate-45" />
      </IconButton>
      <IconButton variant="outline" className={value === '325deg' ? activeStyle : undefined} onClick={() => onChange('325deg')}>
        <ArrowUpwardIcon className="-rotate-45" />
      </IconButton>
    </div>;
}