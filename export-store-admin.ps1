# Export Store-Admin folder structure and all source code to a single .txt file
$rootPath = "D:\Cafe Canva\Backend-Software\Store-Admin"
$outputFile = "D:\Cafe Canva\store_admin_full_structure.txt"

# Collect all source files (exclude node_modules, .next, out, .pnpm-store, storefront-themes large files)
$files = Get-ChildItem -Path $rootPath -Recurse -File | Where-Object {
    $_.FullName -notmatch '(\\node_modules\\|\\\.next\\|\\\.pnpm-store\\|\\out\\|\\\.git\\)' -and
    $_.Name -ne 'package-lock.json' -and
    $_.Extension -notmatch '\.(blockmap|ico)$'
} | Sort-Object FullName

$sb = [System.Text.StringBuilder]::new()

# Header
[void]$sb.AppendLine("=" * 80)
[void]$sb.AppendLine("CAFECANVAS STORE-ADMIN — COMPLETE FOLDER, FILE & CODE STRUCTURE")
[void]$sb.AppendLine("Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')")
[void]$sb.AppendLine("Root: $rootPath")
[void]$sb.AppendLine("=" * 80)
[void]$sb.AppendLine("")

# SECTION 1: Directory Tree
[void]$sb.AppendLine("╔══════════════════════════════════════════════════════════════╗")
[void]$sb.AppendLine("║  SECTION 1: DIRECTORY TREE                                  ║")
[void]$sb.AppendLine("╚══════════════════════════════════════════════════════════════╝")
[void]$sb.AppendLine("")

# Build tree from directories
$dirs = Get-ChildItem -Path $rootPath -Recurse -Directory | Where-Object {
    $_.FullName -notmatch '(\\node_modules|\\\.next|\\\.pnpm-store|\\out\\|\\\.git)'
} | Sort-Object FullName

[void]$sb.AppendLine("Store-Admin/")
foreach ($dir in $dirs) {
    $rel = $dir.FullName.Replace("$rootPath\", "")
    $depth = ($rel.Split('\').Length)
    $indent = "│   " * ($depth - 1) + "├── "
    $childFiles = Get-ChildItem -Path $dir.FullName -File -ErrorAction SilentlyContinue | Where-Object {
        $_.FullName -notmatch '(\\node_modules\\|\\\.next\\)' -and $_.Name -ne 'package-lock.json'
    }
    $fileCount = if ($childFiles) { $childFiles.Count } else { 0 }
    [void]$sb.AppendLine("$indent$($dir.Name)/ ($fileCount files)")
}
[void]$sb.AppendLine("")

# SECTION 2: Complete File Listing
[void]$sb.AppendLine("╔══════════════════════════════════════════════════════════════╗")
[void]$sb.AppendLine("║  SECTION 2: COMPLETE FILE LISTING                           ║")
[void]$sb.AppendLine("╚══════════════════════════════════════════════════════════════╝")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("Total source files: $($files.Count)")
[void]$sb.AppendLine("")

foreach ($file in $files) {
    $rel = $file.FullName.Replace("$rootPath\", "")
    $sizeKB = [math]::Round($file.Length / 1024, 1)
    [void]$sb.AppendLine("  $rel  ($sizeKB KB)")
}
[void]$sb.AppendLine("")

# SECTION 3: Full Source Code
[void]$sb.AppendLine("╔══════════════════════════════════════════════════════════════╗")
[void]$sb.AppendLine("║  SECTION 3: FULL SOURCE CODE                                ║")
[void]$sb.AppendLine("╚══════════════════════════════════════════════════════════════╝")
[void]$sb.AppendLine("")

# Skip binary and very large theme files
$skipExtensions = @('.exe', '.blockmap', '.ico', '.png', '.jpg', '.jpeg', '.gif', '.woff', '.woff2', '.ttf', '.eot')

foreach ($file in $files) {
    $rel = $file.FullName.Replace("$rootPath\", "")
    
    # Skip binary files
    if ($skipExtensions -contains $file.Extension.ToLower()) {
        [void]$sb.AppendLine("─" * 80)
        [void]$sb.AppendLine("FILE: $rel")
        [void]$sb.AppendLine("[BINARY FILE — SKIPPED]")
        [void]$sb.AppendLine("")
        continue
    }
    
    # Skip very large files (>60KB) — just note them
    if ($file.Length -gt 61440) {
        [void]$sb.AppendLine("─" * 80)
        [void]$sb.AppendLine("FILE: $rel")
        $sizeKB = [math]::Round($file.Length / 1024, 1)
        [void]$sb.AppendLine("[LARGE FILE — $sizeKB KB — first 200 lines shown]")
        [void]$sb.AppendLine("")
        try {
            $content = Get-Content -Path $file.FullName -TotalCount 200 -ErrorAction Stop
            foreach ($line in $content) {
                [void]$sb.AppendLine($line)
            }
        } catch {
            [void]$sb.AppendLine("[ERROR READING FILE]")
        }
        [void]$sb.AppendLine("")
        continue
    }

    [void]$sb.AppendLine("─" * 80)
    [void]$sb.AppendLine("FILE: $rel")
    [void]$sb.AppendLine("─" * 80)
    
    try {
        $content = Get-Content -Path $file.FullName -Raw -ErrorAction Stop
        [void]$sb.AppendLine($content)
    } catch {
        [void]$sb.AppendLine("[ERROR READING FILE: $($_.Exception.Message)]")
    }
    [void]$sb.AppendLine("")
}

# Footer
[void]$sb.AppendLine("=" * 80)
[void]$sb.AppendLine("END OF EXPORT")
[void]$sb.AppendLine("=" * 80)

# Write to file
$sb.ToString() | Out-File -FilePath $outputFile -Encoding utf8

$finalSize = [math]::Round((Get-Item $outputFile).Length / 1024, 1)
Write-Host "Export complete: $outputFile ($finalSize KB, $($files.Count) files)"
