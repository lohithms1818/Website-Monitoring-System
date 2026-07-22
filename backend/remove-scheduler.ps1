# remove-scheduler.ps1
# Removes the Windows Task Scheduler task created by setup-scheduler.ps1
# Run this script as Administrator to stop the scheduler.

$taskName = "LaravelWebsiteMonitor"

if (Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue) {
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
    Write-Host "Task '$taskName' has been removed." -ForegroundColor Yellow
} else {
    Write-Host "Task '$taskName' not found — nothing to remove." -ForegroundColor Gray
}
