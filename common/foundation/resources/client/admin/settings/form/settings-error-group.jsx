import { useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import clsx from 'clsx';
export function SettingsErrorGroup({
  children,
  name,
  separatorBottom = true,
  separatorTop = true
}) {
  const {
    formState: {
      errors
    }
  } = useFormContext();
  const ref = useRef(null);
  const error = errors[name];
  useEffect(() => {
    if (error) {
      ref.current?.scrollIntoView({
        behavior: 'smooth'
      });
    }
  }, [error]);
  return <div className={clsx(separatorBottom && 'border-b mb-20 pb-20', separatorTop && 'border-t mt-20 pt-20', error && 'border-y-error')} ref={ref}>
      {children(!!error)}
      {error && <div className="text-danger text-sm mt-20" dangerouslySetInnerHTML={{
      __html: error.message
    }} />}
    </div>;
}