$ErrorActionPreference = "Stop"

$RootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Split-Path -Parent (Split-Path -Parent $RootDir)
$AppDir = Join-Path $RepoRoot "app"
$ChatboxVenv = Join-Path $RootDir ".venv"
$ChatboxPython = Join-Path $ChatboxVenv "Scripts\python.exe"

if (-not (Test-Path $ChatboxPython)) {
    throw "Virtual environment not found at $ChatboxVenv. Run run_windows.ps1 once first to set it up."
}

if (-not (Test-Path $AppDir)) {
    throw "Shared app source not found: $AppDir"
}

$Version = (Get-Content (Join-Path $RootDir "version.txt")).Trim()
$ExeName = "Crystal_Chatbox-$Version-Windows"
$BuildTmp = Join-Path $RootDir "build_tmp"
$OpenVrDll = Join-Path $ChatboxVenv "Lib\site-packages\openvr\libopenvr_api_64.dll"

Write-Host "Building $ExeName ..."
& $ChatboxPython -m pip install --upgrade pyinstaller | Out-Null

$pyinstallerArgs = @(
    "-m", "PyInstaller",
    "--noconfirm",
    "--onefile",
    "--windowed",
    "--name", $ExeName,
    "--distpath", (Join-Path $RootDir "Builds"),
    "--workpath", $BuildTmp,
    "--specpath", $BuildTmp,
    "--icon", (Join-Path $RootDir "icon.ico"),
    "--paths", $AppDir,
    "--add-data", "$AppDir\templates;templates",
    "--add-data", "$AppDir\static;static",
    "--add-data", "$AppDir\settings_template.json;.",
    "--add-data", "$RootDir\version.txt;."
)

if (Test-Path $OpenVrDll) {
    $pyinstallerArgs += @("--add-binary", "$OpenVrDll;openvr")
}

$pyinstallerArgs += (Join-Path $RootDir "main.py")

& $ChatboxPython @pyinstallerArgs

Write-Host ""
Write-Host "Built: $(Join-Path $RootDir "Builds\$ExeName.exe")"
