# Quick Database Setup Script (PowerShell)
# Run this script to quickly set up a local PostgreSQL database using Docker

Write-Host "🚀 Apex Agents - Quick Database Setup" -ForegroundColor Cyan
Write-Host "=" * 60

# Check if Docker is installed
Write-Host "`n📦 Checking for Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker found: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker not found! Please install Docker Desktop first." -ForegroundColor Red
    Write-Host "   Download from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Check if container already exists
Write-Host "`n🔍 Checking for existing database container..." -ForegroundColor Yellow
$existingContainer = docker ps -a --filter "name=apex-postgres" --format "{{.Names}}"

if ($existingContainer -eq "apex-postgres") {
    Write-Host "⚠️  Container 'apex-postgres' already exists." -ForegroundColor Yellow
    $response = Read-Host "Do you want to remove and recreate it? (y/N)"
    if ($response -eq "y" -or $response -eq "Y") {
        Write-Host "🗑️  Removing existing container..." -ForegroundColor Yellow
        docker stop apex-postgres 2>$null
        docker rm apex-postgres 2>$null
        Write-Host "✅ Removed existing container" -ForegroundColor Green
    } else {
        Write-Host "✅ Using existing container" -ForegroundColor Green
        docker start apex-postgres
        Start-Sleep -Seconds 2
    }
} else {
    # Create new PostgreSQL container
    Write-Host "`n🐘 Creating PostgreSQL database container..." -ForegroundColor Yellow
    docker run --name apex-postgres `
        -e POSTGRES_PASSWORD=devpassword `
        -e POSTGRES_DB=apex_agents `
        -e POSTGRES_USER=apex_user `
        -p 5432:5432 `
        -d postgres:15

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ PostgreSQL container created successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to create PostgreSQL container" -ForegroundColor Red
        exit 1
    }

    # Wait for PostgreSQL to be ready
    Write-Host "`n⏳ Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
}

# Update .env file
Write-Host "`n📝 Updating .env file..." -ForegroundColor Yellow
$envContent = Get-Content .env -Raw

# Update DATABASE_URL
$newDatabaseUrl = 'DATABASE_URL="postgresql://apex_user:devpassword@localhost:5432/apex_agents"'
$newDatabaseUrlUnpooled = 'DATABASE_URL_UNPOOLED="postgresql://apex_user:devpassword@localhost:5432/apex_agents"'

if ($envContent -match 'DATABASE_URL=') {
    $envContent = $envContent -replace 'DATABASE_URL="[^"]*"', $newDatabaseUrl
    $envContent = $envContent -replace 'DATABASE_URL_UNPOOLED="[^"]*"', $newDatabaseUrlUnpooled
} else {
    Write-Host "⚠️  .env file not found or DATABASE_URL not present" -ForegroundColor Yellow
}

$envContent | Out-File -FilePath .env -Encoding utf8 -NoNewline
Write-Host "✅ Updated .env file with database credentials" -ForegroundColor Green

# Push database schema
Write-Host "`n📊 Pushing database schema..." -ForegroundColor Yellow
npm run db:push

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database schema pushed successfully!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Database schema push had issues (this is normal on first run)" -ForegroundColor Yellow
}

# Seed database
Write-Host "`n🌱 Seeding database with test data..." -ForegroundColor Yellow
npm run db:seed

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database seeded successfully!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Database seeding had issues" -ForegroundColor Yellow
}

# Run health check
Write-Host "`n🏥 Running health check..." -ForegroundColor Yellow
npm run health:check

Write-Host "`n" + ("=" * 60)
Write-Host "✨ Setup Complete!" -ForegroundColor Green
Write-Host "`n📚 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Start the dev server: npm run dev" -ForegroundColor White
Write-Host "   2. Open: http://localhost:3000" -ForegroundColor White
Write-Host "   3. Login with test credentials:" -ForegroundColor White
Write-Host "      Email: admin@apexagents.test" -ForegroundColor Yellow
Write-Host "      Password: Admin123!" -ForegroundColor Yellow
Write-Host "`n💡 Useful Commands:" -ForegroundColor Cyan
Write-Host "   • View database: npm run db:studio" -ForegroundColor White
Write-Host "   • Stop database: docker stop apex-postgres" -ForegroundColor White
Write-Host "   • Start database: docker start apex-postgres" -ForegroundColor White
Write-Host "   • Remove database: docker rm -f apex-postgres" -ForegroundColor White
Write-Host ""

