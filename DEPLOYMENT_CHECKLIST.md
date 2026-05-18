# 📋 SmartHMS - DEPLOYMENT CHECKLIST

**Current Status**: ✅ Ready for Deployment  
**Last Updated**: May 18, 2024

---

## ✅ PRE-DEPLOYMENT CHECKLIST

### Local Testing

- [ ] Backend runs without errors: `npm run dev`
- [ ] Frontend runs without errors: `npm run dev`
- [ ] Database connection successful
- [ ] All 9 demo accounts can login
- [ ] Can navigate all 12 pages
- [ ] Forms submit without errors
- [ ] Charts render correctly
- [ ] Real-time updates work (Socket.io)
- [ ] Error alerts display properly
- [ ] Responsive design works on mobile

### Code Quality

- [ ] No console errors in browser
- [ ] No console errors in backend
- [ ] No database connection errors
- [ ] All API endpoints responding
- [ ] Authentication flows working
- [ ] RBAC restrictions enforced
- [ ] No unhandled exceptions
- [ ] Form validation working
- [ ] Proper error messages shown
- [ ] Loading states appear

---

## 📦 DEPLOYMENT OPTIONS

### Option 1: cPanel/Shared Hosting (EASIEST)

#### 1. Prepare Backend

```bash
# In local machine
cd backend
npm run build  # or just npm install for production

# Create .env with production values:
PORT=3001
DB_HOST=your_cpanel_db_host
DB_USER=your_cpanel_db_user
DB_PASSWORD=your_cpanel_db_password
DB_NAME=your_db_name
JWT_SECRET=generate_a_random_secret
JWT_REFRESH_SECRET=generate_another_random_secret
NODE_ENV=production
```

#### 2. Prepare Frontend

```bash
cd frontend
npm run build

# Creates dist/ folder with optimized production build
```

#### 3. Upload to cPanel

**Backend (Node.js App):**

1. Login to cPanel
2. Go to Setup Node.js App
3. Create new app:
   - App name: `smarthms`
   - App domain: `your-domain.com`
   - Node version: 18 LTS
   - App root: Upload backend files here
4. Upload backend files
5. Upload .env file
6. Run: `npm install`
7. Start app from cPanel interface

**Frontend (Static Files):**

1. In cPanel, File Manager
2. Go to public_html/
3. Create folder: `app/`
4. Upload all files from `frontend/dist/` to `public_html/app/`
5. Create .htaccess for React routing:
   ```
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /app/
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /app/index.html [L]
   </IfModule>
   ```

**Database:**

1. Create new MySQL database in cPanel
2. Create database user
3. Go to phpMyAdmin
4. Select database
5. Go to SQL tab
6. Paste contents of `database-mariadb.sql`
7. Run

#### 4. Update Environment Variables

**Frontend .env.local** (in build or hardcode in app):

```env
VITE_API_URL=https://your-domain.com:3001/api/v1
VITE_SOCKET_URL=https://your-domain.com:3001
VITE_ENV=production
```

#### 5. Setup SSL

1. In cPanel, AutoSSL
2. Install Let's Encrypt certificate
3. Update frontend to use HTTPS URLs

**Deployment Complete! ✅**

---

### Option 2: Docker (MODERN)

#### 1. Create Dockerfile for Backend

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
```

#### 2. Create Dockerfile for Frontend

```dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 3. Create docker-compose.yml

```yaml
version: "3.8"

services:
  mysql:
    image: mariadb:10.6
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: ilinkmth_smarthms
    volumes:
      - ./database-mariadb.sql:/docker-entrypoint-initdb.d/schema.sql
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"

  backend:
    build: ./backend
    environment:
      DB_HOST: mysql
      DB_USER: root
      DB_PASSWORD: root
      DB_NAME: ilinkmth_smarthms
      JWT_SECRET: your_secret_key
      NODE_ENV: production
    ports:
      - "3001:3001"
    depends_on:
      - mysql

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mysql_data:
```

#### 4. Deploy

```bash
docker-compose up -d
```

**Deployment Complete! ✅**

---

### Option 3: VPS/Dedicated Server (RECOMMENDED)

#### 1. Setup Server

```bash
# SSH into server as root

# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Install MariaDB
apt install -y mariadb-server

# Install Nginx
apt install -y nginx

# Install PM2 for process management
npm install -g pm2
```

#### 2. Setup Database

```bash
mysql -u root << EOF
CREATE DATABASE ilinkmth_smarthms;
CREATE USER 'smarthms'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON ilinkmth_smarthms.* TO 'smarthms'@'localhost';
FLUSH PRIVILEGES;
EOF

# Import schema
mysql -u smarthms -p ilinkmth_smarthms < database-mariadb.sql
```

#### 3. Deploy Backend

```bash
# Clone or upload backend
git clone your_repo /var/www/smarthms-backend

cd /var/www/smarthms-backend
npm install

# Create .env
cat > .env << EOF
PORT=3001
DB_HOST=localhost
DB_USER=smarthms
DB_PASSWORD=secure_password
DB_NAME=ilinkmth_smarthms
JWT_SECRET=$(openssl rand -base64 32)
NODE_ENV=production
EOF

# Start with PM2
pm2 start server.js --name "smarthms-api"
pm2 startup
pm2 save
```

#### 4. Deploy Frontend

```bash
cd /var/www/smarthms-frontend
npm install
npm run build

# Configure Nginx
cat > /etc/nginx/sites-available/smarthms << EOF
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/smarthms-frontend/dist;
    index index.html;

    location / {
        try_files \$uri /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/smarthms /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

#### 5. Setup SSL

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d your-domain.com

# Auto-renewal
systemctl enable certbot.timer
```

**Deployment Complete! ✅**

---

## 🔒 SECURITY CHECKLIST

### Before Going Live

- [ ] Change all default passwords
- [ ] Generate new JWT secrets
- [ ] Enable HTTPS/SSL
- [ ] Update API URLs to production domain
- [ ] Set NODE_ENV=production
- [ ] Configure CORS for your domain
- [ ] Enable rate limiting
- [ ] Setup firewall rules
- [ ] Enable database backups
- [ ] Setup monitoring/logging
- [ ] Configure email notifications
- [ ] Disable debug mode
- [ ] Review environment variables
- [ ] Test with real data

### Passwords to Change

- [ ] MySQL root password
- [ ] Database user password
- [ ] JWT secrets (generate new)
- [ ] Admin account password

### Configuration to Update

- [ ] Database credentials
- [ ] API URL in frontend
- [ ] Socket.io URL
- [ ] CORS origins
- [ ] Email settings
- [ ] Payment gateway (if any)
- [ ] Upload directories

---

## ✅ POST-DEPLOYMENT CHECKLIST

### Verification

- [ ] Frontend loads at your domain
- [ ] Backend API responds
- [ ] Login works with production data
- [ ] All pages accessible
- [ ] Database queries successful
- [ ] Real-time updates working
- [ ] No console errors
- [ ] HTTPS working
- [ ] SSL certificate valid

### Testing

- [ ] Test login with all 9 roles
- [ ] Create test order
- [ ] Test payment
- [ ] Check database
- [ ] Monitor server logs
- [ ] Test error handling
- [ ] Verify backups working
- [ ] Test email notifications

### Monitoring

- [ ] Setup error logging (Sentry, LogRocket)
- [ ] Setup performance monitoring (New Relic)
- [ ] Setup uptime monitoring (UptimeRobot)
- [ ] Setup email alerts
- [ ] Review logs daily
- [ ] Monitor disk usage
- [ ] Monitor database size
- [ ] Monitor server CPU/memory

---

## 🐛 COMMON ISSUES & SOLUTIONS

### Issue: Frontend shows blank page

**Solution**:

- Check browser console for errors
- Verify VITE_API_URL is correct
- Clear browser cache
- Check .env.local values

### Issue: API calls failing (404/500)

**Solution**:

- Verify backend is running
- Check API URL matches backend
- Review backend logs
- Verify database connection

### Issue: Database connection error

**Solution**:

- Verify MySQL is running
- Check credentials in .env
- Verify database exists
- Check user permissions

### Issue: Socket.io not connecting

**Solution**:

- Verify Socket.io URL is correct
- Check backend is emitting events
- Review Socket.io logs
- Verify firewall allows WebSocket

### Issue: Performance is slow

**Solution**:

- Check database indexes
- Review slow query logs
- Enable caching headers
- Optimize database queries
- Scale server resources

---

## 📊 MONITORING & MAINTENANCE

### Daily Tasks

- [ ] Check server logs for errors
- [ ] Monitor disk space
- [ ] Check database size
- [ ] Verify backups completed

### Weekly Tasks

- [ ] Review performance metrics
- [ ] Check for security updates
- [ ] Review user activity logs
- [ ] Test backup restoration

### Monthly Tasks

- [ ] Update dependencies
- [ ] Security audit
- [ ] Performance tuning
- [ ] Database optimization

### Quarterly Tasks

- [ ] Full disaster recovery test
- [ ] Security assessment
- [ ] Capacity planning
- [ ] Technology updates

---

## 💾 BACKUP STRATEGY

### Automated Backups

```bash
# Daily database backup
0 2 * * * mysqldump -u smarthms -p ilinkmth_smarthms > /backups/db-$(date +\%Y\%m\%d).sql

# Weekly code backup
0 3 * * 0 tar -czf /backups/code-$(date +\%Y\%m\%d).tar.gz /var/www/smarthms-*

# Offsite backup (AWS S3 example)
30 3 * * * aws s3 sync /backups/ s3://your-bucket/backups/
```

### Recovery Procedure

```bash
# Restore database
mysql -u smarthms -p ilinkmth_smarthms < /backups/db-YYYYMMDD.sql

# Restore code
tar -xzf /backups/code-YYYYMMDD.tar.gz -C /var/www/
```

---

## 📈 SCALING CONSIDERATIONS

### As Your Business Grows

**Stage 1: Single Server (current)**

- One server handles all
- Good for <100 concurrent users
- Monitor resources

**Stage 2: Database Replication (10k+ orders/day)**

- Separate database server
- Enable read replicas
- Implement caching layer

**Stage 3: Load Balancing (100+ concurrent)**

- Multiple backend servers
- Load balancer (nginx)
- Shared session store (Redis)
- CDN for frontend

**Stage 4: Microservices (1000+ concurrent)**

- Separate services per module
- Message queue (RabbitMQ)
- Service mesh (Kubernetes)
- Advanced monitoring

---

## 🚀 DEPLOYMENT SCRIPT

### Automated Deployment (Ubuntu/Debian)

Create `deploy.sh`:

```bash
#!/bin/bash

# Variables
REPO_URL="your_repo_url"
APP_PATH="/var/www/smarthms"
BRANCH="main"

# Pull latest code
cd $APP_PATH
git pull origin $BRANCH

# Update backend
cd backend
npm install
pm2 restart smarthms-api

# Update frontend
cd ../frontend
npm install
npm run build
systemctl restart nginx

# Database migrations (if any)
cd ../backend
npm run migrate

echo "Deployment complete!"
```

Usage:

```bash
chmod +x deploy.sh
./deploy.sh
```

---

## ✅ FINAL CHECKLIST

Before declaring "Live":

- [ ] All pages accessible
- [ ] All features working
- [ ] Database optimized
- [ ] Backups automated
- [ ] Monitoring active
- [ ] SSL/HTTPS enabled
- [ ] Error tracking setup
- [ ] Performance acceptable
- [ ] Security hardened
- [ ] Team trained

---

## 📞 SUPPORT

During deployment, reference:

1. README.md - Setup instructions
2. IMPLEMENTATION_COMPLETE.md - Feature overview
3. Documentation files - Detailed guides
4. Code comments - Implementation details

---

**Status**: Ready for Deployment ✅  
**Last Updated**: May 18, 2024  
**Version**: 1.0.0 Final
