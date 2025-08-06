import { FormProvider } from 'react-hook-form';
export function Form({
  children,
  onBeforeSubmit,
  onSubmit,
  form,
  className,
  id,
  onBlur
}) {
  return <FormProvider {...form}>
      <form id={id} onBlur={onBlur} className={className} onSubmit={e => {
      // prevent parent forms from submitting, if nested
      e.stopPropagation();
      onBeforeSubmit?.();
      form.handleSubmit(onSubmit)(e);
    }}>
        {children}
      </form>
    </FormProvider>;
}