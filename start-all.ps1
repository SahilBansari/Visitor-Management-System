#!/usr/bin/env pwsh
<#
.SYNOPSIS
    VMS System Complete Startup Script
.DESCRIPTION
    Initializes database and starts both backend and frontend servers
#>

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   VMS System - Complete Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if vms-backend exists
if (-not (Test-Path "vms-backend")) {
    Write-Host "❌ Error: vms-backend folder not found!" -ForegroundColor Red
    Write-Host "Please run this script from the project root directory." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Step 1: Initialize Database
Write-Host "Step 1: Initializing Database..." -ForegroundColor Yellow
Set-Location vms-backend

Write-Host "  ⏳ Running database initialization..." -ForegroundColor Gray
npm run init-db

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Database initialization failed!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Database ready" -ForegroundColor Green
Write-Host ""

# Step 2: Start Backend Server
Write-Host "Step 2: Starting Backend Server..." -ForegroundColor Yellow
Write-Host "  ℹ️  Backend will run on http://localhost:3001" -ForegroundColor Cyan
Write-Host "  ℹ️  This window will show backend logs" -ForegroundColor Cyan

# Start backend in a separate PowerShell window
$backendScript = {
    Set-Location $args[0]
    npm start
}
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$((Get-Location).Path)\vms-backend'; npm start"

Write-Host "✅ Backend server starting (check new window for logs)" -ForegroundColor Green
Start-Sleep -Seconds 3

# Step 3: Start Frontend
Write-Host ""
Write-Host "Step 3: Starting Frontend Development Server..." -ForegroundColor Yellow
Write-Host "  ℹ️  Frontend will run on http://localhost:3000" -ForegroundColor Cyan
Write-Host "  ℹ️  Browser should open automatically" -ForegroundColor Cyan
Write-Host ""

Set-Location ..
Write-Host "⏳ Starting Vite development server..." -ForegroundColor Gray
Start-Sleep -Seconds 2

npm run dev

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Both servers should now be running!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
