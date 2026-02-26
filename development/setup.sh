#!/bin/bash

# ==============================================================================
# AWS Amazon Linux Setup Script - CoreSynaptics
# Server IP: 18.206.16.20
# Key: coresynaptics.pem
# ==============================================================================

echo "Starting server setup for Amazon Linux..."

# 1. Update system packages
echo "Updating system packages..."
sudo yum update -y

# 2. Install Git
echo "Installing Git..."
sudo yum install git -y

# 3. Install NVM (Node Version Manager)
echo "Installing NVM..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Export variables to current session
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# 4. Install Node.js (Latest LTS)
echo "Installing Node.js LTS..."
nvm install --lts
nvm use --lts

# 5. Install PM2
echo "Installing PM2..."
npm install -g pm2

# 6. Install and Configure Nginx
echo "Installing Nginx..."
sudo yum install nginx -y

echo "Configuring Nginx reverse proxy..."
sudo tee /etc/nginx/conf.d/coresynaptics.conf > /dev/null << 'EOF'
server {
    listen 80;
    server_name coresynaptics.com www.coresynaptics.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Remove default server if it exists or conflicts by shifting it to port 8080
sudo sed -i 's/listen       80;/listen       8080;/g' /etc/nginx/nginx.conf
sudo sed -i 's/listen       \[::\]:80;/listen       \[::\]:8080;/g' /etc/nginx/nginx.conf

echo "Starting Nginx..."
sudo systemctl enable nginx
sudo systemctl restart nginx

# 7. Install and Configure HTTPS (Certbot)
echo "Installing Certbot..."
sudo dnf install python3-certbot-nginx -y

# Note: Automated certificate acquisition requires manual step or predefined email
# To automate fully, uncomment below but ensure email is correct:
# sudo certbot --nginx -d coresynaptics.com -d www.coresynaptics.com --non-interactive --agree-tos -m asadmehmood091@gmail.com --redirect

# 8. Verify installations
echo "--- Installation Summary ---"
git --version
node -v
npm -v
pm2 --version
nginx -v
certbot --version
echo "----------------------------"

echo "Setup complete! Please restart your terminal session to ensure all changes take effect."
