# Cafe Canva - Cleanup & Restructure Script (PowerShell)
# This script performs safe, phased cleanup of junk files, moves/restructures folders, and prepares the repository.

param (
    [switch]$DryRun = $false,
    [switch]$Force = $false
)

$ErrorActionPreference = "Stop"
$scriptDir = $PSScriptRoot
if ([string]::IsNullOrEmpty($scriptDir)) {
    $scriptDir = Get-Location
}

Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host "                   CAFE CANVA - MASTER CLEANUP SYSTEM" -ForegroundColor Cyan
Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host "Working Directory: $scriptDir" -ForegroundColor Yellow

# Define lists of files and directories to delete
$filesToDelete = @(
    "App.tsx",
    "index.ts",
    "index.tsx",
    "page.tsx",
    "cafe_admin_dashboard_full.txt",
    "cafe_bill_generator_system.txt",
    "cafe_canva_project_analysis_and_code.txt",
    "cafe_canva_project_export.txt",
    "store_admin_full_code.txt",
    "store_admin_full_structure.txt",
    "prisma.config.ts",
    "firebase.json",
    "drizzle/schema.js",
    "db/setup-mvp.sql"
)

$directoriesToDelete = @(
    "prisma",
    ".firebase",
    "utils",
    "cafecanvas-landing",
    "Backend-Software/dist",
    "Backend-Software/KOS",
    "Backend-Software/Staff",
    "Backend-Software/Super-admin",
    "Backend-Software/Store-Admin/frontend/.pnpm-store",
    "cafecanvas/apps",
    "cafecanvas/packages"
)

# Calculate totals and preview targets
$totalSize = 0
$totalFilesCount = 0
$targetsToProcess = @()

Write-Host "`n[PREVIEW] Scanning for deletion targets..." -ForegroundColor Yellow

# Process single files
foreach ($file in $filesToDelete) {
    $filePath = Join-Path $scriptDir $file
    if (Test-Path $filePath -PathType Leaf) {
        $fileInfo = Get-Item $filePath
        $totalSize += $fileInfo.Length
        $totalFilesCount++
        $targetsToProcess += [PSCustomObject]@{
            Path = $file
            Type = "File"
            Size = $fileInfo.Length
        }
        Write-Host "  [FOUND] (File) $file ($($fileInfo.Length) bytes)" -ForegroundColor Gray
    }
}

# Process directories
foreach ($dir in $directoriesToDelete) {
    $dirPath = Join-Path $scriptDir $dir
    if (Test-Path $dirPath -PathType Container) {
        $files = Get-ChildItem -Path $dirPath -Recurse -File -ErrorAction SilentlyContinue
        $dirSize = 0
        $dirFileCount = 0
        foreach ($f in $files) {
            $dirSize += $f.Length
            $dirFileCount++
        }
        $totalSize += $dirSize
        $totalFilesCount += $dirFileCount
        $targetsToProcess += [PSCustomObject]@{
            Path = $dir
            Type = "Directory"
            Size = $dirSize
        }
        Write-Host "  [FOUND] (Directory) $dir ($dirFileCount files, $dirSize bytes)" -ForegroundColor Gray
    }
}

# Root supabase directory will be fully replaced
$rootSupabasePath = Join-Path $scriptDir "supabase"
if (Test-Path $rootSupabasePath -PathType Container) {
    $files = Get-ChildItem -Path $rootSupabasePath -Recurse -File -ErrorAction SilentlyContinue
    $subSize = 0
    $subFileCount = 0
    foreach ($f in $files) {
        $subSize += $f.Length
        $subFileCount++
    }
    $totalSize += $subSize
    $totalFilesCount += $subFileCount
    $targetsToProcess += [PSCustomObject]@{
        Path = "supabase (old root)"
        Type = "Directory"
        Size = $subSize
    }
    Write-Host "  [FOUND] (Directory) supabase (old root to be replaced) ($subFileCount files, $subSize bytes)" -ForegroundColor Gray
}

# Summary of scan
$sizeInMb = [Math]::Round($totalSize / 1MB, 2)
Write-Host "`nTotal items to delete: $($targetsToProcess.Count) targets ($totalFilesCount files)" -ForegroundColor Cyan
Write-Host "Total space to reclaim: $sizeInMb MB ($totalSize bytes)" -ForegroundColor Cyan

if ($targetsToProcess.Count -eq 0 -and !(Test-Path (Join-Path $scriptDir "cafecanvas/supabase"))) {
    Write-Host "`nNo files to delete and no cafecanvas/supabase found. Cleanup already completed!" -ForegroundColor Green
    exit 0
}

# If DryRun, exit now
if ($DryRun) {
    Write-Host "`n[DRY RUN] Finished preview. No actions taken." -ForegroundColor Yellow
    exit 0
}

# Confirm execution unless Force is active
if (!$Force) {
    $confirm = Read-Host "`nAre you sure you want to delete these files and restructure the repository? (Type 'YES' to proceed)"
    if ($confirm -ne "YES") {
        Write-Host "Cleanup cancelled." -ForegroundColor Red
        exit 0
    }
}

Write-Host "`nStarting cleanup execution..." -ForegroundColor Green

# 1. Delete single files
Write-Host "`nPhase 1: Deleting single files..." -ForegroundColor Yellow
foreach ($file in $filesToDelete) {
    $filePath = Join-Path $scriptDir $file
    if (Test-Path $filePath -PathType Leaf) {
        Remove-Item $filePath -Force
        Write-Host "  Deleted: $file" -ForegroundColor Gray
    }
}

# 2. Delete directories
Write-Host "`nPhase 2: Deleting directories..." -ForegroundColor Yellow
foreach ($dir in $directoriesToDelete) {
    $dirPath = Join-Path $scriptDir $dir
    if (Test-Path $dirPath -PathType Container) {
        Remove-Item $dirPath -Recurse -Force
        Write-Host "  Deleted: $dir" -ForegroundColor Gray
    }
}

# 3. Handle Supabase migration and replacement
Write-Host "`nPhase 3: Replacing root supabase/ directory..." -ForegroundColor Yellow
if (Test-Path $rootSupabasePath -PathType Container) {
    Remove-Item $rootSupabasePath -Recurse -Force
    Write-Host "  Removed old root supabase/" -ForegroundColor Gray
}

$cafecanvasSupabase = Join-Path $scriptDir "cafecanvas/supabase"
if (Test-Path $cafecanvasSupabase -PathType Container) {
    Move-Item -Path $cafecanvasSupabase -Destination $scriptDir -Force
    Write-Host "  Moved cafecanvas/supabase/ -> root supabase/" -ForegroundColor Green
} else {
    Write-Host "  [WARNING] cafecanvas/supabase not found. Skipping move." -ForegroundColor Red
}

# Remove cafecanvas directory if it is empty now
$cafecanvasDir = Join-Path $scriptDir "cafecanvas"
if (Test-Path $cafecanvasDir -PathType Container) {
    $remaining = Get-ChildItem -Path $cafecanvasDir
    if ($remaining.Count -eq 0) {
        Remove-Item $cafecanvasDir -Recurse -Force
        Write-Host "  Removed empty cafecanvas/ folder" -ForegroundColor Gray
    } else {
        Write-Host "  [WARNING] cafecanvas/ folder is not empty. Remaining items: $($remaining.Name)" -ForegroundColor Yellow
    }
}

Write-Host "`nCleanup and restructuring complete!" -ForegroundColor Green
