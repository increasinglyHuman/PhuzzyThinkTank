#!/bin/bash

# Setup script for p0qp0q.local with HTTPS Apache server
# Run with: sudo ./setup-local-domain.sh

set -e

DOMAIN="p0qp0q.local"
WEB_ROOT="/home/p0qp0q/Phuzzy"
USER="p0qp0q"

echo "🌐 Setting up ${DOMAIN} with HTTPS Apache server"
echo "=============================================="

# 1. Install required packages
echo "📦 Installing required packages..."
apt update
apt install -y apache2 avahi-daemon openssl

# 2. Enable required Apache modules
echo "🔧 Enabling Apache modules..."
a2enmod ssl
a2enmod rewrite
a2enmod headers

# 3. Set hostname for mDNS
echo "🏷️  Setting hostname..."
hostnamectl set-hostname p0qp0q
echo "p0qp0q" > /etc/hostname

# 4. Configure Avahi for .local domain
echo "🔍 Configuring Avahi mDNS..."
cat > /etc/avahi/avahi-daemon.conf << 'EOF'
[server]
host-name=p0qp0q
domain-name=local
use-ipv4=yes
use-ipv6=yes
enable-dbus=yes
allow-interfaces=eth0,wlan0,enp5s0

[wide-area]
enable-wide-area=yes

[publish]
publish-addresses=yes
publish-hinfo=yes
publish-workstation=yes
publish-domain=yes
EOF

# 5. Create self-signed SSL certificate
echo "🔐 Creating self-signed SSL certificate..."
mkdir -p /etc/apache2/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/apache2/ssl/${DOMAIN}.key \
    -out /etc/apache2/ssl/${DOMAIN}.crt \
    -subj "/C=US/ST=State/L=City/O=Phuzzy Development/CN=${DOMAIN}"

# 6. Create Apache virtual host for HTTP
echo "🌐 Creating HTTP virtual host..."
cat > /etc/apache2/sites-available/${DOMAIN}.conf << EOF
<VirtualHost *:80>
    ServerName ${DOMAIN}
    DocumentRoot ${WEB_ROOT}
    
    # Redirect all HTTP to HTTPS
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}\$1 [R=301,L]
</VirtualHost>
EOF

# 7. Create Apache virtual host for HTTPS
echo "🔒 Creating HTTPS virtual host..."
cat > /etc/apache2/sites-available/${DOMAIN}-ssl.conf << EOF
<VirtualHost *:443>
    ServerName ${DOMAIN}
    DocumentRoot ${WEB_ROOT}
    
    SSLEngine on
    SSLCertificateFile /etc/apache2/ssl/${DOMAIN}.crt
    SSLCertificateKeyFile /etc/apache2/ssl/${DOMAIN}.key
    
    <Directory ${WEB_ROOT}>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
        
        # CORS headers for development
        Header set Access-Control-Allow-Origin "*"
        Header set Access-Control-Allow-Methods "GET, POST, OPTIONS"
        Header set Access-Control-Allow-Headers "Content-Type"
    </Directory>
    
    # Security headers
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-XSS-Protection "1; mode=block"
    
    # Enable directory listing for development
    <Directory ${WEB_ROOT}/data>
        Options +Indexes
    </Directory>
    
    # Custom error pages
    ErrorDocument 404 /404.html
    ErrorDocument 500 /500.html
    
    # Logging
    ErrorLog \${APACHE_LOG_DIR}/${DOMAIN}-error.log
    CustomLog \${APACHE_LOG_DIR}/${DOMAIN}-access.log combined
</VirtualHost>
EOF

# 8. Enable sites and disable default
echo "🔄 Enabling sites..."
a2dissite 000-default.conf default-ssl.conf || true
a2ensite ${DOMAIN}.conf ${DOMAIN}-ssl.conf

# 9. Set proper permissions
echo "📝 Setting permissions..."
chown -R ${USER}:www-data ${WEB_ROOT}
chmod -R 755 ${WEB_ROOT}
find ${WEB_ROOT} -type f -exec chmod 644 {} \;

# 10. Create hosts entry (backup for mDNS)
echo "📋 Adding hosts entry..."
if ! grep -q "${DOMAIN}" /etc/hosts; then
    echo "127.0.0.1    ${DOMAIN}" >> /etc/hosts
fi

# 11. Configure firewall if ufw is installed
if command -v ufw &> /dev/null; then
    echo "🔥 Configuring firewall..."
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw allow 5353/udp  # mDNS
fi

# 12. Restart services
echo "♻️  Restarting services..."
systemctl restart avahi-daemon
systemctl restart apache2

# 13. Create test page
echo "📄 Creating test page..."
cat > ${WEB_ROOT}/server-test.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>p0qp0q.local Test Page</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            background: #f0f0f0;
        }
        .success {
            background: #48bb78;
            color: white;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
        }
        .info {
            background: white;
            padding: 1rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        code {
            background: #e2e8f0;
            padding: 0.2rem 0.4rem;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="success">
        <h1>✅ p0qp0q.local is working!</h1>
        <p>HTTPS Apache server is successfully configured.</p>
    </div>
    
    <div class="info">
        <h2>🎮 Phuzzy Development Server</h2>
        <p>Access your game at: <a href="https://p0qp0q.local/">https://p0qp0q.local/</a></p>
        
        <h3>Quick Links:</h3>
        <ul>
            <li><a href="/">Main Game</a></li>
            <li><a href="/data/">Data Directory</a></li>
            <li><a href="/scenario-review-dashboard-server.html">Review Dashboard</a></li>
            <li><a href="/pack-promotion-manager.html">Pack Manager</a></li>
        </ul>
        
        <h3>Server Info:</h3>
        <ul>
            <li>Protocol: <code id="protocol"></code></li>
            <li>Hostname: <code id="hostname"></code></li>
            <li>Port: <code id="port"></code></li>
        </ul>
    </div>
    
    <script>
        document.getElementById('protocol').textContent = window.location.protocol;
        document.getElementById('hostname').textContent = window.location.hostname;
        document.getElementById('port').textContent = window.location.port || (window.location.protocol === 'https:' ? '443' : '80');
    </script>
</body>
</html>
EOF

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Summary:"
echo "  - Domain: https://${DOMAIN}"
echo "  - Web Root: ${WEB_ROOT}"
echo "  - SSL Certificate: Self-signed (browser will warn on first visit)"
echo "  - Apache Config: /etc/apache2/sites-available/${DOMAIN}*.conf"
echo ""
echo "🧪 Test your setup:"
echo "  1. From this machine: https://localhost/"
echo "  2. From other devices on network: https://${DOMAIN}/"
echo "  3. Test page: https://${DOMAIN}/server-test.html"
echo ""
echo "⚠️  Note: You'll see a certificate warning on first visit. Click 'Advanced' → 'Proceed'."
echo ""
echo "🔧 Troubleshooting:"
echo "  - Check Apache: systemctl status apache2"
echo "  - Check Avahi: systemctl status avahi-daemon"
echo "  - View logs: tail -f /var/log/apache2/${DOMAIN}-*.log"
echo "  - Test mDNS: avahi-resolve -n ${DOMAIN}"