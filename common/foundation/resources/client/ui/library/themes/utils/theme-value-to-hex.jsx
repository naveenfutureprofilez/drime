import { parseColor } from '@react-stately/color';
export function themeValueToHex(value) {
  try {
    return parseColor(`rgb(${value.split(' ').join(',')})`).toString('hex');
  } catch (e) {
    return value;
  }
}