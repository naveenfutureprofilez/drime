export let rootEl = typeof document !== 'undefined' ? document.getElementById('root') ?? document.body : undefined;
export let themeEl = typeof document !== 'undefined' ? document.documentElement : undefined;
export let dialogEl = rootEl;
export function setDialogEl(el) {
  dialogEl = el;
}
export function setRootEl(el) {
  rootEl = el;
  themeEl = el;
}