"use client";

import { useState } from "react";

export default function ClientLogin() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [urgency, setUrgency] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const urgencyOptions = [
    "Low - general request",
    "Medium - affecting work",
    "High - urgent issue",
    "Critical - business is down",
  ];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!urgency) {
      alert("Please select an urgency.");
      setStatus("error");
      return;
    }

    setStatus("sending");

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const response = await fetch("/api/ticket", {
        method: "POST",
        body: JSON.stringify({
          name: data.get("name"),
          company: data.get("company"),
          email: data.get("email"),
          phone: data.get("phone"),
          urgency,
          summary: data.get("summary"),
          details: data.get("details"),
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setStatus("success");
        setUrgency("");
        form.reset();
      } else {
        const errorData = await response.json();
        alert(errorData.error || errorData.message || "Ticket failed");
        setStatus("error");
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Something went wrong");
      setStatus("error");
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <style>{`
        @keyframes softMove {
          0% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(35px, -25px, 0) scale(1.04); }
          100% { transform: translate3d(0, 0, 0) scale(1); }
        }
      `}</style>

      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute left-[-20%] top-[-20%] h-[850px] w-[850px] rounded-full bg-blue-500/15 blur-[190px]"
          style={{ animation: "softMove 28s ease-in-out infinite" }}
        />
        <div
          className="absolute right-[-18%] bottom-[-25%] h-[900px] w-[900px] rounded-full bg-emerald-400/14 blur-[210px]"
          style={{ animation: "softMove 34s ease-in-out infinite reverse" }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-8">
        <header className="mb-14 flex items-center justify-between">
          <a href="/">
            <img
              src="/Logo%20290426.jpeg"
              className="h-20 w-auto drop-shadow-[0_0_22px_rgba(255,255,255,0.25)] md:h-24"
              alt="Mainstay IT"
            />
          </a>

          <a
            href="/"
            className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm text-zinc-200 transition hover:bg-white hover:text-black"
          >
            Back to website
          </a>
        </header>

        <section className="grid gap-6 pb-20 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 text-center shadow-2xl backdrop-blur-xl md:p-10">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-zinc-500">
              Client Portal
            </p>

            <h1 className="text-5xl font-bold leading-tight tracking-tight md:text-6xl">
              Access your support portal.
            </h1>

            <p className="mx-auto mt-6 max-w-xl leading-7 text-zinc-300">
              Existing Mainstay IT clients can raise support tickets, check ticket progress and manage support requests through the client portal.
            </p>

            <div className="mt-8 rounded-3xl bg-black/35 p-5 text-left">
              {["Raise a support ticket", "Track existing requests", "Contact Mainstay IT support"].map((item) => (
                <div
                  key={item}
                  className="mb-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4 last:mb-0"
                >
                  <span className="text-zinc-300">{item}</span>
                  <span className="text-emerald-300">✓</span>
                </div>
              ))}
            </div>

            <a
              href="http://support.mainstayit.co.uk/tickets"
              className="mt-8 inline-block rounded-full bg-white px-8 py-3 font-semibold text-black shadow-xl transition hover:-translate-y-0.5 hover:bg-zinc-200"
            >
              Open Client Portal
            </a>

            <p className="mt-6 text-sm text-zinc-500">
              Need help accessing the portal? Email{" "}
              <a href="mailto:support@mainstayit.co.uk" className="text-emerald-300 hover:text-emerald-200">
                support@mainstayit.co.uk
              </a>
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 shadow-2xl backdrop-blur-xl md:p-10">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-emerald-300">
              Submit a Ticket
            </p>

            <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
              Submit a support ticket.
            </h2>

            <p className="mt-4 max-w-2xl leading-7 text-zinc-300">
              Fill in the form below and your request will be sent directly to the Mainstay IT support desk.
            </p>

            {status === "success" && (
              <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm font-medium text-emerald-300">
                Thanks — your support ticket has been submitted. We’ll be in touch shortly.
              </div>
            )}

            {status === "error" && (
              <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm font-medium text-red-300">
                Something went wrong. Please check the popup error or email support@mainstayit.co.uk.
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-200">Your name *</label>
                  <input type="text" name="name" required placeholder="Enter your name" className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-emerald-300" />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-200">Company name *</label>
                  <input type="text" name="company" required placeholder="Enter your company" className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-emerald-300" />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-200">Email address *</label>
                  <input type="email" name="email" required placeholder="Enter your email" className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-emerald-300" />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-200">Phone number</label>
                  <input type="tel" name="phone" placeholder="Enter your phone number" className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-emerald-300" />
                </div>
              </div>

              <div className="relative">
                <label className="mb-2 block text-sm font-medium text-zinc-200">Urgency *</label>

                <input type="hidden" name="urgency" value={urgency} />

                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left outline-none transition ${
                    dropdownOpen
                      ? "border-emerald-300 bg-emerald-400/10"
                      : "border-white/10 bg-white/[0.06] hover:border-white/20"
                  }`}
                >
                  <span className={urgency ? "text-white" : "text-zinc-500"}>
                    {urgency || "Select urgency"}
                  </span>
                  <span className={`text-emerald-300 transition ${dropdownOpen ? "rotate-180" : ""}`}>
                    ↓
                  </span>
                </button>

                {dropdownOpen && (
                  <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-[#07110d] shadow-2xl backdrop-blur-xl">
                    {urgencyOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          setUrgency(option);
                          setDropdownOpen(false);
                        }}
                        className={`block w-full px-4 py-3 text-left text-sm transition ${
                          urgency === option
                            ? "bg-emerald-400 text-black"
                            : "text-zinc-200 hover:bg-emerald-400/10 hover:text-emerald-300"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-200">Issue / Summary *</label>
                <input type="text" name="summary" required placeholder="Brief summary of the issue" className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-emerald-300" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-200">Details *</label>
                <textarea name="details" required placeholder="Please provide as much detail as possible..." className="h-28 w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-emerald-300" />
              </div>

              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full rounded-xl bg-emerald-400 px-6 py-4 font-bold text-black transition hover:-translate-y-0.5 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "sending" ? "Submitting ticket..." : "Submit Ticket"}
              </button>

              <p className="text-center text-sm text-zinc-500">
                Your information is secure and will only be used to process your support request.
              </p>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}