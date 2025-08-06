import { isMac } from '@react-aria/utils';
export function Keyboard({
  children,
  modifier,
  separator = '+'
}) {
  const modKey = isMac() ? <span className="text-base align-middle">⌘</span> : 'Ctrl';
  return <kbd className="text-xs text-muted">
      {modifier && <>
          {modKey}
          {separator}
        </>}
      {children}
    </kbd>;
}