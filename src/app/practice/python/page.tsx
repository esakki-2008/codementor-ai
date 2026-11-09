"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { sendTutorMessage } from "@/lib/auth";
import { useEffect, useRef, useState } from "react";

const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <div className="flex h-[380px] items-center justify-center bg-[#0b1320] text-sm text-slate-500">Loading code editor…</div>,
});

const starterCode = 'name = "Esakki"\nprint("Hello,", name)\n\n# Try changing the name and run again!';
type WorkerMessage =
  | { type: "ready" }
  | { type: "loading" }
  | { type: "result"; output: string }
  | { type: "error"; output: string };

export default function PythonPracticePage() {
  const workerRef = useRef<Worker | null>(null);
  const [code, setCode] = useState(starterCode);
  const [output, setOutput] = useState("Your program output will appear here.");
  const [runtime, setRuntime] = useState<"loading" | "ready" | "error">("loading");
  const [running, setRunning] = useState(false);
  const [tutorQuestion, setTutorQuestion] = useState("");
  const [tutorReply, setTutorReply] = useState("Hi! I am your coding study buddy. Ask me about your code, or share an error message. I will guide you with hints first.");
  const [tutorLoading, setTutorLoading] = useState(false);
  const [tutorSession, setTutorSession] = useState<number | undefined>(undefined);
  const [tutorError, setTutorError] = useState("");

  useEffect(() => {
    const worker = new Worker("/python-worker.js");
    workerRef.current = worker;
    worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
      const message = event.data;
      if (message.type === "ready") setRuntime("ready");
      if (message.type === "loading") setRuntime("loading");
      if (message.type === "result") {
        setOutput(message.output || "(Program finished with no output.)");
        setRunning(false);
      }
      if (message.type === "error") {
        setOutput(message.output);
        setRunning(false);
      }
    };
    worker.onerror = () => {
      setRuntime("error");
      setRunning(false);
      setOutput("The Python runtime could not start. Check your internet connection and refresh this page.");
    };
    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  function runCode() {
    if (runtime !== "ready" || running || !workerRef.current) return;
    setRunning(true);
    setOutput("Running your Python code…");
    workerRef.current.postMessage({ code });
  }

  return (
    <main className="min-h-screen bg-[#080d18] text-white">
      <header className="flex items-center justify-between border-b border-slate-800 px-5 py-5 sm:px-8">
        <Link href="/" className="text-xl font-black">CodeMentor<span className="text-cyan-400">AI</span></Link>
        <Link href="/learn/python" className="text-sm text-slate-400 transition hover:text-white">← Back to lessons</Link>
      </header>
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <p className="text-xs font-bold tracking-[0.2em] text-cyan-400">PYTHON PLAYGROUND</p>
        <h1 className="mt-3 text-3xl font-black sm:text-4xl">Write code. Run it. Learn by doing.</h1>
        <p className="mt-3 max-w-2xl text-slate-400">Experiment with Python in your browser. Your code runs locally using Pyodide; it is not sent to our server.</p>
        <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-800 bg-[#101827]">
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
              <div><h2 className="font-bold">main.py</h2><p className="mt-1 text-xs text-slate-500">Python 3 · Monaco Editor</p></div>
              <span className={"rounded-full px-3 py-1 text-xs " + (runtime === "ready" ? "bg-emerald-400/10 text-emerald-300" : runtime === "error" ? "bg-rose-400/10 text-rose-300" : "bg-amber-400/10 text-amber-300")}>{runtime === "ready" ? "Python ready" : runtime === "error" ? "Runtime error" : "Loading Python…"}</span>
            </div>
            <Editor
              height="420px"
              language="python"
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value ?? "")}
              options={{
                automaticLayout: true,
                minimap: { enabled: false },
                fontSize: 14,
                lineHeight: 24,
                fontFamily: "Consolas, 'Courier New', monospace",
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                wordWrap: "on",
                tabSize: 4,
                insertSpaces: true,
                padding: { top: 16, bottom: 16 },
                renderLineHighlight: "all",
                suggestOnTriggerCharacters: true,
                quickSuggestions: true,
                bracketPairColorization: { enabled: true },
              }}
            />
            <div className="flex flex-wrap gap-3 border-t border-slate-800 p-4">
              <button onClick={runCode} disabled={runtime !== "ready" || running} className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40">{running ? "Running…" : "▶ Run code"}</button>
              <button onClick={() => { setCode(starterCode); setOutput("Editor reset. Run the starter code when you're ready."); }} className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 hover:border-slate-500">Reset code</button>
              <span className="self-center text-xs text-slate-500">Tip: Use Ctrl + Enter to run your code soon.</span>
            </div>
          </section>
          <section className="overflow-hidden rounded-2xl border border-slate-800 bg-[#101827]">
            <div className="border-b border-slate-800 px-5 py-4"><h2 className="font-bold">Output</h2><p className="mt-1 text-xs text-slate-500">Console</p></div>
            <pre aria-live="polite" className="min-h-[420px] whitespace-pre-wrap break-words bg-[#0b1320] p-5 font-mono text-sm leading-7 text-emerald-300">{output}</pre>
            <div className="border-t border-slate-800 p-4 text-xs leading-6 text-slate-500">Your output and Python errors appear here. Try print(), variables, loops, and simple calculations.</div>
          </section>
        </div>
        <section className="mt-6 overflow-hidden rounded-2xl border border-cyan-400/20 bg-[#101827]">
          <div className="border-b border-slate-800 px-5 py-4">
            <p className="text-xs font-bold tracking-[0.2em] text-cyan-400">CODEMENTOR STUDY BUDDY</p>
            <h2 className="mt-2 text-xl font-bold">Need a hint? Let's think it through.</h2>
            <p className="mt-1 text-sm text-slate-400">Ask a Python question or ask for help with the code in your editor. The tutor will offer guidance rather than simply giving away answers.</p>
          </div>
          <div className="whitespace-pre-wrap p-5 text-sm leading-7 text-slate-200">{tutorReply}</div>
          <div className="border-t border-slate-800 p-4">
            <label htmlFor="tutor-question" className="mb-2 block text-xs font-semibold text-slate-400">Your question</label>
            <textarea id="tutor-question" value={tutorQuestion} onChange={(event) => setTutorQuestion(event.target.value)} rows={3} maxLength={2000} placeholder="Example: Why am I getting a NameError?" className="w-full resize-y rounded-xl border border-slate-700 bg-[#0b1320] p-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400" />
            {tutorError && <p role="alert" className="mt-2 text-sm text-rose-300">{tutorError}</p>}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-slate-500">Your current editor code is shared with the tutor.</p>
              <button onClick={askTutor} disabled={!tutorQuestion.trim() || tutorLoading} className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40">{tutorLoading ? "Thinking…" : "Ask for a hint →"}</button>
            </div>
          </div>
        </section>
        <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5 text-sm leading-6 text-amber-100/80">
          <strong className="text-amber-200">MVP limitation:</strong> This browser playground is for beginner exercises. It currently does not support interactive input() prompts, and very long-running code (such as an infinite loop) can make the playground unresponsive. Do not use it for untrusted production workloads.
        </div>
      </div>
    </main>
  );
}
