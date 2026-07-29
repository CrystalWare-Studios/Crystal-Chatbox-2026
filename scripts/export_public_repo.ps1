$ErrorActionPreference = "Stop"

# One-way export: stages only the public-safe subset of this repo into a
# separate folder for eventual publishing to a public GitHub repo. Excludes
# every server-side Python module under app/*.py - only the frontend
# (already visible to any browser regardless of repo visibility), platform
# entrypoints/build scripts, and docs are copied.
#
# This script never pushes anywhere and never touches this repo's git state
# or history. Review the output folder, then push it to whatever public
# repo you choose when you're ready.

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Split-Path -Parent $ScriptDir
$ExportRoot = Join-Path (Split-Path -Parent $RepoRoot) "Crystal-Chatbox-public-export"

Write-Host "Exporting public-safe files to: $ExportRoot"

if (Test-Path $ExportRoot) {
    Remove-Item $ExportRoot -Recurse -Force
}
New-Item -ItemType Directory -Path $ExportRoot | Out-Null

# --- Top-level docs/license/images ---
Copy-Item (Join-Path $RepoRoot "LICENSE") $ExportRoot
Copy-Item (Join-Path $RepoRoot "Images") (Join-Path $ExportRoot "Images") -Recurse

# --- App frontend only - app/*.py (routes, spotify, vrchat_service, etc.)
# is deliberately NOT included. This is the whole point of the split. ---
New-Item -ItemType Directory -Path (Join-Path $ExportRoot "app") -Force | Out-Null
Copy-Item (Join-Path $RepoRoot "app\static") (Join-Path $ExportRoot "app\static") -Recurse
Copy-Item (Join-Path $RepoRoot "app\templates") (Join-Path $ExportRoot "app\templates") -Recurse

# --- Platform entrypoints + build scripts (thin launchers with no business
# logic - each one was reviewed for this before being added to this list). ---
$PlatformFiles = @(
    "platforms\windows\main.py",
    "platforms\windows\build_windows.ps1",
    "platforms\windows\run_windows.ps1",
    "platforms\windows\run_windows.bat",
    "platforms\windows\requirements.txt",
    "platforms\windows\icon.ico",
    "platforms\windows\version.txt",
    "platforms\macos\main.py",
    "platforms\macos\run_mac.sh",
    "platforms\macos\requirements.txt",
    "platforms\macos\version.txt",
    "platforms\macos\README.md",
    "platforms\quest\main.py",
    "platforms\quest\android_power.py",
    "platforms\quest\service\main.py",
    "platforms\quest\build_quest.sh",
    "platforms\quest\buildozer.spec",
    "platforms\quest\icon.png"
)
foreach ($rel in $PlatformFiles) {
    $src = Join-Path $RepoRoot $rel
    if (-not (Test-Path $src)) {
        Write-Warning "Skipping missing file: $rel"
        continue
    }
    $dst = Join-Path $ExportRoot $rel
    New-Item -ItemType Directory -Path (Split-Path $dst -Parent) -Force | Out-Null
    Copy-Item $src $dst
}

# --- Public-facing README + LICENSE + gitignore (written for this export,
# not copied from the private repo - see scripts/public_repo_readme.md) ---
Copy-Item (Join-Path $ScriptDir "public_repo_readme.md") (Join-Path $ExportRoot "README.md")
Copy-Item (Join-Path $ScriptDir "public_repo_gitignore.txt") (Join-Path $ExportRoot ".gitignore")

$fileCount = (Get-ChildItem $ExportRoot -Recurse -File).Count
Write-Host ""
Write-Host "Done. $fileCount files staged at:"
Write-Host "  $ExportRoot"
Write-Host ""
Write-Host "Nothing was pushed anywhere. Review the folder, then when ready:"
Write-Host "  cd `"$ExportRoot`""
Write-Host "  git init"
Write-Host "  git add ."
Write-Host "  git commit -m `"Public reference release`""
Write-Host "  git remote add origin <your-public-repo-url>"
Write-Host "  git push -u origin main"
