@echo off
chcp 65001 >nul
cd /d "%~dp0"

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0enviar_GitHub.ps1"
set EXIT_CODE=%ERRORLEVEL%

if %EXIT_CODE% neq 0 (
    echo.
    echo Ocorreu um erro. Pressione qualquer tecla para fechar.
    pause >nul
)

exit /b %EXIT_CODE%
