@echo off
cd /d "%~dp0"
if not exist "node_modules\vite\bin\vite.js" (
  echo Installez les dependances avec npm install avant de lancer AOD.
  pause
  exit /b 1
)
echo AOD Ventes et Services - http://127.0.0.1:5173
"C:\Program Files\nodejs\node.exe" node_modules\vite\bin\vite.js --host 127.0.0.1
