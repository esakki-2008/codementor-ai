/* Runs Python in a dedicated browser worker using Pyodide. */
importScripts("https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js");

let pyodidePromise;

async function getRuntime() {
  if (!pyodidePromise) {
    self.postMessage({ type: "loading" });
    pyodidePromise = loadPyodide();
  }
  return pyodidePromise;
}

self.postMessage({ type: "loading" });
getRuntime()
  .then(() => self.postMessage({ type: "ready" }))
  .catch((error) => self.postMessage({ type: "error", output: String(error) }));

self.onmessage = async (event) => {
  const { code } = event.data || {};
  try {
    const pyodide = await getRuntime();
    pyodide.globals.set("student_code", String(code ?? ""));
    const output = await pyodide.runPythonAsync(
      "import io, contextlib, traceback\n" +
      "_output = io.StringIO()\n" +
      "try:\n" +
      "    with contextlib.redirect_stdout(_output), contextlib.redirect_stderr(_output):\n" +
      "        exec(compile(student_code, '<student-code>', 'exec'))\n" +
      "except Exception:\n" +
      "    traceback.print_exc(file=_output)\n" +
      "_output.getvalue()"
    );
    self.postMessage({ type: "result", output: String(output ?? "") });
  } catch (error) {
    self.postMessage({ type: "error", output: String(error) });
  }
};
