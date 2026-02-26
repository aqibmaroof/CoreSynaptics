#!/bin/bash

# ==============================================================================
# CoreSynaptics Deployment Script
# Target: ec2-user@18.206.16.20
# Domain: coresynaptics.com
# ==============================================================================

# 1. Configuration
SERVER_IP="18.206.16.20"
USER="ec2-user"
KEY_PATH="./development/coresynaptics.pem"
REMOTE_DEST="/home/ec2-user/core-synaptics"
PROJECT_NAME="core-synaptics"

echo "Starting deployment to $SERVER_IP..."

# 2. Sync files using rsync (excluding node_modules and .git)
echo "Syncing files..."
rsync -avz -e "ssh -i $KEY_PATH" \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '.next' \
    --exclude 'development/*.pem' \
    ./ $USER@$SERVER_IP:$REMOTE_DEST

# 3. Remote commands: Install, Build, and Restart PM2
echo "Running remote commands (install, build, restart)..."
ssh -i $KEY_PATH $USER@$SERVER_IP << 'EOF'
    cd ~/core-synaptics
    
    # Load NVM
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    
    echo "Installing dependencies..."
    npm install
    
    echo "Building application..."
    npm run build
    
    # Check if PM2 process exists, then restart or start
    if pm2 list | grep -q "core-synaptics"; then
        echo "Restarting existing PM2 process..."
        pm2 restart core-synaptics
    else
        echo "Starting new PM2 process..."
        pm2 start npm --name "core-synaptics" -- start
    fi
    
    pm2 save
EOF

echo "Deployment complete for coresynaptics.com!"
