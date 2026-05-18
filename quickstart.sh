#!/bin/bash

# SmartHMS Quick Start Script
# This script helps you get SmartHMS running locally

echo "================================"
echo "SmartHMS - Quick Start"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js found: $(node -v)"

# Check if MariaDB/MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "⚠️  MySQL/MariaDB not found in PATH (but might be installed)"
fi

# Setup Backend
echo ""
echo "================================"
echo "Setting up Backend..."
echo "================================"

cd backend

if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
else
    echo "✅ Backend dependencies already installed"
fi

# Create .env file
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=ilinkmth_smarthms
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)
NODE_ENV=development
EOF
    echo "✅ .env file created (update DB credentials if needed)"
else
    echo "✅ .env file exists"
fi

# Setup Frontend
echo ""
echo "================================"
echo "Setting up Frontend..."
echo "================================"

cd ../frontend

if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
else
    echo "✅ Frontend dependencies already installed"
fi

# Create .env.local file
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << EOF
VITE_API_URL=http://localhost:3001/api/v1
VITE_SOCKET_URL=http://localhost:3001
VITE_ENV=development
EOF
    echo "✅ .env.local file created"
else
    echo "✅ .env.local file exists"
fi

echo ""
echo "================================"
echo "✨ Setup Complete!"
echo "================================"
echo ""
echo "📌 Next Steps:"
echo "1. Setup Database:"
echo "   mysql -u root -p < ../database-mariadb.sql"
echo ""
echo "2. Start Backend (in terminal 1):"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo "3. Start Frontend (in terminal 2):"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "4. Open in Browser:"
echo "   http://localhost:5173"
echo ""
echo "📚 Demo Credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "Happy coding! 🚀"
