export function AccountSettingsPanel({
  id,
  title,
  titleSuffix,
  children,
  actions
}) {
  return <section id={id} className="px-3 md:px-8 lg:px-12 min-h-[75vh]">
    {/* <div className="flex items-center ">
      <h2 className="text-lg normal-heading">{title}</h2>
      {titleSuffix && <div className="ml-auto">{titleSuffix}</div>}
    </div> */}
    <div className="border-b border-[rgba(0,0,0,.1)]  py-6 lg:py-8 space-y-4 lg:space-y-6">{children}</div>

    {actions && <div className="mt-4 flex justify-center items-center">{actions}</div>}
  </section>;
}