#!/bin/bash

# Haven Privacy Proxy - macOS Double-Click Launcher
# Double-click this file to start the privacy proxy

cd "$(dirname "$0")"

# Keep terminal open on completion
trap "read -p 'Press Enter to close...'" EXIT

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
fi

# Start the proxy
echo ""
node src/index.js
