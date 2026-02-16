@echo off
setlocal enabledelayedexpansion

REM Always run from the Scanner folder where this BAT lives
cd /d "%~dp0"

echo ==============================================
echo   Juice WRLD Scanner - Windows Helper
echo ==============================================

REM Defend against global pip configs that force --user installs.
REM In a venv, --user fails with: "User site-packages are not visible in this virtualenv".
set PIP_USER=0
set PYTHONNOUSERSITE=1

if not exist ".venv\Scripts\python.exe" (
  echo [1/4] Creating virtual environment...
  python -m venv .venv
  if errorlevel 1 (
    echo Failed to create virtual environment.
    pause
    exit /b 1
  )
)

echo [2/4] Upgrading pip...
call ".venv\Scripts\python.exe" -m pip --isolated install --no-user --upgrade pip
if errorlevel 1 (
  echo Failed to upgrade pip inside virtual environment.
  echo If this keeps happening, check global pip config with:
  echo   py -m pip config list -v
  pause
  exit /b 1
)

echo [3/4] Installing requirements...
call ".venv\Scripts\python.exe" -m pip --isolated install --no-user -r requirements.txt
if errorlevel 1 (
  echo Failed to install dependencies.
  echo If you have a global pip config forcing user installs, disable it or run:
  echo   py -m pip config unset global.user
  pause
  exit /b 1
)

echo.
echo Choose an action:
echo   1^) List local Ollama models + recommendation
echo   2^) Quick scan ^(25 songs^)
echo   3^) Full scan ^(all songs, auto model^)
echo   4^) Full scan released only ^(auto model^)
echo   5^) Custom model full scan
echo.
set /p ACTION=Enter choice [1-5]: 

if "%ACTION%"=="1" (
  echo [4/4] Running model discovery...
  call ".venv\Scripts\python.exe" -m scanner.main list-models
  goto :done
)

if "%ACTION%"=="2" (
  echo [4/4] Running quick scan...
  call ".venv\Scripts\python.exe" -m scanner.main scan --max-songs 25 --model auto --output-dir data
  goto :done
)

if "%ACTION%"=="3" (
  echo [4/4] Running full scan...
  call ".venv\Scripts\python.exe" -m scanner.main scan --model auto --output-dir data
  goto :done
)

if "%ACTION%"=="4" (
  echo [4/4] Running released-only full scan...
  call ".venv\Scripts\python.exe" -m scanner.main scan --category released --model auto --output-dir data
  goto :done
)

if "%ACTION%"=="5" (
  set /p MODEL=Enter exact Ollama model name ^(example llama3.1:8b^): 
  echo [4/4] Running custom-model full scan...
  call ".venv\Scripts\python.exe" -m scanner.main scan --model "%MODEL%" --output-dir data
  goto :done
)

echo Invalid selection.

:done
echo.
echo Finished.
echo Output files are under Scanner\data\
pause
exit /b 0
