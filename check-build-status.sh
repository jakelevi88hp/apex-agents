#!/bin/bash

# Build Status Checker for Apex Agents

PROJECT_DIR="/home/ubuntu/apex-agents-main"
BUILD_DIR="$PROJECT_DIR/.next"

echo "=========================================="
echo "Apex Agents - Build Status Checker"
echo "=========================================="
echo ""

# Check if build directory exists
if [ ! -d "$BUILD_DIR" ]; then
    echo "❌ Build directory not found"
    echo "Status: NOT STARTED"
    exit 1
fi

# Check for BUILD_ID (indicates completion)
if [ -f "$BUILD_DIR/BUILD_ID" ]; then
    BUILD_ID=$(cat "$BUILD_DIR/BUILD_ID")
    echo "✅ BUILD COMPLETE"
    echo "Build ID: $BUILD_ID"
    echo ""
    echo "Build artifacts:"
    ls -lh "$BUILD_DIR" | grep -E "manifest|BUILD_ID" | awk '{print "  " $9 " (" $5 ")"}'
    echo ""
    echo "Ready to deploy!"
    exit 0
fi

# Check for build manifests
if [ -f "$BUILD_DIR/app-build-manifest.json" ]; then
    echo "✅ BUILD COMPLETE (manifests found)"
    echo ""
    echo "Build artifacts:"
    du -sh "$BUILD_DIR"/* 2>/dev/null | sort -h | tail -10 | awk '{print "  " $2 ": " $1}'
    echo ""
    echo "Ready to deploy!"
    exit 0
fi

# Check if build is in progress
if pgrep -f "next build" > /dev/null; then
    echo "⏳ BUILD IN PROGRESS"
    echo ""
    echo "Active processes:"
    ps aux | grep "next build" | grep -v grep | awk '{print "  PID: " $2 " - Memory: " $6 "KB"}'
    echo ""
    echo "Build directory size: $(du -sh "$BUILD_DIR" 2>/dev/null | awk '{print $1}')"
    exit 1
fi

# Build directory exists but no manifests
if [ -d "$BUILD_DIR" ]; then
    echo "⏳ BUILD IN PROGRESS (initializing)"
    echo "Build directory size: $(du -sh "$BUILD_DIR" 2>/dev/null | awk '{print $1}')"
    exit 1
fi

echo "❓ Unknown build status"
exit 2
