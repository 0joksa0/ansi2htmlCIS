import Convert from "https://esm.sh/ansi-to-html@0.7.2";

const input = document.getElementById("input");
const preview = document.getElementById("preview");
const stats = document.getElementById("stats");
const renderBtn = document.getElementById("renderBtn");
const clearBtn = document.getElementById("clearBtn");
const downloadBtn = document.getElementById("downloadBtn");
const fileInput = document.getElementById("fileInput");

const converter = new Convert({
  fg: "#e6edf3",
  bg: "#101922",
  newline: true,
  escapeXML: true,
  stream: false,
});

function updateStats(source) {
  if (!source.trim()) {
    stats.textContent = "0 lines";
    return;
  }

  const lineCount = source.replace(/\n$/, "").split("\n").length;
  stats.textContent = `${lineCount} lines`;
}

function renderAnsi(source = input.value) {
  const raw = source || "";
  const safe = raw.trim()
    ? converter.toHtml(raw)
    : '<span class="hint">Nothing to render yet. Paste script output above.</span>';

  preview.innerHTML = safe;
  updateStats(raw);
}

function clearAll() {
  input.value = "";
  fileInput.value = "";
  renderAnsi("");
}

function downloadHtml() {
  const content = preview.innerHTML.trim();
  if (!content || content.includes("Nothing to render yet")) {
    return;
  }

  const wrapped = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Student Output Report</title>
<style>
body { background: #0b1117; color: #e6edf3; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; padding: 20px; }
article { background: #101922; border-radius: 12px; border: 1px solid #243344; padding: 16px; white-space: pre-wrap; line-height: 1.45; }
a { color: #59b8ff; }
</style>
</head>
<body>
<article>${content}</article>
</body>
</html>`;

  const blob = new Blob([wrapped], { type: "text/html;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = `student-report-${new Date().toISOString().replace(/[:.]/g, "-")}.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(href);
}

renderBtn.addEventListener("click", () => renderAnsi());
clearBtn.addEventListener("click", clearAll);
downloadBtn.addEventListener("click", downloadHtml);

input.addEventListener("input", () => renderAnsi());

fileInput.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const text = await file.text();
  input.value = text;
  renderAnsi(text);
});

renderAnsi("");
