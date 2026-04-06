$baseUrl = "http://localhost:5000/api/v1"
$headers = @{ "Content-Type" = "application/json" }

# 1. TEST 1: Stock Increase
Write-Host "--- TEST 1: Stock Increase ---"
$stockData = @{ productId = 1; quantity = 100; warehouseLocation = "Warehouse-A"; reference = "TEST-IN-100" } | ConvertTo-Json
$res1 = Invoke-RestMethod -Uri "$baseUrl/stock/add" -Method Post -Body $stockData -Headers $headers
Write-Host "Stock added successfully. Reference: $($res1.batchNumber)" # Batch number is where sometimes reference ends up or just check the tx logs
$overview = Invoke-RestMethod -Uri "$baseUrl/stock/overview" -Method Get
$item = $overview | Where-Object { $_.productId -eq 1 }
Write-Host "New Stock Level: $($item.totalQuantity)"

# 2. TEST 2: Stock Decrease after Invoice
Write-Host "`n--- TEST 2: Stock Decrease after Invoice ---"
$invoiceData = @{
    customerId = 1
    invoiceItems = @(
        @{ productId = 1; quantity = 10; unitPrice = 100 }
    )
} | ConvertTo-Json
$res2 = Invoke-RestMethod -Uri "$baseUrl/invoices" -Method Post -Body $invoiceData -Headers $headers
Write-Host "Invoice Created: $($res2.invoiceNumber)"
$overview2 = Invoke-RestMethod -Uri "$baseUrl/stock/overview" -Method Get
$item2 = $overview2 | Where-Object { $_.productId -eq 1 }
Write-Host "New Stock Level (FIFO applied): $($item2.totalQuantity)"

# 3. TEST 3: Payment Record
Write-Host "`n--- TEST 3: Payment Record ---"
$paymentData = @{
    invoiceId = $res2.invoiceId
    amountPaid = 500
    paymentMethod = "Cash"
    paymentDate = [DateTime]::UtcNow.ToString("yyyy-MM-ddTHH:mm:ss")
} | ConvertTo-Json
$res3 = Invoke-RestMethod -Uri "$baseUrl/payments" -Method Post -Body $paymentData -Headers $headers
Write-Host "Payment Recorded: Rs. $($res3.amountPaid)"
$invFinal = Invoke-RestMethod -Uri "$baseUrl/invoices/$($res2.invoiceId)" -Method Get
Write-Host "Invoice PaidAmount: $($invFinal.paidAmount)"
Write-Host "Invoice Remaining: $($invFinal.remainingAmount)"

# 4. TEST 4: Manual Status Update
Write-Host "`n--- TEST 4: Manual Status Update ---"
$statusData = @{ status = "Partial" } | ConvertTo-Json
$res4 = Invoke-RestMethod -Uri "$baseUrl/invoices/$($res2.invoiceId)/status" -Method Patch -Body $statusData -Headers $headers
$invStatusCheck = Invoke-RestMethod -Uri "$baseUrl/invoices/$($res2.invoiceId)" -Method Get
Write-Host "Manually Updated Status: $($invStatusCheck.paymentStatus)"

# 5. TEST 5: Dashboard Values check
Write-Host "`n--- TEST 5: Dashboard Values ---"
$metrics = Invoke-RestMethod -Uri "$baseUrl/reports/dashboard-metrics" -Method Get
Write-Host "Total Outstanding Balance: $($metrics.totals.outstandingBalance)"
Write-Host "Today's Sales: $($metrics.totals.todaySales)"

Write-Host "`n--- ALL TESTS COMPLETED ---"
