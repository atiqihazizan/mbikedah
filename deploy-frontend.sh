#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Server details
SERVER_USER="mbiadmin"
SERVER_HOST="159.223.60.43"
SERVER_PORT="2323"
SERVER_FRONTEND_PATH="/var/www/mbiclickpro/frontend" # Path untuk frontend

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

# Function to print info
print_info() {
    echo -e "${BLUE}Info:${NC} $1"
}

# Check if we are in the frontend directory
if [ ! -f "package.json" ] || [ ! -d "src" ]; then
    print_error "Please run this script from the frontend directory!"
    echo "Current directory: $(pwd)"
    echo "Expected: frontend directory with package.json and src folder"
    exit 1
fi

# Check if SERVER_FRONTEND_PATH is set
if [ -z "$SERVER_FRONTEND_PATH" ]; then
    print_error "Please set SERVER_FRONTEND_PATH first!"
    echo "Example: export SERVER_FRONTEND_PATH=/var/www/mbiclickpro/frontend"
    exit 1
fi

# Check if we are in git repository
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    print_error "Not a git repository!"
    exit 1
fi

# Check if there are uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    print_warning "You have uncommitted changes!"
    echo "Current git status:"
    git status --short
    echo
    read -p "Do you want to continue with deployment? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Deployment cancelled"
        exit 0
    fi
fi

# Get current git commit info
CURRENT_COMMIT=$(git rev-parse --short HEAD)
CURRENT_BRANCH=$(git branch --show-current)
print_info "Current branch: $CURRENT_BRANCH"
print_info "Current commit: $CURRENT_COMMIT"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        print_error "Failed to install dependencies!"
        exit 1
    fi
fi

# Build the project
print_status "Building frontend project..."
npm run build
if [ $? -ne 0 ]; then
    print_error "Build failed!"
    exit 1
fi

# Check if build was successful
if [ ! -d "dist" ]; then
    print_error "Build directory 'dist' not found!"
    exit 1
fi

print_status "Build successful! 🎉"

# Ask for confirmation before deployment
echo
print_warning "About to deploy to server:"
echo "  Server: $SERVER_HOST:$SERVER_PORT"
echo "  User: $SERVER_USER"
echo "  Path: $SERVER_FRONTEND_PATH"
echo "  Branch: $CURRENT_BRANCH"
echo "  Commit: $CURRENT_COMMIT"
echo

read -p "Do you want to deploy to production? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_status "Deployment cancelled"
    exit 0
fi

# Create backup on server
print_status "Creating backup on server..."
BACKUP_NAME="frontend_bak_$(date +%Y%m%d_%H%M%S)"
ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST "cd $SERVER_FRONTEND_PATH && tar -czf ${BACKUP_NAME}.tar.gz ."

if [ $? -eq 0 ]; then
    print_status "Backup created: ${BACKUP_NAME}.tar.gz"
else
    print_warning "Failed to create backup, but continuing with deployment..."
fi

# Deploy to server
print_status "Deploying to server..."
rsync -avz --delete -e "ssh -p $SERVER_PORT" dist/ "$SERVER_USER@$SERVER_HOST:$SERVER_FRONTEND_PATH/"

if [ $? -eq 0 ]; then
    print_status "Deployment successful! 🚀"
    print_info "Frontend has been deployed to production"
    print_info "Branch: $CURRENT_BRANCH"
    print_info "Commit: $CURRENT_COMMIT"
    print_info "Backup: ${BACKUP_NAME}.tar.gz"
else
    print_error "Deployment failed!"
    exit 1
fi

# Optional: Clean up old backups (older than 7 days)
print_status "Cleaning up old backups..."
ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST "cd $SERVER_FRONTEND_PATH && find . -name 'frontend_bak_*.tar.gz' -mtime +7 -delete"

print_status "Deployment completed successfully! 🎯"
