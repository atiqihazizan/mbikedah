#!/bin/bash

echo "Starting deployment process..."

# Deploy Frontend
echo "Deploying Frontend..."
cd frontend
bash deploy.sh

# Deploy Billing API
echo "Deploying Billing API..."
cd ../billing-api
bash deploy.sh

echo "Deployment completed successfully!"
