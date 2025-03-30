#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Server details
SERVER_USER="mbiadmin"
SERVER_HOST="159.223.60.43"
SERVER_PORT="2323"
SERVER_API_PATH="/var/www/mbiclickpro" # Path akan dimasukkan kemudian
BACKUP_HOURS=1  # Default: padam backup yang kurang dari 1 jam

# Function to print status
print_status() {
    echo -e "${GREEN}==>${NC} $1"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}Warning:${NC} $1"
}

# Function to print error
print_error() {
    echo -e "${RED}Error:${NC} $1"
}

# Function untuk remove backup files
remove_old_backups() {
    local file=$1
    local current_time=$(date +%s)
    local hours_ago=$((current_time - (BACKUP_HOURS * 3600)))
    local today=$(date "+%Y%m%d")
    
    if [ -z "$file" ]; then
        return 1
    fi
    
    print_status "Checking old backups for: $file"
    
    local backup_dir=$(dirname "$file")
    local file_pattern="${file##*/}"
    
    # Get list of all backup files for this file pattern
    local old_backups=$(ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST "cd $SERVER_API_PATH/$backup_dir && ls -t _bak.*.${file_pattern} 2>/dev/null")
    
    # Create temporary files
    local temp_file=$(mktemp)
    local date_file=$(mktemp)
    
    # First pass: find backups to keep and track dates
    local found_backup=0
    
    echo "$old_backups" | while read backup; do
        if [ -z "$backup" ]; then
            continue
        fi
        
        local file_date=$(echo "$backup" | cut -d. -f2 | cut -d_ -f1)
        
        # For previous days' backups
        if [ "$file_date" != "$today" ]; then
            # Keep newest backup for each previous day
            if ! grep -q "^${file_date}$" "$date_file"; then
                echo "$file_date" >> "$date_file"
                echo "${file_date} ${backup}" >> "$temp_file"
                print_status "Keeping latest backup from ${file_date}: $backup"
                found_backup=1
            fi
        fi
    done
    
    # Second pass: remove all backups except those in temp_file
    if [ "$found_backup" -eq 0 ]; then
        print_warning "No backups found to keep for: $file"
    fi
    
    echo "$old_backups" | while read backup; do
        if [ -z "$backup" ]; then
            continue
        fi
        
        # Check if this backup should be kept
        if ! grep -q " ${backup}$" "$temp_file"; then
            print_status "Removing backup: $backup"
            ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST "rm '$SERVER_API_PATH/$backup_dir/$backup'"
        fi
    done
    
    # Cleanup temp files
    rm -f "$temp_file" "$date_file"
    
    return 0
}

# Function untuk backup file di server
backup_server_file() {
    local file=$1
    
    if [ -z "$file" ]; then
        return 1
    fi
    
    print_status "Backing up: $file"
    
    # Remove old backups first
    remove_old_backups "$file"
    
    # Get current date for backup filename
    local backup_date=$(date "+%Y%m%d_%H%M%S")
    local backup_file="_bak.${backup_date}.${file##*/}"
    local backup_dir=$(dirname "$file")
    
    # Create new backup
    if ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST "[ -f '$SERVER_API_PATH/$file' ]"; then
        if ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST "cp '$SERVER_API_PATH/$file' '$SERVER_API_PATH/$backup_dir/$backup_file'"; then
            print_status "Created backup: $backup_dir/$backup_file"
            return 0
        else
            print_error "Failed to create backup for: $file"
            return 1
        fi
    else
        print_warning "File not found on server: $file"
        return 1
    fi
    
    return 0
}

# Function untuk dapatkan senarai fail yang berubah dalam folder api
get_api_changed_files() {
    # Dapatkan fail yang dimodifikasi
    git status --porcelain | grep "^.M" | cut -c4- | grep "^api/"
    # Dapatkan fail yang ditambah
    git status --porcelain | grep "^.A" | cut -c4- | grep "^api/"
    # Dapatkan fail yang belum di-track
    git ls-files --others --exclude-standard | grep "^api/"
}

# Check if SERVER_API_PATH is set
if [ -z "$SERVER_API_PATH" ]; then
    print_error "Please set SERVER_API_PATH first!"
    echo "Example: export SERVER_API_PATH=/var/www/mbiclickpro/api"
    exit 1
fi

# Check if BACKUP_HOURS is valid
if ! [[ "$BACKUP_HOURS" =~ ^[0-9]+$ ]] || [ "$BACKUP_HOURS" -lt 1 ]; then
    print_error "BACKUP_HOURS must be a positive integer!"
    echo "Example: export BACKUP_HOURS=2"
    exit 1
fi

# Check if we are in git repository
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    print_error "Not a git repository!"
    exit 1
fi

# Get list of changed files
print_status "Checking for changes in api folder..."
print_status "Backup files older than ${BACKUP_HOURS} hour(s) will be removed"

# Save files to array
IFS=$'\n' read -r -d '' -a changed_files < <(get_api_changed_files | sort -u && printf '\0')

if [ ${#changed_files[@]} -eq 0 ]; then
    print_status "No changes found in api folder"
    exit 0
fi

# Show changed files
print_status "Files that will be uploaded:"
printf '%s\n' "${changed_files[@]}"
echo

# Ask for confirmation
read -p "Do you want to upload these files? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_status "Upload cancelled"
    exit 0
fi

# Upload each file
print_status "Processing files..."

for file in "${changed_files[@]}"; do
    if [ -n "$file" ]; then
        print_status "Processing: $file"
        
        # Get the relative path from api folder
        relative_path=${file#api/}
        
        # Backup existing file first
        if ! backup_server_file "$relative_path"; then
            print_error "Failed to backup file: $relative_path"
            continue
        fi
        
        # Create target directory if not exists
        ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST "mkdir -p $SERVER_API_PATH/$(dirname $relative_path)"
        
        # Upload file
        rsync -avz -e "ssh -p $SERVER_PORT" "$file" "$SERVER_USER@$SERVER_HOST:$SERVER_API_PATH/$relative_path"
        
        if [ $? -eq 0 ]; then
            print_status "Uploaded: $file"
        else
            print_error "Failed to upload: $file"
        fi
    fi
done

print_status "Upload completed! 🚀"
