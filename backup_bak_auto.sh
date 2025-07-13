#!/bin/bash
# Skrip ini akan buat folder backup ikut tarikh dan masa sekarang,
# senaraikan semua fail .bak dalam frontend dan api,
# dan pindahkan ke folder backup yang baru dibuat.

# Dapatkan tarikh dan masa sekarang dalam format YYYYMMDD_HHMMSS
NOW=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="backup/$NOW"

# Pastikan folder backup wujud
mkdir -p "$BACKUP_DIR"

echo "Folder backup baru: $BACKUP_DIR"

# Cari semua fail .bak dalam frontend dan api
find frontend api -type f -name "*.bak" > bak_files.txt

echo "Senarai fail .bak yang dijumpai:"
cat bak_files.txt

# Pindahkan semua fail .bak ke folder backup
while IFS= read -r file; do
  # Pastikan fail wujud sebelum pindah
  if [ -f "$file" ]; then
    mv "$file" "$BACKUP_DIR/"
    echo "Pindah: $file -> $BACKUP_DIR/"
  fi
done < bak_files.txt

# Padam fail senarai sementara
rm bak_files.txt

echo "Selesai pindahkan semua fail .bak ke $BACKUP_DIR"
