import React, { Suspense } from 'react';
import { iconGridStyle } from '@common/ui/icon-picker/icon-grid-style';
import { Skeleton } from '@ui/skeleton/skeleton';
import { useTrans } from '@ui/i18n/use-trans';
import { AnimatePresence, m } from 'framer-motion';
import { opacityAnimation } from '@ui/animation/opacity-animation';
import { TextField } from '@ui/forms/input-field/text-field/text-field';
const skeletons = [...Array(60).keys()];
const IconList = React.lazy(() => import('./icon-list'));
export default function IconPicker({
  onIconSelected
}) {
  const {
    trans
  } = useTrans();
  const [value, setValue] = React.useState('');
  return <div className="py-4">
      <TextField className="mb-20" value={value} onChange={e => {
      setValue(e.target.value);
    }} placeholder={trans({
      message: 'Search icons...'
    })} />
      <AnimatePresence mode="wait">
        <Suspense fallback={<m.div {...opacityAnimation} className={iconGridStyle.grid}>
              {skeletons.map((_, index) => <div className={iconGridStyle.button} key={index}>
                  <Skeleton variant="rect" />
                </div>)}
            </m.div>}>
          <m.div {...opacityAnimation} className={iconGridStyle.grid}>
            <IconList searchQuery={value} onIconSelected={onIconSelected} />
          </m.div>
        </Suspense>
      </AnimatePresence>
    </div>;
}