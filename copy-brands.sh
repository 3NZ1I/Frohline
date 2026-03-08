#!/bin/bash
# Script to copy brand images from Windows path to project

echo "================================"
echo "Copying Brand Images"
echo "================================"
echo ""

# Source path (Windows path accessed via WSL)
SOURCE="/mnt/d/Frohline/order-management-system/frontend/brands"

# Destination path
DEST="/home/bashar/order-management-system/frontend/public/brands"

echo "Source: $SOURCE"
echo "Destination: $DEST"
echo ""

# Check if source exists
if [ ! -d "$SOURCE" ]; then
    echo "ERROR: Source directory not found: $SOURCE"
    echo ""
    echo "Please check if the path exists:"
    echo "  D:\Frohline\order-management-system\frontend\brands"
    echo ""
    exit 1
fi

# Create destination if not exists
if [ ! -d "$DEST" ]; then
    echo "Creating destination directory..."
    mkdir -p "$DEST"
fi

# Copy files
echo "Copying brand images..."
cp -v "$SOURCE"/*.* "$DEST"/ 2>/dev/null

if [ $? -eq 0 ]; then
    echo ""
    echo "================================"
    echo "✓ Brand images copied!"
    echo "================================"
    echo ""
    echo "Files copied to: $DEST"
    echo ""
    echo "List of copied files:"
    ls -la "$DEST"
    echo ""
    echo "================================"
    echo "Next step: Restart Docker"
    echo "================================"
    echo "Run: docker restart oms-frontend"
    echo ""
else
    echo ""
    echo "ERROR: Failed to copy files"
    echo "Make sure you have brand images in: $SOURCE"
    echo ""
    exit 1
fi
