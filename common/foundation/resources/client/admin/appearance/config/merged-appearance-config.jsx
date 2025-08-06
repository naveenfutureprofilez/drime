import deepMerge from 'deepmerge';
import { DefaultAppearanceConfig } from '@common/admin/appearance/config/default-appearance-config';
import { AppAppearanceConfig } from '@app/admin/appearance/app-appearance-config';
const mergedAppearanceConfig = deepMerge.all([DefaultAppearanceConfig, AppAppearanceConfig]);
export default mergedAppearanceConfig;