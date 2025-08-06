import { useFormContext } from 'react-hook-form';
import { appearanceState, useAppearanceStore } from '@common/admin/appearance/appearance-store';
import { Fragment } from 'react';
import { FormTextField } from '@ui/forms/input-field/text-field/text-field';
import { Trans } from '@ui/i18n/trans';
import { FormSlider } from '@ui/forms/slider/slider';
import { DialogTrigger } from '@ui/overlays/dialog/dialog-trigger';
import { AppearanceButton } from '@common/admin/appearance/appearance-button';
import { ColorIcon } from '@common/admin/appearance/sections/themes/color-icon';
import { Link } from 'react-router';
import { FormImageSelector } from '@common/uploads/components/image-selector';
import { ColorPickerDialog } from '@ui/color-picker/color-picker-dialog';
export function LandingPageSectionGeneral() {
  return <Fragment>
      <HeaderSection />
      <div className="my-24 border-y py-24">
        <AppearanceButton to="action-buttons" elementType={Link} className="mb-20">
          <Trans message="Action buttons" />
        </AppearanceButton>
        <AppearanceButton to="primary-features" elementType={Link}>
          <Trans message="Primary features" />
        </AppearanceButton>
        <AppearanceButton to="secondary-features" elementType={Link}>
          <Trans message="Secondary features" />
        </AppearanceButton>
      </div>
      <FooterSection />
    </Fragment>;
}
function HeaderSection() {
  const defaultImage = useAppearanceStore(s => s.defaults?.settings.homepage.appearance?.headerImage);
  return <>
      <FormTextField label={<Trans message="Header title" />} className="mb-20" name="settings.homepage.appearance.headerTitle" onFocus={() => {
      appearanceState().preview.setHighlight('[data-testid="headerTitle"]');
    }} />
      <FormTextField label={<Trans message="Header subtitle" />} className="mb-30" inputElementType="textarea" rows={4} name="settings.homepage.appearance.headerSubtitle" onFocus={() => {
      appearanceState().preview.setHighlight('[data-testid="headerSubtitle"]');
    }} />
      <FormImageSelector name="settings.homepage.appearance.headerImage" className="mb-30" label={<Trans message="Header image" />} defaultValue={defaultImage} diskPrefix="homepage" />
      <FormSlider name="settings.homepage.appearance.headerImageOpacity" label={<Trans message="Header image opacity" />} minValue={0} step={0.1} maxValue={1} formatOptions={{
      style: 'percent'
    }} />
      <div className="mb-20 text-xs text-muted">
        <Trans message="In order for overlay colors to appear, header image opacity will need to be less then 100%" />
      </div>
      <ColorPickerTrigger formKey="settings.homepage.appearance.headerOverlayColor1" label={<Trans message="Header overlay color 1" />} />
      <ColorPickerTrigger formKey="settings.homepage.appearance.headerOverlayColor2" label={<Trans message="Header overlay color 2" />} />
    </>;
}
function FooterSection() {
  const defaultImage = useAppearanceStore(s => s.defaults?.settings.homepage.appearance?.footerImage);
  return <Fragment>
      <FormTextField label={<Trans message="Footer title" />} className="mb-20" name="settings.homepage.appearance.footerTitle" onFocus={() => {
      appearanceState().preview.setHighlight('[data-testid="footerTitle"]');
    }} />
      <FormTextField label={<Trans message="Footer subtitle" />} className="mb-20" name="settings.homepage.appearance.footerSubtitle" onFocus={() => {
      appearanceState().preview.setHighlight('[data-testid="footerSubtitle"]');
    }} />
      <FormImageSelector name="settings.homepage.appearance.footerImage" className="mb-30" label={<Trans message="Footer background image" />} defaultValue={defaultImage} diskPrefix="homepage" />
    </Fragment>;
}
function ColorPickerTrigger({
  label,
  formKey
}) {
  const key = formKey;
  const {
    watch,
    setValue
  } = useFormContext();
  const formValue = watch(key);
  const setColor = value => {
    setValue(formKey, value, {
      shouldDirty: true
    });
  };
  return <DialogTrigger type="popover" value={formValue} alwaysReturnCurrentValueOnClose onValueChange={newValue => setColor(newValue)} onClose={value => setColor(value)}>
      <AppearanceButton className="capitalize" startIcon={<ColorIcon viewBox="0 0 48 48" className="icon-lg" style={{
      fill: formValue
    }} />}>
        {label}
      </AppearanceButton>
      <ColorPickerDialog />
    </DialogTrigger>;
}