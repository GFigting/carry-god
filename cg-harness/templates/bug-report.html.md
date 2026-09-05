# Fix Report Template

Copy this template to `bug-report.html` and replace the bracketed values. Keep the file self-contained and usable offline.

```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>[Bug title]</title>
  <style>
    :root { color-scheme: light; font: 15px/1.6 system-ui, sans-serif; }
    body { max-width: 1100px; margin: 0 auto; padding: 32px; color: #17202a; background: #f4f6f8; }
    header, section { margin: 16px 0; padding: 22px; background: #fff; border: 1px solid #dce1e6; border-radius: 6px; }
    h1 { margin-top: 0; } h2 { border-bottom: 1px solid #e6eaee; padding-bottom: 8px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
    .label { color: #65717c; font-size: 12px; text-transform: uppercase; }
    pre { overflow: auto; padding: 14px; background: #17202a; color: #f7f9fa; border-radius: 4px; }
    .bad { color: #a12622; } .good { color: #176b3a; }
  </style>
</head>
<body>
  <header>
    <h1>[Bug title]</h1>
    <div class="grid">
      <div><div class="label">Status</div><strong>[investigating | fixed | verified]</strong></div>
      <div><div class="label">Severity</div><strong>[P0-P3]</strong></div>
      <div><div class="label">Module</div><strong>[module]</strong></div>
      <div><div class="label">Task</div><strong>[TASK-XXX]</strong></div>
    </div>
  </header>
  <section><h2>1. Summary</h2><p>[One paragraph summary]</p></section>
  <section><h2>2. Expected vs Actual</h2><p class="good"><strong>Expected:</strong> [expected]</p><p class="bad"><strong>Actual:</strong> [actual]</p></section>
  <section><h2>3. Reproduction</h2><ol><li>[Step]</li><li>[Step]</li><li>[Observed result]</li></ol></section>
  <section><h2>4. Impact</h2><ul><li>Affected users: [value]</li><li>Affected pages or APIs: [value]</li><li>Data or permission impact: [value]</li></ul></section>
  <section><h2>5. Cause</h2><p>[Direct cause]</p><p>[Why existing safeguards missed it]</p><pre>[Relevant flow, logs, or call chain]</pre></section>
  <section><h2>6. Fix</h2><p>[Changed files and behavior]</p><p>[Why this fix was selected]</p></section>
  <section><h2>7. Verification</h2><ul><li>[Reproduction after fix]</li><li>[Regression test]</li><li>[Browser, API, data, or manual verification]</li></ul></section>
  <section><h2>8. Remaining Risk</h2><p>[Known limitation or None]</p></section>
</body>
</html>
```
