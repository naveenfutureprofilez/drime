export function AccountSettingsPanel({
  id,
  title,
  titleSuffix,
  children,
  actions
}) {
  return <section id={id} className="mb-2 w-full rounded-panel bg px-8 py-8">
    <div className="flex items-center gap-14 border-b pb-4">
      <h2 className="text-lg normal-heading">{title}</h2>
      {titleSuffix && <div className="ml-auto">{titleSuffix}</div>}
    </div>
    <div className="pt-4">{children}</div>
    {actions && <div className="mt-4 flex justify-center items-center">{actions}</div>}
  </section>;
}