@echo off
setlocal EnableExtensions
chcp 936 >nul
title ToolHub - 一键上传完整源码并启用自动更新
cd /d "%~dp0"

echo.
echo ==========================================================
echo  ToolHub - 上传完整源码到 GitHub（中文一键版）
echo ==========================================================
echo.

if not exist "package.json" (
  echo [错误] 当前目录不是完整 ToolHub 源码根目录。
  echo 请把本脚本和 GitHub自动更新文件 文件夹复制到 ToolHub 完整源码根目录。
  pause
  exit /b 1
)

where git >nul 2>nul
if errorlevel 1 (
  echo [需要一次性安装] 电脑没有 Git 上传工具。
  echo 即将打开官方下载页。安装时保持默认选项，一直点击 Next 即可。
  start "" "https://git-scm.com/download/win"
  echo 安装完成后请关闭本窗口，再重新双击本脚本。
  pause
  exit /b 1
)

echo [OK] 找到 Git：
git --version
echo.
echo 将把当前完整 ToolHub 源码上传到：https://github.com/xiusennn/CF
echo 说明：GitHub 仓库目前缺少完整源码，本操作会以当前源码更新 main 分支。
choice /C YN /N /M "确认开始上传吗？[Y/N]"
if errorlevel 2 (
  echo 已取消，未修改 GitHub 文件。
  pause
  exit /b 0
)

echo.
echo [1/5] 写入已验证的自动更新工作流...
if not exist ".github\workflows" mkdir ".github\workflows"
copy /Y "GitHub自动更新文件\.github\workflows\sync-skills.yml" ".github\workflows\sync-skills.yml" >nul
copy /Y "GitHub自动更新文件\.github\workflows\sync-free-llm.yml" ".github\workflows\sync-free-llm.yml" >nul
if errorlevel 1 (
  echo [错误] 无法写入 .github\workflows 文件。
  pause
  exit /b 1
)

echo [2/5] 准备完整源码...
if not exist ".git" git init
git config user.name "xiusennn"
git config user.email "xiusennn@users.noreply.github.com"
git branch -M main
git remote get-url origin >nul 2>nul
if errorlevel 1 (
  git remote add origin "https://github.com/xiusennn/CF.git"
) else (
  git remote set-url origin "https://github.com/xiusennn/CF.git"
)

echo [3/5] 整理文件清单，首次约一万多个文件，请耐心等待...
git add -A
git diff --cached --quiet
if errorlevel 1 (
  git commit -m "chore: add complete ToolHub source and automation"
  if errorlevel 1 (
    echo [错误] 本地提交失败。
    pause
    exit /b 1
  )
) else (
  echo [提示] 没有检测到新增修改，继续检查远程仓库。
)

echo [4/5] 首次上传时，浏览器会要求登录 GitHub 并授权。
echo 请在浏览器中登录 xiusennn，点击 Authorize 后回到本窗口。
echo [5/5] 正在上传完整源码，请勿关闭窗口...
git push -u origin main --force
if errorlevel 1 (
  echo.
  echo [错误] 上传未完成。请完成浏览器中的 GitHub 登录/授权后，再重新双击本脚本。
  pause
  exit /b 1
)

echo.
echo ==========================================================
echo [成功] 完整源码已上传，自动工作流已写入 GitHub。
echo 下一步：在 GitHub 仓库 Settings - Secrets and variables - Actions 中新增 CLOUDFLARE_API_TOKEN。
echo 然后打开 Actions - 自动同步 Agent Skills - Run workflow，首次填 50。
echo ==========================================================
start "" "https://github.com/xiusennn/CF/actions"
pause
