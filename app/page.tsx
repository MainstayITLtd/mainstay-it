export default function Home() {
  const services = [
    ["Managed IT Support", "Fast, practical support for users, devices, servers and business systems."],
    ["Cyber Security", "MFA, endpoint protection, email security, monitoring and risk reduction."],
    ["Microsoft 365", "Licensing, migrations, SharePoint, OneDrive, Teams and secure configuration."],
    ["Backup & Recovery", "Cloud backups, recovery planning, continuity checks and infrastructure support."],
  ];

  const trust = [
    ["Norwich", "Local IT support"],
    ["Fast", "Responsive service"],
    ["Secure", "Security-first setup"],
    ["Microsoft 365", "Specialists"],
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <style>{`
        @keyframes floatOne {
          0% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(45px, 35px, 0) scale(1.04); }
          100% { transform: translate3d(0, 0, 0) scale(1); }
        }
        @keyframes floatTwo {
          0% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(-40px, 30px, 0) scale(1.05); }
          100% { transform: translate3d(0, 0, 0) scale(1); }
        }
      `}</style>

      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute left-[-18%] top-[-18%] h-[850px] w-[850px] rounded-full bg-blue-500/18 blur-[180px]" style={{ animation: "floatOne 26s ease-in-out infinite" }} />
        <div className="absolute right-[-18%] top-[12%] h-[780px] w-[780px] rounded-full bg-emerald-400/14 blur-[190px]" style={{ animation: "floatTwo 32s ease-in-out infinite" }} />
        <div className="absolute bottom-[-28%] left-[25%] h-[850px] w-[850px] rounded-full bg-white/8 blur-[220px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-8">
        <header className="mb-24 flex items-center justify-between gap-6">
          <a href="/" className="flex items-center">
            <img
              src="/Logo%20290426.jpeg"
              className="h-16 w-auto object-contain mix-blend-screen brightness-125 contrast-125 drop-shadow-[0_0_18px_rgba(255,255,255,0.18)] md:h-20"
              alt="Mainstay IT"
            />
          </a>

          <div className="flex items-center gap-4">
            <a href="/client-login" className="hidden text-sm text-zinc-400 transition hover:text-white md:block">
              Client Portal
            </a>

            <a href="tel:07531993944" className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm font-medium text-zinc-100 backdrop-blur transition hover:bg-white hover:text-black">
              07531 993944
            </a>
          </div>
        </header>

        <section className="grid items-center gap-14 pb-24 pt-8 lg:grid-cols-2">
          <div>
            <p className="mb-5 inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-zinc-200 shadow-xl backdrop-blur">
              Norwich-based IT support for growing businesses
            </p>

            <h1 className="max-w-5xl text-6xl font-bold leading-[1.02] tracking-tight md:text-7xl">
              Reliable IT support for businesses that can’t afford downtime.
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-zinc-300">
              Mainstay IT helps businesses stay productive, protected and prepared with dependable support, Microsoft 365 expertise, cyber security and backup solutions.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <a href="#contact" className="rounded-full bg-white px-7 py-3 text-center font-semibold text-black shadow-xl transition hover:-translate-y-0.5 hover:bg-zinc-200">
                Get support
              </a>
              <a href="#services" className="rounded-full border border-white/15 bg-white/5 px-7 py-3 text-center font-semibold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/10">
                View services
              </a>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-8 shadow-2xl backdrop-blur-xl">
            <div className="mb-8 flex items-center justify-between gap-6">
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
                <div key={item} className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/35 p-4">
                  <span className="text-zinc-200">{item}</span>
                  <span className="text-emerald-300">✓</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 backdrop-blur md:grid-cols-4">
            {trust.map(([title, text]) => (
              <div key={title} className="rounded-3xl bg-black/25 p-6 text-center">
                <p className="text-2xl font-bold">{title}</p>
                <p className="mt-1 text-sm text-zinc-400">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="services" className="py-24">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500">Services</p>
          <h2 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">
            Practical IT services that keep your business moving.
          </h2>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {services.map(([title, text]) => (
              <div key={title} className="rounded-3xl border border-white/10 bg-white/[0.05] p-7 backdrop-blur transition hover:-translate-y-1 hover:bg-white/[0.09]">
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="mt-4 text-sm leading-6 text-zinc-400">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="contact" className="mb-20 rounded-[2rem] border border-white/10 bg-white p-8 text-black shadow-2xl md:p-12">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-zinc-500">Contact</p>
              <h2 className="mt-4 text-4xl font-bold tracking-tight">Speak to Mainstay IT</h2>
              <p className="mt-5 max-w-xl leading-7 text-zinc-700">
                Fill in the form and we’ll get back to you quickly to discuss your IT support requirements.
              </p>

              <div className="mt-8 rounded-3xl bg-zinc-100 p-6">
                <p className="mb-3"><strong>Email:</strong> support@mainstayit.co.uk</p>
                <p className="mb-3"><strong>Phone:</strong> 07531 993944</p>
                <p><strong>Location:</strong> Norwich</p>
              </div>
            </div>

            <form action="https://formspree.io/f/xrernwkk" method="POST" className="space-y-4">
              <input type="text" name="name" placeholder="Your name" required className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-black" />
              <input type="email" name="email" placeholder="Email address" required className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-black" />
              <input type="text" name="company" placeholder="Company name" className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-black" />
              <textarea name="message" placeholder="How can we help?" required className="h-36 w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-black" />

              <button type="submit" className="w-full rounded-full bg-black px-6 py-3 font-semibold text-white hover:bg-zinc-800">
                Send enquiry
              </button>
            </form>
          </div>
        </section>

        <footer className="border-t border-white/10 py-8 text-sm text-zinc-500">
          <div className="flex flex-col justify-between gap-4 md:flex-row">
            <p>© Mainstay IT. Business IT support in Norwich.</p>
            <a href="/client-login" className="hover:text-white">
              Client Portal
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}