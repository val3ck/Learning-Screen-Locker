param([switch]$PrintTarget)
$ErrorActionPreference = 'Stop'
$recallRoot = Split-Path -Parent $PSScriptRoot
$primaryRelease = Join-Path $recallRoot 'release/win-unpacked'
$primaryExe = [IO.Path]::GetFullPath((Join-Path $primaryRelease 'SQL Recall.exe'))
$primaryArchive = Join-Path $primaryRelease 'resources/app.asar'
$pendingArchive = "$primaryArchive.pending-recall-update"

if (-not $PrintTarget -and (Test-Path -LiteralPath $pendingArchive -PathType Leaf) -and
    (Test-Path -LiteralPath $primaryArchive -PathType Leaf) -and (Test-Path -LiteralPath $primaryExe -PathType Leaf)) {
    $live = @(Get-Process -Name 'SQL Recall' -ErrorAction SilentlyContinue | Where-Object { -not $_.Path -or $_.Path -eq $primaryExe })
    if (-not $live.Count) {
        $backup = Join-Path $recallRoot ('artifacts/before-recall-update-' + [Guid]::NewGuid().ToString('N') + '-app.asar')
        New-Item -ItemType Directory -Path (Split-Path -Parent $backup) -Force | Out-Null
        [IO.File]::Move($primaryArchive, $backup)
        try { [IO.File]::Move($pendingArchive, $primaryArchive) }
        catch { [IO.File]::Move($backup, $primaryArchive); throw }
    }
}

$relativePaths = @('release\win-unpacked\SQL Recall.exe', 'release\english-task-cards\win-unpacked\SQL Recall.exe')
$candidates = foreach ($relative in $relativePaths) {
    $exe = Join-Path $recallRoot $relative
    $archive = Join-Path (Split-Path -Parent $exe) 'resources\app.asar'
    if ((Test-Path -LiteralPath $exe -PathType Leaf) -and (Test-Path -LiteralPath $archive -PathType Leaf)) {
        [PSCustomObject]@{ Exe = $exe; BuiltAt = (Get-Item -LiteralPath $archive).LastWriteTimeUtc }
    }
}
$selected = $candidates | Sort-Object -Property BuiltAt -Descending | Select-Object -First 1
if (-not $selected) { throw 'SQL Recall.exe was not found. Build or restore the application first.' }
if ($PrintTarget) { Write-Output $selected.Exe; exit 0 }
# This is the interactive app selected by the user, not a background helper.
Start-Process -FilePath $selected.Exe -WorkingDirectory $recallRoot
