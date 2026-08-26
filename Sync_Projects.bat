@echo off
title Smart Two-Way Project Sync (Tatka Bazar)
color 0B
setlocal enabledelayedexpansion

:: Determine paths
set "PC_PROJECT=C:\Users\World\Desktop\Tatka Bazar 2.0"
set "USB_PROJECT=F:\Projects\Tatka Bazar 2.0"

:: If running directly from USB, adjust path dynamically
if exist "%~dp0Projects" (
    set "USB_PROJECT=%~dp0Projects\Tatka Bazar 2.0"
)

cls
echo ===============================================================================
echo            SMART TWO-WAY PROJECT SYNC (PC ^<--^> USB PENDRIVE)
echo ===============================================================================
echo.
echo  Local PC Path  : %PC_PROJECT%
echo  USB Drive Path : %USB_PROJECT%
echo.
echo ===============================================================================
echo  Select Sync Mode:
echo    [1] Smart 2-Way Sync (Recommended: Updates newest files on both sides)
echo    [2] Backup PC to USB (PC -> USB)
echo    [3] Restore USB to PC (USB -> PC)
echo    [4] Exit
echo ===============================================================================
echo.

set /p choice="Enter choice [1-4] (Default is 1): "
if "%choice%"=="" set choice=1

if "%choice%"=="1" goto SYNC_2WAY
if "%choice%"=="2" goto SYNC_PC_TO_USB
if "%choice%"=="3" goto SYNC_USB_TO_PC
if "%choice%"=="4" goto END
goto SYNC_2WAY

:SYNC_2WAY
echo.
echo [*] Step 1: Syncing newer files from PC -> USB...
robocopy "%PC_PROJECT%" "%USB_PROJECT%" /E /XO /NDL /NFL /XD node_modules .next .turbo dist .cache build
echo [*] Step 2: Syncing newer files from USB -> PC...
robocopy "%USB_PROJECT%" "%PC_PROJECT%" /E /XO /NDL /NFL /XD node_modules .next .turbo dist .cache build
echo.
echo ===============================================================================
echo  [SUCCESS] 2-Way Sync Completed! Both PC and USB are completely up to date.
echo ===============================================================================
goto FINISH

:SYNC_PC_TO_USB
echo.
echo [*] Mirroring PC -> USB...
robocopy "%PC_PROJECT%" "%USB_PROJECT%" /E /XO /NDL /NFL /XD node_modules .next .turbo dist .cache build
echo.
echo [SUCCESS] PC changes updated to USB.
goto FINISH

:SYNC_USB_TO_PC
echo.
echo [*] Mirroring USB -> PC...
robocopy "%USB_PROJECT%" "%PC_PROJECT%" /E /XO /NDL /NFL /XD node_modules .next .turbo dist .cache build
echo.
echo [SUCCESS] USB changes updated to PC.
goto FINISH

:FINISH
echo.
pause
:END
