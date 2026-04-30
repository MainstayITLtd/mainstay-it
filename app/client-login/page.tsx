export default function ClientLogin() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute left-[-20%] top-[-20%] h-[800px] w-[800px] rounded-full bg-blue-500/15 blur-[180px]" />
        <div className="absolute right-[-15%] bottom-[-20%] h-[800px] w-[800px] rounded-full bg-emerald-400/12 blur-[190px]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-8">
        <header className="flex items-center justify-between">
          <a href="/">
            <img
              src="/Logo%20290426.jpeg"
              className="h-20 w-auto drop-shadow-[0_0_22px_rgba(255,255,255,0.25)] md:h-24"
              alt="Mainstay IT"
            />
          </a>

          <a href="/" className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm text-zinc-200 hover:bg-white hover:text-black">
            Back to website
          </a>
        </header>

        <section className="flex flex-1 items-center justify-center py-20">
          <div className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-white/[0.07] p-8 text-center shadow-2xl backdrop-blur-xl md:p-12">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500">
              Client Portal
            </p>

            <h1 className="text-5xl font-bold tracking-tight">
              Access your support portal.
            </h1>

            <p className="mx-auto mt-5 max-w-xl leading-7 text-zinc-300">
              Existing Mainstay IT clients can raise support tickets, check ticket progress and manage support requests through the client portal.
            </p>

            <div className="mt-8 grid gap-4 rounded-3xl bg-black/30 p-5 text-left">
              <div className="flex justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <span className="text-zinc-300">Raise a support ticket</span>
                <span className="text-emerald-300">✓</span>
              </div>
              <div className="flex justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <span className="text-zinc-300">Track existing requests</span>
                <span className="text-emerald-300">✓</span>
              </div>
              <div className="flex justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <span className="text-zinc-300">Contact Mainstay IT support</span>
                <span className="text-emerald-300">✓</span>
              </div>
            </div>

            <a
              href="http://support.mainstayit.co.uk/tickets"
              className="mt-8 inline-block rounded-full bg-white px-8 py-3 font-semibold text-black hover:bg-zinc-200"
            >
              Open Client Portal
            </a>

            <p className="mt-6 text-sm text-zinc-500">
              Need help accessing the portal? Email support@mainstayit.co.uk
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}