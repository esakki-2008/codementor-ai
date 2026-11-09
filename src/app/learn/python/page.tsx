"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  clearToken,
  completeLesson,
  getLearningProgress,
  getPythonCourse,
} from "@/lib/auth";
import type { CourseLesson, LearningProgress } from "@/lib/auth";

const lessonContent = [
  { topic: "What is Python?", explanation: "Python is a programming language. We use it to give instructions to a computer. Python is popular because its syntax is readable and beginner friendly.", code: 'print("Hello, world!")', output: "Hello, world!", question: "What is Python?", options: ["A programming language", "A web browser", "A computer processor"], answer: 0, why: "Python is a programming language used to write instructions for computers." },
  { topic: "Store information", explanation: "A variable is a name that refers to a value. Think of it like a labelled container. In age = 18, the name age refers to the number 18.", code: 'name = "Student"\nage = 18\nprint(name)\nprint(age)', output: "Student\n18", question: "Which line stores the number 25 in a variable named age?", options: ["25 = age", "age == 25", "age = 25"], answer: 2, why: "The single equals sign assigns a value to a variable. Two equals signs compare values." },
  { topic: "Talk to your program", explanation: "The print() function displays information. The input() function pauses and waits for the user to type something. The value returned by input() is text.", code: 'name = input("Your name: ")\nprint("Hello, " + name)', output: "Your name: Sam\nHello, Sam", question: "Which function displays text on the screen?", options: ["input()", "print()", "read()"], answer: 1, why: "print() displays values and messages in the program output." },
  { topic: "Work with values", explanation: "Operators let you calculate and compare values. The + operator adds, - subtracts, * multiplies, and / divides.", code: "first = 10\nsecond = 5\nprint(first + second)", output: "15", question: "What is the result of 10 * 2?", options: ["12", "20", "8"], answer: 1, why: "The * operator means multiplication, so 10 multiplied by 2 is 20." },
  { topic: "Make decisions", explanation: "An if statement runs a block when its condition is true. An else block runs when the condition is false. Indentation marks which lines belong to each block.", code: 'age = 18\nif age >= 18:\n    print("Adult")\nelse:\n    print("Minor")', output: "Adult", question: "Which keyword begins a conditional statement in Python?", options: ["if", "repeat", "function"], answer: 0, why: "if starts a conditional statement. Python checks the condition before running its indented block." },
];

export default function PythonLearningPage() {
  const router = useRouter();
  const [courseLessons, setCourseLessons] = useState<CourseLesson[]>([]);
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([getPythonCourse(), getLearningProgress()])
      .then(([course, savedProgress]) => {
        if (!active) return;
        setCourseLessons(course.lessons);
        setProgress(savedProgress);
      })
      .catch((err: Error) => {
        if (!active) return;
        if (err.message.toLowerCase().includes("log in") || err.message.toLowerCase().includes("not authenticated")) {
          clearToken();
          router.replace("/login");
          return;
        }
        setError(err.message);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [router]);

  const orderedLessons = useMemo(
    () => [...courseLessons].sort((a, b) => a.sequence_number - b.sequence_number),
    [courseLessons],
  );
  const lessonRecord = orderedLessons.find((item) => item.sequence_number === current + 1);
  const content = lessonContent[current];
  const lesson = lessonRecord && content
    ? { ...content, title: lessonRecord.title, estimatedMinutes: lessonRecord.estimated_minutes }
    : null;
  const completedIds = new Set((progress?.items ?? []).filter((item) => item.status === "completed").map((item) => item.lesson_id));
  const completedCount = progress?.completed_lessons ?? 0;
  const totalCount = progress?.total_lessons ?? orderedLessons.length;
  const correct = selected === content?.answer;

  function chooseLesson(index: number) {
    setCurrent(index);
    setSelected(null);
    setChecked(false);
    setError("");
  }

  async function checkAnswer() {
    if (selected === null || !correct || !lessonRecord || saving) {
      setChecked(true);
      return;
    }
    setChecked(true);
    if (completedIds.has(lessonRecord.id)) return;
    setSaving(true);
    setError("");
    try {
      await completeLesson(lessonRecord.id, 100);
      const updated = await getLearningProgress();
      setProgress(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your progress. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center bg-[#080d18] text-sm text-slate-400">Loading your Python course…</main>;
  }

  if (error && courseLessons.length === 0) {
    return <main className="flex min-h-screen flex-col items-center justify-center bg-[#080d18] px-6 text-center text-white"><p className="text-lg font-bold">We couldn’t load your course</p><p className="mt-3 max-w-lg text-sm text-slate-400">{error}</p><button onClick={() => window.location.reload()} className="mt-6 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950">Try again</button><Link href="/dashboard" className="mt-4 text-sm text-cyan-300">Back to dashboard</Link></main>;
  }

  if (!lesson || !content) {
    return <main className="flex min-h-screen items-center justify-center bg-[#080d18] px-6 text-center text-slate-300">The course content is not available yet. <Link href="/dashboard" className="ml-2 text-cyan-300">Dashboard</Link></main>;
  }

  return (
    <main className="min-h-screen bg-[#080d18] text-white">
      <header className="flex items-center justify-between border-b border-slate-800 px-5 py-5 sm:px-8"><Link href="/" className="text-xl font-black">CodeMentor<span className="text-cyan-400">AI</span></Link><div className="flex items-center gap-4"><Link href="/practice/python" className="text-sm font-semibold text-cyan-300 transition hover:text-cyan-200">Python Playground ↗</Link><Link href="/dashboard" className="text-sm text-slate-400 transition hover:text-white">← Dashboard</Link></div></header>
      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-7 lg:grid-cols-[280px_minmax(0,1fr)] sm:px-8">
        <aside className="h-fit rounded-2xl border border-slate-800 bg-[#101827] p-5"><p className="text-[10px] font-bold tracking-[0.2em] text-cyan-400">PYTHON · BEGINNER</p><h2 className="mt-3 text-xl font-black">Course contents</h2><p className="mt-2 text-xs text-slate-500">{completedCount} of {totalCount} lessons completed · saved to your account</p><div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-700"><div className="h-full rounded-full bg-cyan-400 transition-all" style={{ width: (totalCount ? completedCount / totalCount * 100 : 0) + "%" }} /></div><nav className="mt-6 space-y-2">{orderedLessons.map((item, index) => <button key={item.id} onClick={() => chooseLesson(index)} className={"flex w-full items-center gap-3 rounded-xl p-3 text-left text-sm transition " + (current === index ? "border border-cyan-400/30 bg-cyan-400/10 text-cyan-200" : "text-slate-400 hover:bg-slate-800")}><span className="w-5 text-xs">{completedIds.has(item.id) ? "✓" : String(index + 1).padStart(2, "0")}</span><span>{item.title}</span></button>)}</nav><p className="mt-6 rounded-xl bg-[#080d18] p-3 text-xs leading-5 text-slate-500">Tip: Try to answer before checking. Mistakes are part of learning.</p></aside>
        <section className="min-w-0">
          <div className="mb-6"><p className="text-xs font-bold tracking-[0.2em] text-cyan-400">LESSON {String(current + 1).padStart(2, "0")} / {String(orderedLessons.length).padStart(2, "0")}</p><h1 className="mt-3 text-3xl font-black sm:text-4xl">{lesson.title}</h1><p className="mt-3 text-slate-400">{lesson.topic} · {lesson.estimatedMinutes} min</p></div>
          <article className="rounded-2xl border border-slate-800 bg-[#101827] p-6"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-xl">📘</span><h2 className="text-lg font-bold">Understand the concept</h2></div><p className="mt-4 leading-8 text-slate-300">{lesson.explanation}</p></article>
          <article className="mt-5 overflow-hidden rounded-2xl border border-slate-800 bg-[#101827]"><div className="flex items-center justify-between border-b border-slate-800 px-5 py-4"><h2 className="font-bold">Example code</h2><span className="text-xs text-slate-500">Python</span></div><pre className="overflow-x-auto p-6 font-mono text-sm leading-8 text-cyan-200"><code>{lesson.code}</code></pre><div className="border-t border-slate-800 bg-[#0b1320] px-6 py-4"><p className="text-[10px] font-bold tracking-[0.2em] text-slate-500">EXPECTED OUTPUT</p><pre className="mt-2 whitespace-pre-wrap font-mono text-sm text-emerald-300">{lesson.output}</pre></div></article>
          <article className="mt-5 rounded-2xl border border-cyan-400/20 bg-[#101827] p-6"><div className="flex items-center gap-3"><span className="text-xl text-cyan-300">✦</span><h2 className="text-lg font-bold">Check your understanding</h2></div><p className="mt-4 text-slate-200">{lesson.question}</p><div className="mt-5 space-y-3">{lesson.options.map((option, index) => <button key={option} disabled={checked || saving} onClick={() => setSelected(index)} className={"w-full rounded-xl border p-4 text-left text-sm transition " + (checked && index === lesson.answer ? "border-emerald-400 bg-emerald-400/10 text-emerald-200" : checked && selected === index ? "border-red-400 bg-red-400/10 text-red-200" : selected === index ? "border-cyan-400 bg-cyan-400/10 text-cyan-200" : "border-slate-700 text-slate-300 hover:border-cyan-400/50")}><span className="mr-3 text-slate-500">{String.fromCharCode(65 + index)}.</span>{option}</button>)}</div>
            {checked && <div className={"mt-5 rounded-xl p-4 text-sm leading-6 " + (correct ? "bg-emerald-400/10 text-emerald-200" : "bg-amber-400/10 text-amber-200")}><p className="font-bold">{correct ? "✓ That's correct!" : "Not quite — let's learn from it."}</p><p className="mt-1">{lesson.why}</p>{correct && completedIds.has(lessonRecord.id) && <p className="mt-2 text-xs">Your completion is saved to your account.</p>}</div>}
            {error && <p role="alert" className="mt-4 text-sm text-rose-300">{error}</p>}
            {!checked ? <button onClick={checkAnswer} disabled={selected === null || saving} className="mt-6 rounded-xl bg-cyan-400 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40">Check answer</button> : <div className="mt-6 flex flex-wrap gap-3"><button onClick={() => { setSelected(null); setChecked(false); setError(""); }} className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 hover:border-slate-500">Try again</button><button onClick={() => chooseLesson(Math.min(current + 1, orderedLessons.length - 1))} disabled={!correct || saving || current === orderedLessons.length - 1 || !completedIds.has(lessonRecord.id)} className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-40">{saving ? "Saving…" : "Next lesson →"}</button></div>}
          </article>
          <div className="mt-6 flex items-center justify-between text-xs text-slate-600"><span>Learn at your own pace.</span><span>{completedCount}/{totalCount} lessons completed</span></div>
        </section>
      </div>
    </main>
  );
}
