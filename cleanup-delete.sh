#!/bin/bash
# Cafe Canva - Cleanup & Restructure Script (Bash)
# This script performs safe, phased cleanup of junk files, moves/restructures folders, and prepares the repository.

set -e

DRY_RUN=false
FORCE=false

# Parse arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --dry-run) DRY_RUN=true ;;
        --force) FORCE=true ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=========================================================================="
echo "                   CAFE CANVA - MASTER CLEANUP SYSTEM"
echo "=========================================================================="
echo "Working Directory: $SCRIPT_DIR"

files_to_delete=(
    "App.tsx"
    "index.ts"
    "index.tsx"
    "page.tsx"
    "cafe_admin_dashboard_full.txt"
    "cafe_bill_generator_system.txt"
    "cafe_canva_project_analysis_and_code.txt"
    "cafe_canva_project_export.txt"
    "store_admin_full_code.txt"
    "store_admin_full_structure.txt"
    "prisma.config.ts"
    "firebase.json"
    "drizzle/schema.js"
    "db/setup-mvp.sql"
)

directories_to_delete=(
    "prisma"
    ".firebase"
    "utils"
    "cafecanvas-landing"
    "Backend-Software/dist"
    "Backend-Software/KOS"
    "Backend-Software/Staff"
    "Backend-Software/Super-admin"
    "Backend-Software/Store-Admin/frontend/.pnpm-store"
    "cafecanvas/apps"
    "cafecanvas/packages"
)

total_size=0
total_files_count=0
targets_found=()

echo -e "\n[PREVIEW] Scanning for deletion targets..."

# Scan single files
for file in "${files_to_delete[@]}"; do
    file_path="$SCRIPT_DIR/$file"
    if [ -f "$file_path" ]; then
        file_size=$(wc -c < "$file_path" | tr -d ' ')
        total_size=$((total_size + file_size))
        total_files_count=$((total_files_count + 1))
        echo "  [FOUND] (File) $file ($file_size bytes)"
        targets_found+=("$file")
    fi
done

# Scan directories
for dir in "${directories_to_delete[@]}"; do
    dir_path="$SCRIPT_DIR/$dir"
    if [ -d "$dir_path" ]; then
        # Find count and size
        dir_file_count=$(find "$dir_path" -type f | wc -l | tr -d ' ')
        if [ "$dir_file_count" -gt 0 ]; then
            dir_size=$(find "$dir_path" -type f -exec wc -c {} + | awk '{total += $1} END {print total}')
        else
            dir_size=0
        fi
        total_size=$((total_size + dir_size))
        total_files_count=$((total_files_count + dir_file_count))
        echo "  [FOUND] (Directory) $dir ($dir_file_count files, $dir_size bytes)"
        targets_found+=("$dir")
    fi
done

# Old root supabase scan
root_supabase_path="$SCRIPT_DIR/supabase"
if [ -d "$root_supabase_path" ]; then
    sub_file_count=$(find "$root_supabase_path" -type f | wc -l | tr -d ' ')
    if [ "$sub_file_count" -gt 0 ]; then
        sub_size=$(find "$root_supabase_path" -type f -exec wc -c {} + | awk '{total += $1} END {print total}')
    else
        sub_size=0
    fi
    total_size=$((total_size + sub_size))
    total_files_count=$((total_files_count + sub_file_count))
    echo "  [FOUND] (Directory) supabase (old root) ($sub_file_count files, $sub_size bytes)"
    targets_found+=("supabase")
fi

size_mb=$(echo "scale=2; $total_size / 1048576" | bc -l 2>/dev/null || echo "unknown")
echo -e "\nTotal targets found: ${#targets_found[@]} (${total_files_count} files)"
echo -e "Total space to reclaim: ${size_mb} MB (${total_size} bytes)"

if [ ${#targets_found[@]} -eq 0 ] && [ ! -d "$SCRIPT_DIR/cafecanvas/supabase" ]; then
    echo -e "\nNo files to delete and no cafecanvas/supabase found. Cleanup already completed!"
    exit 0
fi

if [ "$DRY_RUN" = true ]; then
    echo -e "\n[DRY RUN] Finished preview. No actions taken."
    exit 0
fi

if [ "$FORCE" != true ]; then
    read -r -p $'\nAre you sure you want to delete these files and restructure the repository? (Type YES to proceed): ' confirm
    if [ "$confirm" != "YES" ]; then
        echo "Cleanup cancelled."
        exit 0
    fi
fi

echo -e "\nStarting cleanup execution..."

# 1. Delete files
echo -e "\nPhase 1: Deleting single files..."
for file in "${files_to_delete[@]}"; do
    file_path="$SCRIPT_DIR/$file"
    if [ -f "$file_path" ]; then
        rm -f "$file_path"
        echo "  Deleted: $file"
    fi
done

# 2. Delete directories
echo -e "\nPhase 2: Deleting directories..."
for dir in "${directories_to_delete[@]}"; do
    dir_path="$SCRIPT_DIR/$dir"
    if [ -d "$dir_path" ]; then
        rm -rf "$dir_path"
        echo "  Deleted: $dir"
    fi
done

# 3. Handle supabase migration and replacement
echo -e "\nPhase 3: Replacing root supabase/ directory..."
if [ -d "$root_supabase_path" ]; then
    rm -rf "$root_supabase_path"
    echo "  Removed old root supabase/"
fi

cafecanvas_supabase="$SCRIPT_DIR/cafecanvas/supabase"
if [ -d "$cafecanvas_supabase" ]; then
    mv "$cafecanvas_supabase" "$SCRIPT_DIR/supabase"
    echo -e "  Moved cafecanvas/supabase/ -> root supabase/"
else
    echo -e "  [WARNING] cafecanvas/supabase not found. Skipping move."
fi

cafecanvas_dir="$SCRIPT_DIR/cafecanvas"
if [ -d "$cafecanvas_dir" ]; then
    if [ -z "$(ls -A "$cafecanvas_dir")" ]; then
        rm -rf "$cafecanvas_dir"
        echo "  Removed empty cafecanvas/ folder"
    else
        echo "  [WARNING] cafecanvas/ folder is not empty. Remaining items: $(ls -A "$cafecanvas_dir")"
    fi
fi

echo -e "\nCleanup and restructuring complete!"
