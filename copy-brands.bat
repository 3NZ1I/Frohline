@echo off
echo Copying brand images to project...
echo.

REM Source directory (your brand images location)
set SOURCE=D:\Frohline\order-management-system\frontend\brands

REM Destination directory (Docker volume mounted location)
set DEST=%~dp0frontend\public\brands

echo Source: %SOURCE%
echo Destination: %DEST%
echo.

if not exist "%SOURCE%" (
    echo ERROR: Source directory not found: %SOURCE%
    echo Please check the path and try again.
    pause
    exit /b 1
)

if not exist "%DEST%" (
    echo Creating destination directory...
    mkdir "%DEST%"
)

echo Copying files...
xcopy "%SOURCE%\*.*" "%DEST%" /Y /I

echo.
echo ====================================
echo Brand images copied successfully!
echo ====================================
echo.
echo Next steps:
echo 1. Restart Docker containers:
echo    docker-compose restart
echo.
echo 2. Or restart manually:
echo    docker restart oms-frontend
echo.
pause
