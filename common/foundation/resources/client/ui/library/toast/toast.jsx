import { toastState } from '@ui/toast/toast-store';
export function toast(message, opts) {
  toastState().add(message, opts);
}
toast.danger = (message, opts) => {
  toastState().add(message, {
    ...opts,
    type: 'danger'
  });
};
toast.positive = (message, opts) => {
  toastState().add(message, {
    ...opts,
    type: 'positive'
  });
};
toast.loading = (message, opts) => {
  toastState().add(message, {
    ...opts,
    type: 'loading'
  });
};