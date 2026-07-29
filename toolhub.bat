@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"

rem ===================================================================
rem  ToolHub - ONE script for everything:
rem    import skills data -> build compact catalog -> build site
rem    -> release gates -> deploy to Cloudflare -> warm the site
rem
rem  Replaces deploy.bat / deploy_with_root_skills_data.bat /
rem  extract_skills_data_to_root.bat. ASCII + CRLF on purpose so it
rem  cannot break on Chinese Windows code pages.
rem
rem  ---- SETTINGS (edit these, nothing else) --------------------------
rem  Cloudflare API Token (leave empty to be prompted)
set "CF_TOKEN="
rem  Proxy for machines that cannot reach Cloudflare directly
rem  e.g. set "PROXY_URL=http://127.0.0.1:7890"
set "PROXY_URL="
rem  Deploy retries (asset upload can fail on unstable networks)
set "DEPLOY_RETRIES=3"
rem  Run Node unit tests + release gates before deploying (1=yes)
set "RUN_TESTS=1"
rem  Set to 0 to build locally only, without deploying
set "DO_DEPLOY=1"
rem  Where the raw skills JSON lives, if it is NOT next to this script.
rem  Must contain index.json + skills-*.json, e.g.
rem  set "SKILLS_DATA_DIR=C:\Users\Administrator\Desktop\ToolHub-v56\skills-data"
set "SKILLS_DATA_DIR="
rem  Public site URL used for warm-up and canonical URLs
set "PUBLIC_SITE_URL=https://tool.cnagt.com"
rem ===================================================================

set "LOGDIR=%~dp0.toolhub-logs"
if not exist "%LOGDIR%" mkdir "%LOGDIR%" >nul 2>nul
set "STEPS=6"

echo ==========================================================
echo   ToolHub - build, verify and deploy (single script)
echo ==========================================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js not found. Install from nodejs.org, then rerun.
  pause & exit /b 1
)
for /f "delims=" %%v in ('node -v') do echo [INFO] Node %%v
where curl >nul 2>nul
if errorlevel 1 echo [WARN] curl not found - network pre-check and warm-up will be skipped.

if not "%PUBLIC_SITE_URL%"=="" set "SITE_URL=%PUBLIC_SITE_URL%"
if not "%PROXY_URL%"=="" (
  echo [INFO] Using proxy %PROXY_URL%
  set "HTTP_PROXY=%PROXY_URL%"
  set "HTTPS_PROXY=%PROXY_URL%"
  set "ALL_PROXY=%PROXY_URL%"
  call npm config set proxy "%PROXY_URL%" >nul 2>nul
  call npm config set https-proxy "%PROXY_URL%" >nul 2>nul
)

rem ---------------------------------------------------------------
echo.
echo [1/%STEPS%] Locating skills data...
set "SKILLS_SRC="
rem a) explicit setting wins
if not "%SKILLS_DATA_DIR%"=="" if exist "%SKILLS_DATA_DIR%\index.json" set "SKILLS_SRC=%SKILLS_DATA_DIR%"
rem b) data folder sitting next to this script
if "!SKILLS_SRC!"=="" if exist "%~dp0skills-data\index.json" set "SKILLS_SRC=%~dp0skills-data"
rem c) usual places an older ToolHub tree may still live in
if "!SKILLS_SRC!"=="" for %%D in (
  "%~dp0..\skills-data"
  "%~dp0..\ToolHub-v56\skills-data"
  "%USERPROFILE%\Desktop\ToolHub-v56\skills-data"
  "%USERPROFILE%\Downloads\ToolHub-v56\skills-data"
) do (
  if "!SKILLS_SRC!"=="" if exist "%%~fD\index.json" set "SKILLS_SRC=%%~fD"
)
if "%SKILLS_SRC%"=="" if exist "%~dp0toolhub-skills-pipeline\work\site\index.json" (
  echo       skills-data\ is missing - importing from toolhub-skills-pipeline...
  if exist "%~dp0skills-data" rmdir /s /q "%~dp0skills-data"
  mkdir "%~dp0skills-data" >nul 2>nul
  copy /y "%~dp0toolhub-skills-pipeline\work\site\*.json" "%~dp0skills-data\" >nul
  if errorlevel 1 ( echo [ERROR] Import failed. & pause & exit /b 1 )
  set "SKILLS_SRC=%~dp0skills-data"
)
if "%SKILLS_SRC%"=="" (
  echo [WARN] No skills data found, so /skills.html would ship empty.
  echo        Fix it in one of two ways:
  echo          a^) copy your skills-data folder next to this script, or
  echo          b^) edit this file and set SKILLS_DATA_DIR to its full path
  echo             e.g. C:\Users\Administrator\Desktop\ToolHub-v56\skills-data
  set /p SKILLS_ANSWER=Continue without the skills catalog? [y/N]: 
  if /i not "!SKILLS_ANSWER!"=="y" ( echo Aborted - nothing was built or deployed. ^& pause ^& exit /b 1 )
) else (
  echo [OK]  Data source: !SKILLS_SRC!
)

rem ---------------------------------------------------------------
echo.
echo [2/%STEPS%] Building compact skills catalog (shards for Cloudflare)...
if not "%SKILLS_SRC%"=="" (
  set "SKILLS_DATA_DIR=!SKILLS_SRC!"
  call node --max-old-space-size=4096 build/build-skills-catalog.mjs
  if errorlevel 1 ( echo [ERROR] Skills catalog build failed - aborting. & pause & exit /b 1 )
) else (
  echo       skipped (no source data^).
)

rem ---------------------------------------------------------------
echo.
echo [3/%STEPS%] Installing dependencies (first run only)...
call npm install
if errorlevel 1 ( echo [ERROR] npm install failed. & pause & exit /b 1 )

echo.
echo [4/%STEPS%] Building static site (pages, sitemap, robots)...
call node build/build.mjs
if errorlevel 1 ( echo [ERROR] Site build failed. & pause & exit /b 1 )

rem ---------------------------------------------------------------
echo.
echo [5/%STEPS%] Release gates...
if "%RUN_TESTS%"=="1" (
  call node build/release-check.mjs
  if errorlevel 1 ( echo [ERROR] Release check failed - aborting. & pause & exit /b 1 )
  call node tests/static-release.test.mjs
  if errorlevel 1 ( echo [ERROR] Static release audit failed - aborting. & pause & exit /b 1 )
  for %%T in (core core.v2 core.v3 core.v4 worker) do (
    call node tests\%%T.test.mjs
    if errorlevel 1 ( echo [ERROR] Unit tests failed ^(tests\%%T.test.mjs^) - aborting. & pause & exit /b 1 )
  )
  call node build/selfcheck.mjs
  if errorlevel 1 ( echo [ERROR] Selfcheck failed - aborting. & pause & exit /b 1 )
  echo [OK]  All gates passed.
) else (
  echo       skipped ^(RUN_TESTS=0^).
)

if not "%DO_DEPLOY%"=="1" (
  echo.
  echo ==========================================================
  echo   Local build finished. DO_DEPLOY=0, so nothing was
  echo   uploaded. Preview with:  npm run serve
  echo ==========================================================
  pause & exit /b 0
)

rem ---------------------------------------------------------------
if not "%CF_TOKEN%"=="" set "CLOUDFLARE_API_TOKEN=%CF_TOKEN%"
if "%CLOUDFLARE_API_TOKEN%"=="" set /p CLOUDFLARE_API_TOKEN=Paste your Cloudflare API Token: 
if "%CLOUDFLARE_API_TOKEN%"=="" ( echo [ERROR] No API Token provided. & pause & exit /b 1 )

where curl >nul 2>nul
if not errorlevel 1 (
  curl -I --connect-timeout 15 --max-time 30 https://api.cloudflare.com/client/v4 > "%LOGDIR%\cf_api.log" 2>&1
  if errorlevel 1 (
    echo [WARN] Cannot reach the Cloudflare API - proxy/VPN/firewall issue?
    echo        Continuing, but asset upload may fail.
  ) else (
    echo [OK]  Cloudflare API reachable.
  )
)

call npx wrangler whoami > "%LOGDIR%\whoami.log" 2>&1
if errorlevel 1 (
  type "%LOGDIR%\whoami.log"
  echo [ERROR] Wrangler cannot verify your token/account.
  echo   1^) Token needs Workers Scripts:Edit
  echo   2^) Proxy/VPN/firewall may block Node
  pause & exit /b 1
)

echo.
echo [6/%STEPS%] Deploying Worker + static assets...
set "SITE_URL_LIVE="
set "DEPLOY_OK=0"
set /a TRY=1

:DEPLOY_LOOP
echo ---- attempt !TRY! / %DEPLOY_RETRIES% ----
call npx wrangler deploy > "%LOGDIR%\deploy.log" 2>&1
set "RC=!errorlevel!"
type "%LOGDIR%\deploy.log"
if "!RC!"=="0" ( set "DEPLOY_OK=1" & goto DEPLOY_DONE )
echo [WARN] Deploy attempt !TRY! failed.
findstr /i "fetch failed assets-upload-session connectivity proxy firewall network" "%LOGDIR%\deploy.log" >nul 2>nul
if not errorlevel 1 echo [DIAGNOSIS] Looks like a network/asset-upload failure, not a code error.
set /a TRY+=1
if !TRY! LEQ %DEPLOY_RETRIES% (
  timeout /t 8 /nobreak >nul
  goto DEPLOY_LOOP
)

:DEPLOY_DONE
if not "%DEPLOY_OK%"=="1" (
  echo [ERROR] Deploy failed after %DEPLOY_RETRIES% attempts.
  echo   1^) Set PROXY_URL at the top of this file
  echo   2^) Or switch network / VPN node and rerun
  echo   3^) Log: %LOGDIR%\deploy.log
  pause & exit /b 1
)

for /f "usebackq tokens=*" %%L in (`findstr /i "workers.dev" "%LOGDIR%\deploy.log"`) do (
  for %%u in (%%L) do (
    echo %%u| findstr /i /b "https://" >nul && if not defined SITE_URL_LIVE set "SITE_URL_LIVE=%%u"
  )
)
if not "%PUBLIC_SITE_URL%"=="" set "SITE_URL_LIVE=%PUBLIC_SITE_URL%"

where curl >nul 2>nul
if not errorlevel 1 if defined SITE_URL_LIVE (
  echo Warming key pages...
  curl -L -s -o nul --connect-timeout 15 --max-time 60 "!SITE_URL_LIVE!/"
  curl -L -s -o nul --connect-timeout 15 --max-time 60 "!SITE_URL_LIVE!/skills.html"
  curl -L -s -o nul --connect-timeout 15 --max-time 60 "!SITE_URL_LIVE!/assets/data/skills/meta.json"
  curl -L -s -o nul --connect-timeout 15 --max-time 60 "!SITE_URL_LIVE!/healthz"
  echo [OK]  Warmed home, /skills.html, catalog index and health endpoint.
)

echo.
echo ==========================================================
if defined SITE_URL_LIVE (
  echo   Done. Live at: !SITE_URL_LIVE!
  echo   Skills catalog: !SITE_URL_LIVE!/skills.html
  start "" "!SITE_URL_LIVE!/skills.html"
) else (
  echo   Done. Open the https://...workers.dev URL printed above.
)
echo   Seeing old pages? Press Ctrl+F5 or use a private window.
echo ==========================================================
pause
endlocal
