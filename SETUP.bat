@echo off
rem Promo Studio setup (Windows). Logic lives in promo-studio\scripts\setup.mjs.
title Promo Studio setup - Jepoy.dev
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul || (
  echo Node.js is not installed. Install it with:  winget install OpenJS.NodeJS.LTS
  echo or download from https://nodejs.org, then run this again.
  pause
  exit /b 1
)
node "promo-studio\scripts\setup.mjs" %*
pause
