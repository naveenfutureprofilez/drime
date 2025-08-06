import { useAppearanceEditorValues } from '@common/admin/appearance/requests/use-appearance-editor-values';
import { useForm, useWatch } from 'react-hook-form';
import { AppearanceEditorForm } from '@common/admin/appearance/appearance-editor-form';
import { Outlet, useLocation, useParams } from 'react-router';
import { AppearanceEditorBreadcrumb } from '@common/admin/appearance/appearance-editor-breadcrumb';
import { Trans } from '@ui/i18n/trans';
export function ThemeEditorForm() {
  const values = useAppearanceEditorValues();
  const form = useForm({
    defaultValues: {
      appearance: {
        themes: values.appearance.themes.filter(t => t.type === 'site')
      }
    }
  });
  return <AppearanceEditorForm form={form} breadcrumb={<ThemeEditorBreadcrumb form={form} />} blockerAllowedPath="themes">
      <Outlet />
    </AppearanceEditorForm>;
}
export function ThemeEditorBreadcrumb({
  form,
  children
}) {
  const {
    pathname
  } = useLocation();
  const lastSegment = pathname.split('/').pop();
  const {
    themeIndex
  } = useParams();
  const allThemes = useWatch({
    control: form.control,
    name: 'appearance.themes'
  });
  const activeTheme = themeIndex ? allThemes[themeIndex] : null;
  return <AppearanceEditorBreadcrumb>
      {children}
      <Trans message="Themes" />
      {activeTheme && <span>{activeTheme.name}</span>}
      {lastSegment === 'font' && <Trans message="Font" />}
      {lastSegment === 'radius' && <Trans message="Rounding" />}
    </AppearanceEditorBreadcrumb>;
}