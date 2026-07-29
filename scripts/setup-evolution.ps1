# Evolution API Setup Script for Windows
# Run from PowerShell as Administrator

Write-Host "=== Evolution API Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check Docker
try {
    $dockerVersion = docker --version
    Write-Host "Docker found: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "Docker not found. Please install Docker Desktop:" -ForegroundColor Red
    Write-Host "  https://docs.docker.com/desktop/setup/install/windows-install/" -ForegroundColor Yellow
    exit 1
}

# 1. Create .env file for Evolution API
$envContent = @"
# Evolution API Configuration
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=evolution_api_key_change_me
"@

$envPath = Join-Path $PSScriptRoot ".." ".env.evolution"
Set-Content -Path $envPath -Value $envContent
Write-Host "1. Created .env.evolution" -ForegroundColor Green

# 2. Start services
Write-Host "2. Starting Docker services..." -ForegroundColor Yellow
Set-Location (Join-Path $PSScriptRoot "..")
docker compose up -d

Write-Host "" -ForegroundColor Cyan
Write-Host "=== Awaiting initialization (30s) ===" -ForegroundColor Yellow
Start-Sleep -Seconds 30

# 3. Test connection
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8080/health" -ErrorAction Stop
    Write-Host "3. Evolution API is healthy!" -ForegroundColor Green
} catch {
    Write-Host "3. Evolution API not ready yet. Run manually later: curl http://localhost:8080/health" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Setup Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Evolution API: http://localhost:8080" -ForegroundColor White
Write-Host "API Key: evolution_api_key_change_me (change in production)" -ForegroundColor White
Write-Host "MongoDB: localhost:27017" -ForegroundColor White
Write-Host "RabbitMQ: localhost:15672 (admin:evolution_pass)" -ForegroundColor White
Write-Host "Redis: localhost:6379" -ForegroundColor White
Write-Host ""
Write-Host "Next: configure EVOLUTION_API_KEY in .env.local with the same value"
Write-Host "Then use the Integracoes page to create instances and scan QR Code."
