import axios from 'axios';
export function errorStatusIs(err, status) {
  return axios.isAxiosError(err) && err.response?.status == status;
}