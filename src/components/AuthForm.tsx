"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { login, register } from "@/lib/auth";

type Props = { mode: "login" | "register" };

export default function AuthForm({ mode }: Props) {
  const router = useRouter();
  const isRegister = mode === "register";
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [experience, setExperience] = useState("beginner");
  const [goal, setGoal] = useState("Learn Python programming");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (isRegister) {
        await register({
          full_name: fullName.trim(),
          email: email.trim(),
          password,
          experience_level: experience,
          learning_goal: goal.trim() || undefined,
        });
      }
      await login(email.trim(), password);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to continue.");
    } finally {
      setBusy(false);
    }
  }

  const field = "mt-2 w-full rounded-xl border border-slate-700 bg-[#080d18] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080d18] px-5 py-12 text-white">
      <div className="w-full max-w-md">
        <Link href="/" className="text-xl font-black">CodeMentor<span className="text-cyan-400">AI</span></Link>
        <div className="mt-8 rounded-3xl border border-slate-800 bg-[#101827] p-7 shadow-2xl shadow-black/20 sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">{isRegister ? "Start your journey" : "Welcome back"}</p>
          <h1 className="mt-3 text-3xl font-black">{isRegister ? "Create your account" : "Log in to CodeMentor"}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">{isRegister ? "A few details, then you can start learning Python." : "Pick up where your learning journey left off."}</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {isRegister && <>
              <label className="block text-sm font-medium text-slate-300">Full name<input className={field} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" autoComplete="name" required minLength={2} /></label>
              <label className="block text-sm font-medium text-slate-300">Experience level<select className={field} value={experience} onChange={(e) => setExperience(e.target.value)}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></label>
              <label className="block text-sm font-medium text-slate-300">Learning goal<input className={field} value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="What would you like to learn?" /></label>
            </>}
            <label className="block text-sm font-medium text-slate-300">Email address<input className={field} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required /></label>
            <label className="block text-sm font-medium text-slate-300">Password<input className={field} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={isRegister ? "At least 10 characters" : "Your password"} autoComplete={isRegister ? "new-password" : "current-password"} required minLength={isRegister ? 10 : 1} maxLength={128} /></label>
            {error && <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</p>}
            <button disabled={busy} className="w-full rounded-xl bg-cyan-400 px-5 py-3.5 font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60">{busy ? "Please wait…" : isRegister ? "Create account →" : "Log in →"}</button>
          </form>
          <p className="mt-7 text-center text-sm text-slate-400">{isRegister ? "Already have an account?" : "New to CodeMentor AI?"} <Link className="font-semibold text-cyan-300 hover:text-cyan-200" href={isRegister ? "/login" : "/register"}>{isRegister ? "Log in" : "Create an account"}</Link></p>
        </div>
        <p className="mt-6 text-center text-xs text-slate-600">Learn. Practise. Understand.</p>
      </div>
    </main>
  );
}
