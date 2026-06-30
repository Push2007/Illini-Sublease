export function LegalShell({
  title,
  updated,
  children,
}: {
  title: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-[#13294B]">{title}</h1>
      {updated && <p className="mt-2 text-sm text-zinc-400">Last updated: {updated}</p>}
      <div className="legal mt-8 space-y-5 text-sm leading-relaxed text-zinc-700 [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-zinc-900 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-5 [&_a]:text-[#E84A27] [&_a:hover]:underline [&_strong]:text-zinc-900">
        {children}
      </div>
    </main>
  );
}
