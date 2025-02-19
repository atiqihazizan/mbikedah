#!/bin/bash

echo "Deploying Frontend..."

# Build frontend
echo "Building frontend..."
npm run build

# Add all changes
echo "Adding changes to git..."
git add .

# Commit changes
echo "Committing changes..."
git commit -m "Deploy frontend: $(date)"

# Push to main branch
echo "Pushing to main branch..."
git push origin main

echo "Frontend deployment completed!"
