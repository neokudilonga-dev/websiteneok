#!/bin/bash
# Deployment script for Firebase App Hosting

echo "=== Committing Next.js 15.5.7 upgrade ==="
git add package.json package-lock.json
git commit -m "Security: Upgrade Next.js to 15.5.7 (CVE-2025-55182)"

echo "=== Pushing to origin ==="
git push origin main

echo "=== Triggering Firebase deployment ==="
firebase apphosting:rollouts:create websiteneok --project biblioangola

echo "=== Deployment initiated ==="
