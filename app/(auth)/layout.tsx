export default function AuthLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-black/[0.06] bg-white shadow-card lg:grid-cols-[1.05fr_0.95fr]">
        <div className="hidden bg-[linear-gradient(150deg,#ffffff_0%,#eef4ff_45%,#f5f5f7_100%)] px-10 py-12 lg:flex lg:flex-col lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
              FlowBoard
            </p>
            <h1 className="max-w-md text-4xl font-semibold tracking-tight text-ink">
              Project management essenziale, pulito e pronto al lavoro reale.
            </h1>
          </div>
          <p className="max-w-md text-sm leading-7 text-muted">
            Board, planner, roadmap e approvazione utenti in un’unica web app
            pronta per essere collegata a Supabase e deployata su Vercel.
          </p>
        </div>
        <div className="px-6 py-8 sm:px-10 sm:py-12">{children}</div>
      </div>
    </div>
  );
}
