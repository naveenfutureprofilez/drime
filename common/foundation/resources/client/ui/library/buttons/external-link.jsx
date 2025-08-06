export const LinkStyle = 'text-link hover:underline hover:text-primary-dark focus-visible:ring focus-visible:ring-2 focus-visible:ring-offset-2 outline-none rounded transition-colors';
export function ExternalLink({
  children,
  className,
  target = '_blank',
  ...domProps
}) {
  return <a className={LinkStyle} target={target} {...domProps}>
      {children}
    </a>;
}