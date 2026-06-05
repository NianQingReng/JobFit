@echo off
echo ===== JobFit Smart Resume Workshop - Dev Mode =====

:: Start backend
echo [1/2] Starting backend service (port 8000)
start "JobFit-Backend" cmd /c "cd /d %~dp0backend && python -m uvicorn app.main:app --reload --port 8000"

:: Wait for backend
timeout /t 3 /nobreak >nul

:: Start frontend
echo [2/2] Starting frontend dev server (port 5173)
start "JobFit-Frontend" cmd /c "cd /d %~dp0frontend && npm run dev"

echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo API Docs: http://localhost:8000/docs
echo.
pause