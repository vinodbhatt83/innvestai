# Test acquisition assumptions using PowerShell
# This script will test if deal assumptions can be saved correctly

$ErrorActionPreference = "Stop"  # Stop on first error
Write-Host "Testing acquisition assumptions API..." -ForegroundColor Cyan

# Define the payload to send
$payload = @{
    deal_id = 1
    acquisition_month = "January"
    acquisition_year = 2024
    acquisition_costs = 50000
    cap_rate_going_in = 8.5
    hold_period = 5
    purchase_price = 5000000
    purchase_price_method = "Per Room"
} | ConvertTo-Json

Write-Host "Sending data:" -ForegroundColor Yellow
Write-Host $payload

# Send the request to the dedicated endpoint
try {
    Write-Host "Testing dedicated acquisition endpoint..." -ForegroundColor Yellow
    
    # Note: PowerShell 5.1 uses Invoke-WebRequest and PowerShell 7+ can use Invoke-RestMethod
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/deals/assumptions/acquisition" `
        -Method POST `
        -Body $payload `
        -ContentType "application/json" `
        -ErrorAction SilentlyContinue
    
    Write-Host "Response status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response body:" -ForegroundColor Green
    Write-Host $response.Content
    
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ Test PASSED - Acquisition data was saved successfully!" -ForegroundColor Green
        exit 0  # Success
    } else {
        Write-Host "✗ Test FAILED - Received status code $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Error with direct endpoint:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    
    # Try the fallback dynamic endpoint
    Write-Host "Testing dynamic [tabType] endpoint..." -ForegroundColor Yellow
    try {
        $fallbackResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/deals/assumptions/[tabType]?tabType=acquisition" `
            -Method POST `
            -Body $payload `
            -ContentType "application/json" `
            -ErrorAction SilentlyContinue
        
        Write-Host "Fallback response status: $($fallbackResponse.StatusCode)" -ForegroundColor Green
        Write-Host "Fallback response body:" -ForegroundColor Green
        Write-Host $fallbackResponse.Content
        
        if ($fallbackResponse.StatusCode -eq 200) {
            Write-Host "✓ Test PASSED - Acquisition data was saved successfully via fallback endpoint!" -ForegroundColor Green
            exit 0  # Success
        } else {
            Write-Host "✗ Test FAILED - Fallback received status code $($fallbackResponse.StatusCode)" -ForegroundColor Red
        }
    } catch {
        Write-Host "✗ Error with fallback endpoint:" -ForegroundColor Red
        Write-Host $_.Exception.Message
    }
}

Write-Host "✗ Test FAILED - Could not save acquisition data" -ForegroundColor Red
exit 1  # Failure
