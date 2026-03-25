# BBJ Church Manager - Local Build & Deploy Script

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ============================================================================
# Configuration
# ============================================================================
$WORKSPACE = "C:\Users\Buckman\Desktop\BBJ digital"
$MAVEN_HOME = "C:\apache-maven-3.9.12"
$TOMCAT_HOME = "C:\apache-tomcat-9.0"
$NODEJS_HOME = "C:\Program Files\nodejs"
$TOMCAT_PORT = "8081"

$BACKEND_DIR = "$WORKSPACE\backend"
$FRONTEND_DIR = "$WORKSPACE\frontend"
$TOMCAT_WEBAPPS = "$TOMCAT_HOME\webapps"
$BACKEND_STATIC = "$BACKEND_DIR\src\main\resources\static"

# Auto-detect JAVA_HOME
$JAVA_HOME = Get-ChildItem "C:\Program Files\Java" -Directory |
Where-Object { $_.Name -match "jdk" } |
Select-Object -First 1 -ExpandProperty FullName

if (-not $JAVA_HOME) {
    Write-Host "JDK not found." -ForegroundColor Red
    exit 1
}

# ============================================================================
# Environment Setup
# ============================================================================
$env:JAVA_HOME = $JAVA_HOME
$env:MAVEN_HOME = $MAVEN_HOME
$env:PATH = "$JAVA_HOME\bin;$MAVEN_HOME\bin;$NODEJS_HOME;$env:PATH"
$env:ENVIRONMENT = "local"

Write-Host "Using JAVA_HOME: $JAVA_HOME" -ForegroundColor Green
Write-Host "Tomcat Port: $TOMCAT_PORT" -ForegroundColor Green

# ============================================================================
# Stop Existing Tomcat
# ============================================================================
Write-Host "`nStopping existing Java processes..." -ForegroundColor Cyan
try {
    taskkill /IM java.exe /F 2>$null | Out-Null
} catch {
    Write-Host "No running Tomcat process to stop." -ForegroundColor Yellow
}

# ============================================================================
# Build Backend
# ============================================================================
Write-Host "`nBuilding Backend..." -ForegroundColor Cyan
Push-Location $BACKEND_DIR
mvn clean package -DskipTests
if ($LASTEXITCODE -ne 0) { exit 1 }
Pop-Location

# ============================================================================
# Deploy WAR
# ============================================================================
Write-Host "`nDeploying Backend to Tomcat..." -ForegroundColor Cyan

$WAR_FILE = "$BACKEND_DIR\target\bbj-church-manager.war"
$TARGET_WAR = "$TOMCAT_WEBAPPS\api.war"

Remove-Item "$TOMCAT_WEBAPPS\api*" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item $WAR_FILE $TARGET_WAR -Force

Write-Host "Deployed api.war successfully." -ForegroundColor Green

# ============================================================================
# Build Frontend
# ============================================================================
Write-Host "`nBuilding Frontend..." -ForegroundColor Cyan
Push-Location $FRONTEND_DIR
npm install
if ($LASTEXITCODE -ne 0) { exit 1 }

npm run build
if ($LASTEXITCODE -ne 0) { exit 1 }
Pop-Location

Write-Host "`nSyncing Frontend assets to Backend..." -ForegroundColor Cyan
if (-not (Test-Path $BACKEND_STATIC)) { New-Item -Path $BACKEND_STATIC -ItemType Directory }
Remove-Item "$BACKEND_STATIC\*" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item "$FRONTEND_DIR\dist\*" $BACKEND_STATIC -Recurse -Force

Write-Host "Frontend assets synced to $BACKEND_STATIC" -ForegroundColor Green

# ============================================================================
# Configure Tomcat Environment
# ============================================================================
@"
@echo off
set ENVIRONMENT=local
"@ | Out-File "$TOMCAT_HOME\bin\setenv.bat" -Encoding ASCII

# ============================================================================
# Start Tomcat
# ============================================================================
Write-Host "`nStarting Tomcat..." -ForegroundColor Cyan
& cmd.exe /c "$TOMCAT_HOME\bin\startup.bat"

Start-Sleep -Seconds 8

# ============================================================================
# Verify Server
# ============================================================================
Write-Host "`nChecking if Tomcat is running..." -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri "http://localhost:$TOMCAT_PORT" -TimeoutSec 5
    Write-Host "Tomcat is running." -ForegroundColor Green
} catch {
    Write-Host "Tomcat not responding yet. Check logs in $TOMCAT_HOME\logs" -ForegroundColor Yellow
}

# ============================================================================
# Test API
# ============================================================================
Write-Host "`nTesting API endpoint..." -ForegroundColor Cyan

try {
    $apiUrl = "http://localhost:$TOMCAT_PORT/api"
    $response = Invoke-WebRequest -Uri $apiUrl -TimeoutSec 5 -ErrorAction SilentlyContinue
    Write-Host "API reachable at $apiUrl" -ForegroundColor Green
} catch {
    Write-Host "API not reachable yet. It may still be starting." -ForegroundColor Yellow
}

# ============================================================================
# Summary
# ============================================================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "BUILD & DEPLOY COMPLETE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "Frontend Dev URL:  http://localhost:3000"
Write-Host "Backend API URL:   http://localhost:$TOMCAT_PORT/api"
Write-Host "Environment:       local"
Write-Host "Tomcat Logs:       $TOMCAT_HOME\logs"
Write-Host "========================================"