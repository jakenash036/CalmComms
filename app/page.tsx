import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-100">
      {/* Hero */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-xl font-bold text-slate-900">CalmComms</span>
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-700 hover:text-slate-900"
            >
              Sign in
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Professional school communication,{" "}
          <span className="text-blue-600">made easy</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
          CalmComms helps school staff transform rough notes into clear, neutral,
          parent-friendly communication — instantly. Built specifically for SEND,
          SEMH, AP, pastoral, and behaviour settings across the UK.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/login"
            className="rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-700"
          >
            Sign in to your account
          </Link>
          <a
            href="#features"
            className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Learn more
          </a>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-slate-200 bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold text-slate-900">
            Why schools choose CalmComms
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-slate-600">
            Designed for educational settings where communication matters most.
          </p>

          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              title="Instant rewrites"
              description="Paste rough staff notes and receive clear, professional communication in seconds — suitable for parents, carers, and internal records."
            />
            <FeatureCard
              title="School-safe by design"
              description="Built-in safeguarding detection blocks sensitive content automatically. Safety-first approach aligned with UK education policy."
            />
            <FeatureCard
              title="Admin accounts for schools"
              description="School administrators can create and manage staff accounts, set usage limits, and oversee their entire team from a single dashboard."
            />
            <FeatureCard
              title="SEND & SEMH focused"
              description="Tone and language specifically calibrated for special educational needs, social-emotional-mental-health, and alternative provision settings."
            />
            <FeatureCard
              title="Usage tracking"
              description="Monitor how many rewrites each staff member uses per month. Set custom limits per account to manage costs effectively."
            />
            <FeatureCard
              title="Multiple output types"
              description="Generate parent-friendly versions, internal record versions, or both — tailored to your exact communication needs."
            />
          </div>
        </div>
      </section>

      {/* CTA for schools */}
      <section className="border-t border-slate-200 bg-slate-50 py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold text-slate-900">
            Built for schools, academies &amp; trusts
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600">
            CalmComms is designed for larger school accounts. Administrators get a
            dedicated dashboard to manage all staff accounts under one
            organisation — create accounts, set individual usage limits, and
            maintain full oversight.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-block rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
          >
            Get started today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} CalmComms. School-safe communication rewriting assistant.</p>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
    </div>
  );
}
