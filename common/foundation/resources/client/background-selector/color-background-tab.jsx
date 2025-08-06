import { Trans } from '@ui/i18n/trans';
import { DialogTrigger } from '@ui/overlays/dialog/dialog-trigger';
import { ColorPickerDialog } from '@ui/color-picker/color-picker-dialog';
import { FormatColorFillIcon } from '@ui/icons/material/FormatColorFill';
import { BaseColorBg, ColorBackgrounds } from '@common/background-selector/color-backgrounds';
import { BackgroundSelectorButton } from '@common/background-selector/background-selector-button';
export function ColorBackgroundTab({
  value,
  onChange,
  className,
  isInsideDialog
}) {
  return <div className={className}>
      <CustomColorButton value={value} onChange={onChange} isInsideDialog={isInsideDialog} />
      {ColorBackgrounds.map(background => <BackgroundSelectorButton key={background.id} label={<Trans {...background.label} />} isActive={value?.id === background.id} style={{
      backgroundColor: background.backgroundColor
    }} onClick={() => {
      onChange?.({
        ...BaseColorBg,
        ...background
      });
    }} />)}
    </div>;
}
function CustomColorButton({
  value,
  onChange,
  isInsideDialog
}) {
  const isCustomColor = value?.id === BaseColorBg.id;
  return <DialogTrigger type="popover" alwaysReturnCurrentValueOnClose={isInsideDialog} value={value?.backgroundColor} onValueChange={newColor => {
    // set color on color picker interaction
    onChange?.({
      ...BaseColorBg,
      backgroundColor: newColor
    });
  }} onClose={newValue => {
    onChange?.({
      ...BaseColorBg,
      backgroundColor: newValue
    });
  }}>
      <BackgroundSelectorButton label={<Trans {...BaseColorBg.label} />} className="border-2 border-dashed" style={{
      backgroundColor: isCustomColor ? value?.backgroundColor : undefined
    }}>
        <span className="inline-block rounded bg-black/20 p-10 text-white">
          <FormatColorFillIcon size="lg" />
        </span>
      </BackgroundSelectorButton>
      <ColorPickerDialog hideFooter={isInsideDialog} />
    </DialogTrigger>;
}