import Convert from "https://esm.sh/ansi-to-html@0.7.2";

const input = document.getElementById("input");
const preview = document.getElementById("preview");
const stats = document.getElementById("stats");
const renderBtn = document.getElementById("renderBtn");
const clearBtn = document.getElementById("clearBtn");
const downloadBtn = document.getElementById("downloadBtn");
const fileInput = document.getElementById("fileInput");
const cleanToggle = document.getElementById("cleanToggle");

const converter = new Convert({
  fg: "#e6edf3",
  bg: "#101922",
  newline: true,
  escapeXML: true,
  stream: false,
});

function lineCount(source) {
  if (!source.trim()) {
    return 0;
  }
  return source.replace(/\n$/, "").split("\n").length;
}

function updateStats(rawSource, preparedSource) {
  if (!preparedSource.trim()) {
    stats.textContent = "0 lines";
    return;
  }

  const preparedCount = lineCount(preparedSource);
  const rawCount = lineCount(rawSource);
  const changed = cleanToggle.checked && rawSource !== preparedSource;

  stats.textContent = changed
    ? `${preparedCount} lines (cleaned from ${rawCount})`
    : `${preparedCount} lines`;
}

function stripBackspaces(source) {
  let text = source;
  while (/[^\n]\x08/.test(text)) {
    text = text.replace(/[^\n]\x08/g, "");
  }
  return text.replace(/\x08/g, "");
}

function cleanupScriptArtifacts(source) {
  let text = source;

  text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  text = stripBackspaces(text);

  text = text
    .replace(/\x1b\][^\x07\x1b]*(?:\x07|\x1b\\)/g, "")
    .replace(/\x1b\[\?\d{3,5}[hl]/g, "")
    .replace(/^Script (started|done) on.*$/gim, "")
    .replace(/[\x00-\x08\x0b-\x1a\x1c-\x1f\x7f]/g, "");

  const cleanedLines = text
    .split("\n")
    .map((line) => {
      let out = line;

      // Remove common script/readline leftovers that leak as raw text.
      out = out.replace(/\?\d{3,5}[hl]/g, "");

      // Remove title-setting residues in plain-text captures while preserving command text.
      out = out.replace(/\]0;[^#$\n]*[#$]\s*/g, "");
      out = out.replace(/\]0;[^\n]*\u0007/g, "");

      // Remove lines that are only question-mark timestamps/control leftovers.
      if (/^\s*\??\d+\]?\s*$/.test(out)) return "";

      // Remove fully empty shell-title residue line.
      if (/^\s*\]0;\s*$/.test(out)) return "";

      return out;
    })
    .join("\n");

  text = cleanedLines.replace(/\n{3,}/g, "\n\n").trim();

  return text;
}

function renderAnsi(source = input.value) {
  const raw = source || "";
  const prepared = cleanToggle.checked ? cleanupScriptArtifacts(raw) : raw;
  const safe = prepared.trim()
    ? converter.toHtml(prepared)
    : '<span class="hint">Nothing to render yet. Paste script output above.</span>';

  preview.innerHTML = safe;
  updateStats(raw, prepared);
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
cleanToggle.addEventListener("change", () => renderAnsi());

fileInput.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const text = await file.text();
  input.value = text;
  renderAnsi(text);
});

renderAnsi("");
