# setup-scheduler.ps1
# Registers a Windows Task Scheduler task that runs the Laravel scheduler every minute.
# Run this script once as Administrator.

$taskName   = "LaravelWebsiteMonitor"
$phpPath    = (Get-Command php -ErrorAction Stop).Source
$artisan    = Join-Path $PSScriptRoot "artisan"
$workingDir = $PSScriptRoot

$action  = New-ScheduledTaskAction `
               -Execute $phpPath `
               -Argument "`"$artisan`" schedule:run" `
               -WorkingDirectory $workingDir

$trigger = New-ScheduledTaskTrigger -RepetitionInterval (New-TimeSpan -Minutes 1) -Once -At (Get-Date)

$settings = New-ScheduledTaskSettingsSet `
               -ExecutionTimeLimit (New-TimeSpan -Minutes 5) `
               -MultipleInstances IgnoreNew `
               -StartWhenAvailable

$principal = New-ScheduledTaskPrincipal `
               -UserId "$env:USERDOMAIN\$env:USERNAME" `
               -LogonType S4U `
               -RunLevel Highest

Register-ScheduledTask `
    -TaskName   $taskName `
    -Action     $action `
    -Trigger    $trigger `
    -Settings   $settings `
    -Principal  $principal `
    -Force | Out-Null

Write-Host "Task '$taskName' registered. Laravel scheduler will run every minute." -ForegroundColor Green
Write-Host "View it in: Task Scheduler > Task Scheduler Library > $taskName" -ForegroundColor Cyan
