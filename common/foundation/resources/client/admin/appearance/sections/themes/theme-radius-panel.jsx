import { Trans } from '@ui/i18n/trans';
import { ButtonBase } from '@ui/buttons/button-base';
import clsx from 'clsx';
import { useFormContext } from 'react-hook-form';
import { appearanceState } from '@common/admin/appearance/appearance-store';
import { message } from '@ui/i18n/message';
import { useParams } from 'react-router';
const radiusMap = {
  'rounded-none': {
    label: message('Square'),
    value: '0px'
  },
  rounded: {
    label: message('Small'),
    value: '0.25rem'
  },
  'rounded-md': {
    label: message('Medium'),
    value: '0.375rem'
  },
  'rounded-lg': {
    label: message('Large'),
    value: '0.5rem'
  },
  'rounded-xl': {
    label: message('Larger'),
    value: '0.75rem'
  },
  'rounded-full': {
    label: message('Pill'),
    value: '9999px'
  }
};
export function ThemeRadiusPanel() {
  return <div className="space-y-24">
      <RadiusSelector label={<Trans message="Button rounding" />} name="button-radius" />
      <RadiusSelector label={<Trans message="Input rounding" />} name="input-radius" />
      <RadiusSelector label={<Trans message="Panel rounding" />} name="panel-radius" hidePill />
    </div>;
}
function RadiusSelector({
  label,
  name,
  hidePill
}) {
  const {
    themeIndex
  } = useParams();
  const {
    watch,
    setValue
  } = useFormContext();
  const formKey = `appearance.themes.${themeIndex}.values.--be-${name}`;
  const currentValue = watch(formKey);
  return <div>
      <div className="mb-10 text-sm font-semibold">{label}</div>
      <div className="grid grid-cols-3 gap-10 text-sm">
        {Object.entries(radiusMap).filter(([key]) => !hidePill || !key.includes('full')).map(([key, {
        label,
        value
      }]) => <PreviewButton key={key} radius={key} isActive={value === currentValue} onClick={() => {
        setValue(formKey, value, {
          shouldDirty: true
        });
        appearanceState().preview.setThemeValue(`--be-${name}`, value);
      }}>
              <Trans {...label} />
            </PreviewButton>)}
      </div>
    </div>;
}
function PreviewButton({
  radius,
  children,
  isActive,
  onClick
}) {
  return <ButtonBase display="block" className={clsx('h-36 border-2 hover:bg-hover', radius, isActive && 'border-primary')} onClick={onClick}>
      {children}
    </ButtonBase>;
}