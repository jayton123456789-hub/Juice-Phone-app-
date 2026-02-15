@echo off
echo ============================================
echo NUCLEAR BUILD - DESTROYING EVERYTHING
echo ============================================
echo.

REM Kill WRLD.exe
echo [1/8] Killing WRLD.exe...
taskkill /F /IM WRLD.exe 2>nul
timeout /t 1 /nobreak >nul

REM Kill Electron
echo [2/8] Killing electron.exe...
taskkill /F /IM electron.exe 2>nul
timeout /t 1 /nobreak >nul

REM Kill any node processes
echo [3/8] Killing node.exe...
taskkill /F /IM node.exe 2>nul
timeout /t 1 /nobreak >nul

REM Kill Windows Explorer (it might be locking files)
echo [4/8] Restarting Windows Explorer...
taskkill /F /IM explorer.exe 2>nul
timeout /t 2 /nobreak >nul
start explorer.exe

REM Kill any app-builder processes
echo [5/8] Killing app-builder...
taskkill /F /IM app-builder.exe 2>nul
timeout /t 1 /nobreak >nul

REM Use PowerShell to force delete with retries
echo [6/8] Force deleting release folder with PowerShell...
powershell -Command "if (Test-Path 'C:\Users\jayto\JuicePhoneApp\release') { Remove-Item -Path 'C:\Users\jayto\JuicePhoneApp\release' -Recurse -Force -ErrorAction SilentlyContinue }" 2>nul

REM Wait even longer
echo [7/8] Waiting for Windows to release ALL locks...
timeout /t 5 /nobreak >nul

REM One more cleanup attempt
echo [8/8] Final cleanup...
if exist "C:\Users\jayto\JuicePhoneApp\release" (
    rmdir /s /q "C:\Users\jayto\JuicePhoneApp\release" 2>nul
)
timeout /t 2 /nobreak >nul

echo.
echo ============================================
echo STARTING BUILD
echo ============================================
echo.

cd /d "C:\Users\jayto\JuicePhoneApp"
call npm run build
call npm run build:electron
call npx electron-builder --win --dir

echo.
echo ============================================
if exist "C:\Users\jayto\JuicePhoneApp\release\win-unpacked\WRLD.exe" (
    echo BUILD SUCCESS!
    echo Your EXE is at: release\win-unpacked\WRLD.exe
    start explorer "release\win-unpacked"
) else (
    echo BUILD FAILED!
    echo Check the errors above.
)
echo ============================================
echo.
pause
