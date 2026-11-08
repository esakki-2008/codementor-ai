import Link from "next/link";

const lessons = [
  { n: "01", title: "Introduction to Python", time: "15 min", state: "Start here", href: "/learn/python" },
  { n: "02", title: "Variables & data types", time: "20 min", state: "Next lesson", href: "/learn/python" },
  { n: "03", title: "Input & output", time: "15 min", state: "Coming up", href: "/learn/python" },
  { n: "04", title: "Operators", time: "20 min", state: "Coming up", href: "/learn/python" },
  { n: "05", title: "If / else statements", time: "25 min", state: "Coming up", href: "/learn/python" },
  { n: "06", title: "Loops", time: "30 min", state: "Coming up", href: "/learn/python" },
];

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return <div className="rounded-2xl border border-slate-800 bg-[#101827] p-5"><p className="text-sm text-slate-400">{label}</p><p className="mt-3 text-3xl font-black">{value}</p><p className="mt-2 text-xs text-slate-500">{note}</p></div>;
}

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-[#080d18] text-white">
      <div className="mx-auto flex min-h-screen max-w-[1500px]">
        <aside className="hidden w-64 shrink-0 border-r border-slate-800 bg-[#0b1220] p-6 md:block">
          <Link href="/" className="text-xl font-black">CodeMentor<span className="text-cyan-400">AI</span></Link>
          <p className="mb-4 mt-12 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-600">Workspace</p>
          <nav className="space-y-2 text-sm">
            <Link href="/dashboard" className="block rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-cyan-200">◈ Dashboard</Link>
            <a href="#roadmap" className="block rounded-xl px-4 py-3 text-slate-400 transition hover:bg-slate-800 hover:text-white">▤ My learning</a>
            <a href="#challenge" className="block rounded-xl px-4 py-3 text-slate-400 transition hover:bg-slate-800 hover:text-white">⚡ Daily challenge</a>
          </nav>
          <div className="mt-16 rounded-2xl border border-slate-800 bg-[#101827] p-4"><div className="text-xl">✦</div><p className="mt-3 font-bold">Need a hand?</p><p className="mt-2 text-sm leading-6 text-slate-400">Your learning space is designed to help you understand, not just copy.</p><Link href="/learn/python" className="mt-4 inline-block text-sm font-semibold text-cyan-300">Open a lesson →</Link></div>
        </aside>

        <section className="min-w-0 flex-1 px-5 py-7 sm:px-8 lg:px-10">
          <header className="flex items-center justify-between gap-4"><div><Link href="/" className="text-sm font-bold text-cyan-300 md:hidden">CodeMentor AI</Link><p className="mt-2 text-sm text-slate-500">YOUR LEARNING SPACE</p><h1 className="mt-2 text-2xl font-black sm:text-3xl">Welcome back, learner <span aria-hidden="true">👋</span></h1><p className="mt-2 text-sm text-slate-400">A little progress every day adds up. Ready for the next step?</p></div><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 font-bold text-cyan-200">S</div></header>

          <div className="mt-8 grid gap-4 sm:grid-cols-3"><Metric label="Learning progress" value="0%" note="Your journey starts here" /><Metric label="Lessons completed" value="0" note="Complete your first lesson" /><Metric label="Learning streak" value="0 days" note="Build a steady habit" /></div>

          <div className="mt-8 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
            <section className="relative overflow-hidden rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-[#10243a] to-[#101827] p-6 sm:p-8"><div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" /><div className="relative"><p className="text-xs font-bold tracking-[0.2em] text-cyan-300">YOUR FIRST COURSE</p><div className="mt-4 flex items-start justify-between gap-4"><div><h2 className="text-2xl font-black sm:text-3xl">Python for Beginners</h2><p className="mt-3 max-w-lg leading-7 text-slate-300">Build a strong foundation, from your first print statement to writing your own functions.</p></div><span className="hidden text-5xl sm:block">🐍</span></div><div className="mt-7 flex flex-wrap items-center gap-4"><Link href="/learn/python" className="rounded-xl bg-cyan-400 px-6 py-3 font-bold text-slate-950 transition hover:bg-cyan-300">Start first lesson →</Link><span className="text-xs text-slate-400">Beginner · Self-paced</span></div></div></section>
            <section id="challenge" className="rounded-2xl border border-slate-800 bg-[#101827] p-6"><p className="text-xs font-bold tracking-[0.2em] text-amber-300">⚡ QUICK CHECK</p><h2 className="mt-3 text-xl font-bold">Ready to meet Python?</h2><p className="mt-3 text-sm leading-6 text-slate-400">Your first lesson introduces Python and shows how a simple instruction becomes output on the screen.</p><div className="mt-5 rounded-xl border border-slate-700 bg-[#080d18] p-4 font-mono text-sm"><span className="text-sky-300">print</span><span className="text-slate-300">(</span><span className="text-emerald-300">"Hello, world!"</span><span className="text-slate-300">)</span></div><Link href="/learn/python" className="mt-5 inline-flex text-sm font-semibold text-cyan-300">Explore the lesson →</Link></section>
          </div>

          <section id="roadmap" className="mt-10"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold tracking-[0.2em] text-cyan-400">THE ROADMAP</p><h2 className="mt-2 text-2xl font-black">Python learning path</h2><p className="mt-2 text-sm text-slate-400">Start at the beginning. Each topic builds on the previous one.</p></div><span className="text-xs text-slate-500">Beginner pathway</span></div>
            <div className="mt-5 space-y-3">{lessons.map((lesson, i) => <div key={lesson.n} className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-800 bg-[#101827] p-4 transition hover:border-slate-700"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-800 font-mono text-sm text-cyan-300">{lesson.n}</div><div className="min-w-0 flex-1"><h3 className="font-semibold">{lesson.title}</h3><p className="mt-1 text-xs text-slate-500">{lesson.time} · Python basics</p></div><span className="text-xs text-slate-500">{lesson.state}</span>{i === 0 ? <Link href={lesson.href} className="rounded-lg border border-cyan-400/30 px-3 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-400/10">Open lesson</Link> : <span className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-500">In roadmap</span>}</div>)}</div>
          </section>
          <footer className="mt-12 border-t border-slate-800 py-6 text-center text-xs text-slate-600">CodeMentor AI · Learn. Practise. Understand.</footer>
        </section>
      </div>
    </main>
  );
}
