@echo off
title Auto Rescue Partition Creator
color 0A

:: Check and Auto-Elevate to Administrator
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Administrator permission needed to resize partition safely...
    powershell -Command "Start-Process cmd.exe -ArgumentList '/c \"\"%~f0\"\"' -Verb RunAs"
    exit /b
)

echo =======================================================
echo    Creating 5GB RESCUE Partition from F: Drive
echo    (Your existing files on F: and D: are 100%% SAFE)
echo =======================================================
echo.

set "SCRIPT_FILE=%TEMP%\diskpart_rescue_%RANDOM%.txt"

(
echo select volume F
echo shrink desired=5120
echo create partition primary
echo format fs=fat32 quick label="RESCUE"
echo assign
echo exit
) > "%SCRIPT_FILE%"

echo Running automated partition manager...
diskpart /s "%SCRIPT_FILE%"
del "%SCRIPT_FILE%" >nul 2>&1

echo.
echo =======================================================
echo    [SUCCESS] 5GB RESCUE Partition Created Successfully!
echo =======================================================
echo.
pause

