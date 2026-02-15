@echo off
echo ============================================
echo MANUAL CLEANUP - RUN THIS FIRST
echo ============================================
echo.
echo This will find and kill whatever is locking your files!
echo.
pause

REM Kill everything
echo Killing ALL processes...
taskkill /F /IM WRLD.exe 2>nul
taskkill /F /IM electron.exe 2>nul
taskkill /F /IM node.exe 2>nul
taskkill /F /IM app-builder.exe 2>nul
taskkill /F /IM explorer.exe 2>nul
timeout /t 2 /nobreak >nul
start explorer.exe

echo.
echo Waiting 5 seconds...
timeout /t 5 /nobreak >nul

echo.
echo Deleting release folder...
cd /d "C:\Users\jayto\JuicePhoneApp"
rmdir /s /q release 2>nul

echo.
echo Trying PowerShell force delete...
powershell -Command "Remove-Item -Path 'C:\Users\jayto\JuicePhoneApp\release' -Recurse -Force -ErrorAction SilentlyContinue"

echo.
echo Waiting 3 more seconds...
timeout /t 3 /nobreak >nul

echo.
echo ============================================
echo CLEANUP COMPLETE!
echo ============================================
echo.
echo Now run BUILD.bat
echo.
pause
