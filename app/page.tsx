export default function Home() {
  const services = [
    ["Managed IT Support", "Responsive day-to-day support for users, devices, servers and business systems."],
    ["Cyber Security", "MFA, endpoint protection, secure email, monitoring and practical security improvements."],
    ["Microsoft 365", "Licensing, migrations, SharePoint, OneDrive, Teams and security configuration."],
    ["Backups & Infrastructure", "Cloud backups, server support, networking and disaster recovery planning."],
  ];

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_30%)]" />

      <div className="mx-auto max-w-7xl px-6 py-8">
        <header className="mb-24 flex items-center justify-between">
          <img
            src="/Logo%20290426.jpeg"
            className="h-20 w-auto drop-shadow-[0_0_14px_rgba(255,255,255,0.22)] md:h-24"
            alt="Mainstay IT"
          />

          <a
            href="tel:07531993944"
            className="rounded-full border border-white/15 px-5 py-2 text-sm text-zinc-200 hover:bg-white hover:text-black"
          >
            07531 993944
          </a>
        </header>

        <section className="grid items-center gap-14 pb-24 pt-10 lg:grid-cols-2">
          <div>
            <p className="mb-5 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300">
              Norwich-based IT support for growing businesses
            </p>

            <h1 className="max-w-4xl text-6xl font-bold leading-[1.05] tracking-tight md:text-7xl">
              Reliable IT support for businesses that can’t afford downtime.
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-zinc-300">
              Mainstay IT helps businesses stay productive, protected and prepared with dependable support, Microsoft 365 expertise, cyber security and backup solutions.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <a
                href="mailto:support@mainstayit.co.uk"
                className="rounded-full bg-white px-7 py-3 text-center font-semibold text-black hover:bg-zinc-200"
              >
                Get support
              </a>
              <a
                href="#services"
                className="rounded-full border border-white/15 px-7 py-3 text-center font-semibold text-white hover:bg-white/10"
              >
                View services
              </a>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 shadow-2xl backdrop-blur">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Business protection</p>
                <p className="mt-1 text-3xl font-bold">Secure. Supported. Simple.</p>
              </div>
              <div className="rounded-full bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-300">
                Active
              </div>
            </div>

            <div className="space-y-4">
              {[
                "Microsoft 365 security configuration",
                "Endpoint protection and monitoring",
                "Backup and recovery planning",
                "Remote and onsite support",
              ].map((item) => (
                <div key={item} className="flex items-center justify-between rounded-2xl bg-black/35 p-4">
                  <span className="text-zinc-200">{item}</span>
                  <span className="text-emerald-300">✓</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500">
            Trusted IT Support
          </p>

          <h3 className="max-w-3xl text-3xl font-bold tracking-tight md:text-4xl">
            Supporting businesses across Norwich and surrounding areas.
          </h3>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              ["Fast response times", "Quick, straightforward support when your business needs help."],
              ["Security-first approach", "Protection built into every setup, from Microsoft 365 to endpoint security."],
              ["Clear, honest advice", "No jargon, no unnecessary upselling — just practical IT support that works."],
            ].map(([title, text]) => (
              <div key={title} className="rounded-3xl border border-white/10 bg-white/[0.05] p-7">
                <h4 className="text-xl font-bold">{title}</h4>
                <p className="mt-3 text-sm leading-6 text-zinc-400">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="services" className="py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500">
            Services
          </p>
          <h2 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">
            Practical IT services that keep your business moving.
          </h2>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {services.map(([title, text]) => (
              <div
                key={title}
                className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 transition hover:-translate-y-1 hover:bg-white/[0.09]"
              >
                <div className="mb-5 h-10 w-10 rounded-2xl bg-white/10" />
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="mt-4 text-sm leading-6 text-zinc-400">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-8 py-20 lg:grid-cols-3">
          {[
            ["Fast response", "Clear, straightforward support when your team needs help."],
            ["Security focused", "Every setup is reviewed with protection and resilience in mind."],
            ["Business ready", "Support that scales as your systems, users and requirements grow."],
          ].map(([title, text]) => (
            <div key={title} className="rounded-3xl bg-zinc-950 p-7">
              <h3 className="text-2xl font-bold">{title}</h3>
              <p className="mt-3 leading-7 text-zinc-400">{text}</p>
            </div>
          ))}
        </section>

        <section className="mb-20 rounded-[2rem] bg-white p-8 text-black md:p-12">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-zinc-500">
                Contact
              </p>
              <h2 className="mt-4 text-4xl font-bold tracking-tight">
                Ready to improve your IT support?
              </h2>
              <p className="mt-5 max-w-xl leading-7 text-zinc-700">
                Speak to Mainstay IT about managed support, Microsoft 365, cyber security, backups or a smooth transition from your current provider.
              </p>
            </div>

            <div className="rounded-3xl bg-zinc-100 p-6">
              <p className="mb-3"><strong>Email:</strong> support@mainstayit.co.uk</p>
              <p className="mb-3"><strong>Phone:</strong> 07531 993944</p>
              <p className="mb-6"><strong>Location:</strong> Norwich</p>
              <a
                href="mailto:support@mainstayit.co.uk"
                className="block rounded-full bg-black px-6 py-3 text-center font-semibold text-white hover:bg-zinc-800"
              >
                Contact Mainstay IT
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}