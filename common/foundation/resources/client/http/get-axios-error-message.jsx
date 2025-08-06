import axios from 'axios';
export function getAxiosErrorMessage(err, field) {
  if (axios.isAxiosError(err) && err.response) {
    const response = err.response.data;
    if (field != null) {
      const fieldMessage = response.errors?.[field];
      return Array.isArray(fieldMessage) ? fieldMessage[0] : fieldMessage;
    }
    return response?.message;
  }
}