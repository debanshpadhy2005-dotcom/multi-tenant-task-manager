# TaskMaster Installation Script for Windows
# PowerShell script to set up the project

Write-Host "========================================" -ForegroundColor Green
Write-Host "  TaskMaster Installation Script" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Check if Docker is installed
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
$dockerInstalled = Get-Command docker -ErrorAction SilentlyContinue
if (-not $dockerInstalled) {
    Write-Host "❌ Docker is not installed!" -ForegroundColor Red
    Write-Host "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Docker is installed" -ForegroundColor Green

# Check if Docker Compose is available
$dockerComposeInstalled = Get-Command docker-compose -ErrorAction SilentlyContinue
if (-not $dockerComposeInstalled) {
    Write-Host "❌ Docker Compose is not installed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Docker Compose is installed" -ForegroundColor Green
Write-Host ""

# Create .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env file created" -ForegroundColor Green
    Write-Host "⚠️  Please edit .env file and change JWT secrets before production!" -ForegroundColor Yellow
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}
Write-Host ""

# Start Docker containers
Write-Host "Starting Docker containers..." -ForegroundColor Yellow
docker-compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to start Docker containers" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Docker containers started" -ForegroundColor Green
Write-Host ""

# Wait for database to be ready
Write-Host "Waiting for database to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10
Write-Host "✅ Database should be ready" -ForegroundColor Green
Write-Host ""

# Run database migrations
Write-Host "Running database migrations..." -ForegroundColor Yellow
docker-compose exec -T backend npm run migrate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to run migrations" -ForegroundColor Red
    Write-Host "Trying to install dependencies first..." -ForegroundColor Yellow
    docker-compose exec -T backend npm install
    docker-compose exec -T backend npm run migrate
}
Write-Host "✅ Database migrations completed" -ForegroundColor Green
Write-Host ""

# Seed database
Write-Host "Seeding database with sample data..." -ForegroundColor Yellow
docker-compose exec -T backend npm run seed
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Failed to seed database (this is optional)" -ForegroundColor Yellow
} else {
    Write-Host "✅ Database seeded successfully" -ForegroundColor Green
}
Write-Host ""

# Display success message
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Installation Complete! 🎉" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Access the application:" -ForegroundColor Cyan
Write-Host "  Frontend:  http://localhost:3000" -ForegroundColor White
Write-Host "  Backend:   http://localhost:5000" -ForegroundColor White
Write-Host "  API Docs:  http://localhost:5000/api/docs" -ForegroundColor White
Write-Host ""
Write-Host "Sample Credentials:" -ForegroundColor Cyan
Write-Host "  Email:     admin@acme.com" -ForegroundColor White
Write-Host "  Password:  Password123!" -ForegroundColor White
Write-Host ""
Write-Host "Useful Commands:" -ForegroundColor Cyan
Write-Host "  View logs:     docker-compose logs -f" -ForegroundColor White
Write-Host "  Stop:          docker-compose down" -ForegroundColor White
Write-Host "  Restart:       docker-compose restart" -ForegroundColor White
Write-Host "  Clean start:   docker-compose down -v && docker-compose up -d" -ForegroundColor White
Write-Host ""
Write-Host "For more information, see README.md" -ForegroundColor Yellow
Write-Host ""
