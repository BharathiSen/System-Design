#!/bin/sh
# Builds two copies: scale-quest.html (open locally / GitHub Pages) and artifact/index.html (published page body)
cd "$(dirname "$0")/src" || exit 1
JS="data-plan.js data-topics1.js data-topics2.js data-topics3.js data-topics4.js data-quiz2.js data-problems.js data-problems2.js data-misc.js app.js views.js revise.js data-schema.js schema.js cases.js weak.js redo.js speak.js data-katas.js kata.js backup.js report.js journey.js data-easy.js data-easy2.js easy.js wb.js wbcheck.js"
scripts() { echo "<script>"; for f in $JS; do cat "$f"; echo; done; echo "window.SQ.boot();"; echo "</script>"; }
mkdir -p ../artifact
{ cat shell.html; cat body.html; scripts; } > ../artifact/index.html
# The standalone copy also becomes an installable offline app (manifest + service worker live next to it).
PWA='<link rel="manifest" href="manifest.webmanifest"><meta name="theme-color" content="#0f8f85"><link rel="icon" type="image/png" sizes="192x192" href="icons/icon-192.png"><link rel="apple-touch-icon" href="icons/apple-touch-icon.png"><meta name="apple-mobile-web-app-capable" content="yes">'
SW='<script>if("serviceWorker" in navigator&&/^https?:$/.test(location.protocol)){addEventListener("load",function(){navigator.serviceWorker.register("sw.js").catch(function(){});});}</script>'
{ echo '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'"$PWA"; cat shell.html; echo '</head><body>'; cat body.html; scripts; echo "$SW"; echo '</body></html>'; } > ../../scale-quest.html
echo built
