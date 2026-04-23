#!/bin/bash

# TaskMaster Installation Script for Linux/Mac
# Bash script to set up the project

echo "========================================"
echo "  TaskMaster Installation Script"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check if Docker is installed
echo -e "${YELLOW}Checking prerequisites...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed!${NC}"
    echo -e "${YELLOW}Please install Docker from: https://www.docker.com/get-started${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker is installed${NC}"

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker Compose is installed${NC}"
echo ""

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ .env file created${NC}"
    echo -e "${YELLOW}⚠️  Please edit .env file and change JWT secrets before production!${NC}"
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi
echo ""

# Start Docker containers
echo -e "${YELLOW}Starting Docker containers...${NC}"
docker-compose up -d
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to start Docker containers${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker containers started${NC}"
echo ""

# Wait for database to be ready
echo -e "${YELLOW}Waiting for database to be ready...${NC}"
sleep 10
echo -e "${GREEN}✅ Database should be ready${NC}"
echo ""

# Run database migrations
echo -e "${YELLOW}Running database migrations...${NC}"
docker-compose exec -T backend npm run migrate
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to run migrations${NC}"
    echo -e "${YELLOW}Trying to install dependencies first...${NC}"
    docker-compose exec -T backend npm install
    docker-compose exec -T backend npm run migrate
fi
echo -e "${GREEN}✅ Database migrations completed${NC}"
echo ""

# Seed database
echo -e "${YELLOW}Seeding database with sample data...${NC}"
docker-compose exec -T backend npm run seed
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Failed to seed database (this is optional)${NC}"
else
    echo -e "${GREEN}✅ Database seeded successfully${NC}"
fi
echo ""

# Display success message
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Installation Complete! 🎉${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${CYAN}Access the application:${NC}"
echo -e "  Frontend:  http://localhost:3000"
echo -e "  Backend:   http://localhost:5000"
echo -e "  API Docs:  http://localhost:5000/api/docs"
echo ""
echo -e "${CYAN}Sample Credentials:${NC}"
echo -e "  Email:     admin@acme.com"
echo -e "  Password:  Password123!"
echo ""
echo -e "${CYAN}Useful Commands:${NC}"
echo -e "  View logs:     docker-compose logs -f"
echo -e "  Stop:          docker-compose down"
echo -e "  Restart:       docker-compose restart"
echo -e "  Clean start:   docker-compose down -v && docker-compose up -d"
echo ""
echo -e "${YELLOW}For more information, see README.md${NC}"
echo ""
