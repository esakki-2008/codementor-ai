"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { clearToken, getLearningProgress, getMe, getPythonCourse } from "@/lib/auth";
import type { LearningProgress, PythonCourse, Student } from "@/lib/auth";

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return <div className="rounded-2xl border border-slate-800 bg-[#101827] p-5"><p className="text-sm text-slate-400">{label}</p><p className="mt-3 text-3xl font-black">{value}</p><p className="mt-2 text-xs text-slate-500">{note}</p></div>;
}

export default function Dashboard() {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [course, setCourse] = useState<PythonCourse | null>(null);
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [learningError, setLearningError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadDashboard() {
      try {
        const profile = await getMe();
        if (!active) return;
        setStudent(profile);
      } catch {
        if (active) {
          clearToken();
          router.replace("/login");
        }
        return;
      }

      try {
        const [courseData, progressData] = await Promise.all([getPythonCourse(), getLearningProgress()]);
        if (!active) return;
        setCourse(courseData);
        setProgress(progressData);
      } catch (err) {
        if (active) setLearningError(err instanceof Error ? err.message : "Learning data could not be loaded.");
      } finally {
        if (active) setLoading(false);
      }
    }
    loadDashboard();
    return () => { active = false; };
  }, [router]);

  function logout() {
    clearToken();
    router.replace("/login");
  }

  if (loading || !student) {
    return <main className="flex min-h-screen items-center justify-center bg-[#080d18] text-sm text-slate-400">Loading your learning space…</main>;
  }

  const initials = student.full_name.trim().split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase();
  const completedIds = new Set((progress?.items ?? []).filter((item) => item.status === "completed").map((item) => item.lesson_id));
  const lessons = course?.lessons ?? [];
  const completedCount = progress?.completed_lessons ?? 0;
  const totalCount = progress?.total_lessons ?? lessons.length;
  const percentage = progress?.completion_percentage ?? 0;
  const nextLesson = lessons.find((lesson) => !completedIds.has(lesson.id)) ?? lessons[0];

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
          <header className="flex items-center justify-between gap-4">
            <div><Link href="/" className="text-sm font-bold text-cyan-300 md:hidden">CodeMentor AI</Link><p className="mt-2 text-sm text-slate-500">YOUR LEARNING SPACE</p><h1 className="mt-2 text-2xl font-black sm:text-3xl">Welcome back, {student.full_name.split(" ")[0]} <span aria-hidden="true">👋</span></h1><p className="mt-2 text-sm text-slate-400">A little progress every day adds up. Ready for the next step?</p><p className="mt-1 text-xs text-slate-500">{student.email} · {student.experience_level} learner</p></div>
            <div className="flex items-center gap-3"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 font-bold text-cyan-200">{initials}</div><button onClick={logout} className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-rose-400/50 hover:text-rose-200">Log out</button></div>
          </header>

          {learningError && <p role="alert" className="mt-6 rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm text-amber-200">Your profile loaded, but learning data could not be loaded: {learningError}. Make sure the backend is running, then refresh.</p>}

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Metric label="Learning progress" value={percentage + "%"} note={totalCount ? "Across your Python course" : "Course data unavailable"} />
            <Metric label="Lessons completed" value={String(completedCount)} note={totalCount ? `Out of ${totalCount} lessons` : "No lessons loaded"} />
            <Metric label="Lessons remaining" value={String(Math.max(totalCount - completedCount, 0))} note="Keep building your skills" />
          </div>

          <div className="mt-8 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
            <section className="relative overflow-hidden rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-[#10243a] to-[#101827] p-6 sm:p-8"><div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" /><div className="relative"><p className="text-xs font-bold tracking-[0.2em] text-cyan-300">YOUR COURSE</p><div className="mt-4 flex items-start justify-between gap-4"><div><h2 className="text-2xl font-black sm:text-3xl">{course?.title ?? "Python for Beginners"}</h2><p className="mt-3 max-w-lg leading-7 text-slate-300">{course?.description || "Build a strong foundation in Python, one concept at a time."}</p></div><span className="hidden text-5xl sm:block">🐍</span></div><div className="mt-7 flex flex-wrap items-center gap-4"><Link href="/learn/python" className="rounded-xl bg-cyan-400 px-6 py-3 font-bold text-slate-950 transition hover:bg-cyan-300">{completedCount === totalCount && totalCount > 0 ? "Review course →" : completedCount > 0 ? "Continue learning →" : "Start first lesson →"}</Link><span className="text-xs text-slate-400">Beginner · Self-paced</span></div></div></section>
            <section id="challenge" className="rounded-2xl border border-slate-800 bg-[#101827] p-6"><p className="text-xs font-bold tracking-[0.2em] text-amber-300">⚡ QUICK CHECK</p><h2 className="mt-3 text-xl font-bold">Learn by understanding</h2><p className="mt-3 text-sm leading-6 text-slate-400">Read a short explanation, inspect an example, and answer a question to check what you learned.</p><div className="mt-5 rounded-xl border border-slate-700 bg-[#080d18] p-4 font-mono text-sm"><span className="text-sky-300">print</span><span className="text-slate-300">(</span><span className="text-emerald-300">"Hello, world!"</span><span className="text-slate-300">)</span></div><Link href="/learn/python" className="mt-5 inline-flex text-sm font-semibold text-cyan-300">Explore lessons →</Link></section>
          </div>

          <section id="roadmap" className="mt-10"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold tracking-[0.2em] text-cyan-400">THE ROADMAP</p><h2 className="mt-2 text-2xl font-black">Python learning path</h2><p className="mt-2 text-sm text-slate-400">Your completion status is synced with your account.</p></div><span className="text-xs text-slate-500">Beginner pathway</span></div>
            <div className="mt-5 space-y-3">{lessons.map((lesson, i) => { const isComplete = completedIds.has(lesson.id); const isNext = nextLesson?.id === lesson.id && !isComplete; return <div key={lesson.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-800 bg-[#101827] p-4 transition hover:border-slate-700"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-800 font-mono text-sm text-cyan-300">{isComplete ? "✓" : String(lesson.sequence_number).padStart(2, "0")}</div><div className="min-w-0 flex-1"><h3 className="font-semibold">{lesson.title}</h3><p className="mt-1 text-xs text-slate-500">{lesson.estimated_minutes} min · Python basics</p></div><span className={`text-xs ${isComplete ? "text-emerald-300" : isNext ? "text-cyan-300" : "text-slate-500"}`}>{isComplete ? "Completed" : isNext ? "Next lesson" : "Not started"}</span><Link href="/learn/python" className="rounded-lg border border-cyan-400/30 px-3 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-400/10">{isComplete ? "Review" : "Open lesson"}</Link></div>; })}{!learningError && lessons.length === 0 && <p className="rounded-xl border border-slate-800 bg-[#101827] p-5 text-sm text-slate-400">Your course lessons will appear here when the course is available.</p>}</div>
          </section>
          <footer className="mt-12 border-t border-slate-800 py-6 text-center text-xs text-slate-600">CodeMentor AI · Learn. Practise. Understand.</footer>
        </section>
      </div>
    </main>
  );
}
