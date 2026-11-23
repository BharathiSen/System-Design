#!/bin/sh
# Builds two copies: scale-quest.html (open locally) and artifact/index.html (published page body)
cd "$(dirname "$0")/src" || exit 1
JS="data-plan.js data-topics1.js data-topics2.js data-topics3.js data-problems.js data-misc.js app.js views.js revise.js wb.js"
scripts() { echo "<script>"; for f in $JS; do cat "$f"; echo; done; echo "window.SQ.boot();"; echo "</script>"; }
mkdir -p ../artifact
{ cat shell.html; cat body.html; scripts; } > ../artifact/index.html
{ echo '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'; cat shell.html; echo '</head><body>'; cat body.html; scripts; echo '</body></html>'; } > ../../scale-quest.html
echo built
