export function highlightAllCode(el, themeMode = 'dark') {
  el.querySelectorAll('pre code').forEach(e => {
    highlightCode(e, themeMode);
  });
}
export async function highlightCode(el, themeMode = 'dark') {
  const {
    hljs
  } = await import('@common/text-editor/highlight/highlight');
  if (!el.dataset.highlighted) {
    el.classList.add(themeMode === 'dark' ? 'hljs-dark' : 'hljs-light');
    hljs.highlightElement(el);
  }
}