import clsx from 'clsx';
import { Trans } from '@ui/i18n/trans';
import { ImageIcon } from '@ui/icons/material/Image';
import { FormatColorFillIcon } from '@ui/icons/material/FormatColorFill';
import { GradientIcon } from '@ui/icons/material/Gradient';
import { useState } from 'react';
import { ColorBackgroundTab } from '@common/background-selector/color-background-tab';
import { GradientBackgroundTab } from '@common/background-selector/gradient-background-tab';
import { ImageBackgroundTab } from '@common/background-selector/image-background-tab/image-background-tab';
const TabMap = {
  color: ColorBackgroundTab,
  gradient: GradientBackgroundTab,
  image: ImageBackgroundTab
};
export function BackgroundSelector({
  className,
  value,
  onChange,
  tabColWidth,
  isInsideDialog,
  positionSelector = 'simple',
  diskPrefix,
  centerTabs,
  underTabs
}) {
  const [activeTab, setActiveTab] = useState(() => {
    if (value?.type === 'image') return 'image';
    if (value?.type === 'gradient') return 'gradient';
    return 'color';
  });
  const Tab = TabMap[activeTab];
  return <div className={className}>
      <TypeSelector activeTab={activeTab} onTabChange={setActiveTab} center={centerTabs} />
      {underTabs}
      <Tab value={value} onChange={onChange} isInsideDialog={isInsideDialog} positionSelector={positionSelector} diskPrefix={diskPrefix} className={clsx('grid items-start gap-14', tabColWidth || 'grid-cols-[repeat(auto-fill,minmax(90px,1fr))]')} />
    </div>;
}
function TypeSelector({
  activeTab,
  onTabChange,
  center
}) {
  return <div className={clsx('mb-20 flex items-center gap-20 border-b pb-20', center && 'justify-center')}>
      <TypeButton isActive={activeTab === 'color'} icon={<FormatColorFillIcon />} title={<Trans message="Flat color" />} onClick={() => onTabChange('color')} />
      <TypeButton isActive={activeTab === 'gradient'} icon={<GradientIcon />} title={<Trans message="Gradient" />} onClick={() => onTabChange('gradient')} />
      <TypeButton isActive={activeTab === 'image'} icon={<ImageIcon />} title={<Trans message="Image" />} onClick={() => onTabChange('image')} />
    </div>;
}
function TypeButton({
  isActive,
  icon,
  title,
  onClick
}) {
  return <div role="button" className="block" onClick={onClick}>
      <div className={clsx('mx-auto mb-8 flex h-50 w-50 items-center justify-center rounded-panel border text-muted', isActive && 'border-primary ring')}>
        {icon}
      </div>
      <div className="text-center text-sm text-primary">{title}</div>
    </div>;
}