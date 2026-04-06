# ANSI2HTML Student Viewer

Tiny static app for converting ANSI-colored terminal output into readable HTML.
Built for reviewing student assignment logs and script outputs.

## Features

- Paste terminal/script output directly
- Load `.txt`, `.log`, `.ansi` files
- ANSI to HTML conversion using `ansi-to-html`
- Instant preview with colorized output
- Download final report as standalone HTML

## Run locally

Just open `index.html` in browser.

If your browser blocks module imports from file URLs, run a quick static server:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

## Deploy to GitHub Pages

1. Push these files to your repo (`main` branch).
2. In GitHub repo settings open `Pages`.
3. Under `Build and deployment` choose:
   - Source: `Deploy from a branch`
   - Branch: `main` and folder `/ (root)`
4. Save and wait ~1 minute.
5. Your app will be available at:
   `https://<your-user>.github.io/<repo-name>/`

## Typical workflow for grading

1. Run student script/test command and copy terminal output.
2. Paste into app.
3. Check colorized logs quickly in preview.
4. Export HTML report and attach/share.
