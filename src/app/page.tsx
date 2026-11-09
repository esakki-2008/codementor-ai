import Link from "next/link";

const features = [
  { icon: "🎯", title: "Learn from zero", text: "Start with the fundamentals. No previous programming experience needed." },
  { icon: "✦", title: "A patient AI mentor", text: "Get concepts explained simply, with hints that help you think for yourself." },
  { icon: "⌘", title: "Practise by doing", text: "Build confidence through small exercises, examples, and knowledge checks." },
];

const steps = [
  { number: "01", title: "Choose a lesson", text: "Follow a beginner-friendly Python roadmap, one concept at a time." },
  { number: "02", title: "Understand the idea", text: "Read clear explanations and study small examples before practising." },
  { number: "03", title: "Prove it yourself", text: "Answer quick checks and learn from feedback as you progress." },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#080d18] text-white">
      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link href="/" className="text-2xl font-black tracking-tight">CodeMentor<span className="text-cyan-400">AI</span></Link>
        <div className="flex items-center gap-6 text-sm">
          <a href="#features" className="hidden text-slate-300 transition hover:text-white sm:block">Features</a>
          <a href="#how-it-works" className="hidden text-slate-300 transition hover:text-white sm:block">How it works</a>
          <div className="flex items-center gap-3"><Link href="/login" className="font-semibold text-slate-300 transition hover:text-white">Log in</Link><Link href="/register" className="rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-300">Get started <span aria-hidden="true">→</span></Link></div>
        </div>
      </nav>

      <section className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 pb-24 pt-16 md:grid-cols-2 md:pb-32 md:pt-24">
        <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="pointer-events-none absolute right-0 top-20 h-80 w-80 rounded-full bg-cyan-500/10 blur-[110px]" />
        <div className="relative z-10">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200"><span className="h-2 w-2 rounded-full bg-cyan-400" /> Your personal programming learning space</div>
          <h1 className="max-w-2xl text-5xl font-black leading-[1.08] tracking-tight md:text-7xl">Stop memorising code.<span className="mt-2 block bg-gradient-to-r from-cyan-300 via-cyan-400 to-blue-500 bg-clip-text text-transparent">Start understanding it.</span></h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-slate-400">Learn Python from zero with guided lessons, practical questions, and explanations designed to make every concept click.</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/register" className="rounded-xl bg-cyan-400 px-7 py-4 font-bold text-slate-950 shadow-lg shadow-cyan-950/30 transition hover:-translate-y-0.5 hover:bg-cyan-300">Create free account <span aria-hidden="true">→</span></Link>
            <a href="#how-it-works" className="rounded-xl border border-slate-700 px-7 py-4 font-semibold text-white transition hover:border-cyan-400/60">See how it works</a>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500"><span>✓ Beginner friendly</span><span>✓ Learn at your pace</span><span>✓ Practice focused</span></div>
        </div>

        <div className="relative mx-auto w-full max-w-xl">
          <div className="absolute inset-8 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="relative rounded-3xl border border-slate-700/80 bg-[#101827] p-5 shadow-2xl shadow-cyan-950/30 sm:p-7">
            <div className="flex items-center justify-between border-b border-slate-800 pb-5">
              <div><p className="font-bold">Your learning workspace</p><p className="mt-1 text-xs text-slate-500">PYTHON · BEGINNER PATH</p></div>
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-300">● Ready to learn</span>
            </div>
            <div className="mt-6 rounded-2xl border border-slate-800 bg-[#080d18] p-5">
              <div className="mb-4 flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-red-400/80" /><span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" /><span className="h-2.5 w-2.5 rounded-full bg-green-400/80" /><span className="ml-auto text-xs text-slate-600">first_program.py</span></div>
              <pre className="overflow-x-auto font-mono text-sm leading-8"><code><span className="text-slate-500"># Your first Python program{"\n"}</span><span className="text-violet-300">name</span><span className="text-slate-300"> = </span><span className="text-emerald-300">"Student"</span>{"\n"}<span className="text-sky-300">print</span><span className="text-slate-300">(</span><span className="text-emerald-300">"Hello, "</span><span className="text-slate-300"> + name)</span></code></pre>
              <div className="mt-5 border-t border-slate-800 pt-4"><p className="text-[10px] font-bold tracking-[0.2em] text-slate-600">OUTPUT</p><p className="mt-2 font-mono text-sm text-emerald-300">Hello, Student</p></div>
            </div>
            <div className="mt-5 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06] p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-cyan-200"><span>✦</span> Mentor note</div>
              <p className="mt-2 text-sm leading-6 text-slate-300">A variable is a named place to store information. Here, <code className="rounded bg-slate-800 px-1.5 py-0.5 text-cyan-200">name</code> stores the text Student.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mx-auto mb-12 max-w-2xl text-center"><p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">Built for understanding</p><h2 className="mt-4 text-3xl font-black md:text-4xl">A better way to begin coding.</h2><p className="mt-4 leading-7 text-slate-400">Small steps, useful practice, and support when you get stuck.</p></div>
        <div className="grid gap-5 md:grid-cols-3">
          {features.map((feature) => <article key={feature.title} className="rounded-2xl border border-slate-800 bg-[#101827] p-7 transition hover:-translate-y-1 hover:border-cyan-400/40"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400/10 text-2xl text-cyan-300">{feature.icon}</div><h3 className="mt-6 text-xl font-bold">{feature.title}</h3><p className="mt-3 leading-7 text-slate-400">{feature.text}</p></article>)}
        </div>
      </section>

      <section id="how-it-works" className="border-y border-slate-800/80 bg-[#0b1220]">
        <div className="mx-auto max-w-7xl px-6 py-20"><div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">Your path</p><h2 className="mt-4 text-3xl font-black md:text-4xl">Learn one idea at a time.</h2></div><div className="mt-12 grid gap-8 md:grid-cols-3">{steps.map((step) => <div key={step.number}><p className="font-mono text-4xl font-bold text-cyan-400/70">{step.number}</p><h3 className="mt-5 text-xl font-bold">{step.title}</h3><p className="mt-3 leading-7 text-slate-400">{step.text}</p></div>)}</div></div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-24 text-center"><p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">Ready when you are</p><h2 className="mt-4 text-3xl font-black md:text-5xl">Your coding journey starts with one lesson.</h2><p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-400">No pressure to know everything. Start with the basics and build confidence through practice.</p><Link href="/register" className="mt-8 inline-flex rounded-xl bg-cyan-400 px-8 py-4 font-bold text-slate-950 transition hover:bg-cyan-300">Start learning free →</Link></section>
      <footer className="border-t border-slate-800 px-6 py-8 text-center text-sm text-slate-500">© 2026 CodeMentor AI · Learn. Practise. Understand.</footer>
    </main>
  );
}
