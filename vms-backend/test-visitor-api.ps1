# Visitor Request API Test Script

Write-Host "🧪 Starting Visitor Request API Tests...`n" -ForegroundColor Cyan

# Test 1: Submit visitor request
Write-Host "1️⃣  Testing POST /visitors/submit-request" -ForegroundColor Yellow
$submitBody = @{
    visitor_name = "Ramesh Gupta"
    visitor_type = "Vendor"
    mobile_number = "9876543210"
    host_name = "Officer Sharma"
    department = "Irrigation"
    visit_date = "2024-01-20"
    visit_start_time = "09:00:00"
    visit_end_time = "09:30:00"
    number_of_visitors = 1
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/visitors/submit-request" `
        -Method POST `
        -ContentType "application/json" `
        -Body $submitBody `
        -ErrorAction Stop
    
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ Request submitted successfully" -ForegroundColor Green
    Write-Host "   Pass ID: $($data.pass_id)" -ForegroundColor Cyan
    Write-Host "   Request ID: $($data.request_id)" -ForegroundColor Cyan
    $passId = $data.pass_id
    $requestId = $data.request_id
} catch {
    Write-Host "❌ Failed to submit request: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Get all pending requests
Write-Host "`n2️⃣  Testing GET /visitors/requests?status=PENDING" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/visitors/requests?status=PENDING" `
        -Method GET `
        -ContentType "application/json" `
        -ErrorAction Stop
    
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ Fetched pending requests" -ForegroundColor Green
    Write-Host "   Count: $($data.Length)" -ForegroundColor Cyan
    if ($data.Length -gt 0) {
        Write-Host "   First request: $($data[0].visitor_name)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Failed to fetch pending requests: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Get specific request by pass ID
if ($passId) {
    Write-Host "`n3️⃣  Testing GET /visitors/request/:passId" -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3001/visitors/request/$passId" `
            -Method GET `
            -ContentType "application/json" `
            -ErrorAction Stop
        
        $data = $response.Content | ConvertFrom-Json
        Write-Host "✅ Fetched specific request" -ForegroundColor Green
        Write-Host "   Visitor: $($data.visitor_name)" -ForegroundColor Cyan
        Write-Host "   Status: $($data.status)" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Failed to fetch request: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 4: Update request status
if ($requestId) {
    Write-Host "`n4️⃣  Testing PATCH /visitors/request/:requestId/status" -ForegroundColor Yellow
    $updateBody = @{
        status = "APPROVED"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3001/visitors/request/$requestId/status" `
            -Method PATCH `
            -ContentType "application/json" `
            -Body $updateBody `
            -ErrorAction Stop
        
        $data = $response.Content | ConvertFrom-Json
        Write-Host "✅ Request status updated to APPROVED" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to update status: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 5: Verify status update
Write-Host "`n5️⃣  Verifying status update" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/visitors/requests?status=APPROVED" `
        -Method GET `
        -ContentType "application/json" `
        -ErrorAction Stop
    
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ Fetched approved requests" -ForegroundColor Green
    Write-Host "   Count: $($data.Length)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Failed to fetch approved requests: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n✨ All tests completed!`n" -ForegroundColor Green
