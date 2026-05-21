@echo off
title Claude Agent SDK Multi-Agent Demo Launcher
cls

echo ================================================================
echo    CLAUDE AGENT SDK - MULTI-AGENT DEMO LAUNCHER
echo ================================================================
echo.

:: Check for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js was not found. Please install Node.js (v18+) to run this demo.
    pause
    exit /b 1
)

:: Check for node_modules
if not exist "node_modules" (
    echo [INFO] node_modules not found. Installing dependencies...
    call npm install
)

:: Check for API Key
if "%ANTHROPIC_API_KEY%"=="" (
    if exist ".env" (
        echo [INFO] Loading ANTHROPIC_API_KEY from .env file...
        for /f "tokens=1,2 delims==" %%I in (.env) do (
            if "%%I"=="ANTHROPIC_API_KEY" set ANTHROPIC_API_KEY=%%J
        )
    )
)

if "%ANTHROPIC_API_KEY%"=="" (
    echo [WARNING] ANTHROPIC_API_KEY is not set in your environment.
    echo.
    echo Please paste your Anthropic API Key (from console.anthropic.com)
    set /p USER_KEY="API Key: "
    
    if "%USER_KEY%"=="" (
        echo [ERROR] No API key entered. The agent query will fail without authentication.
        echo.
    ) else (
        set ANTHROPIC_API_KEY=%USER_KEY%
        echo [INFO] API key set for this terminal session.
    )
)

echo.
echo [INFO] Executing agent-demo.js...
echo.
node agent-demo.js
echo.
echo ================================================================
echo Demo execution finished.
pause
