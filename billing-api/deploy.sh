#!/bin/bash

echo "Deploying Billing API (Node.js)..."

# Install dependencies
echo "Installing dependencies..."
npm install --production

# Build (if using TypeScript or need to build)
echo "Building application..."
npm run build

# Check if PM2 is installed globally
if ! command -v pm2 &> /dev/null
then
    echo "Installing PM2..."
    npm install -g pm2
fi

# Restart PM2 service
echo "Restarting PM2 service..."
pm2 restart mbikedah || pm2 start dist/index.js --name mbikedah

# Add all changes
echo "Adding changes to git..."
git add .

# Commit changes
echo "Committing changes..."
git commit -m "Deploy billing-api: $(date)"

# Push to main branch
echo "Pushing to main branch..."
git push origin main

echo "Billing API deployment completed!"
