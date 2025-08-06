import axios from 'axios';
import { showHttpErrorToast } from '@common/http/show-http-error-toast';
export function onFormQueryError(r, form) {
  if (form && axios.isAxiosError(r) && r.response) {
    const response = r.response.data;
    if (errorsAreEmpty(response.errors)) {
      showHttpErrorToast(r);
    } else {
      Object.entries(response.errors || {}).forEach(([key, errors], index) => {
        if (typeof errors === 'string') {
          form.setError(key, {
            message: errors
          }, {
            shouldFocus: index === 0
          });
        } else {
          errors.forEach((message, subIndex) => {
            form.setError(key, {
              message
            }, {
              shouldFocus: index === 0 && subIndex === 0
            });
          });
        }
      });
    }
  }
}
function errorsAreEmpty(errors) {
  return !errors || Array.isArray(errors) && errors.length === 0 || Object.keys(errors).length === 0;
}