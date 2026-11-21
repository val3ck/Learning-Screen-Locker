param([switch]$PrintTarget, [switch]$PrepareOnly, [switch]$Background)
$ErrorActionPreference = 'Stop'
$recallRoot = Split-Path -Parent $PSScriptRoot
$primaryRelease = Join-Path $recallRoot 'release/win-unpacked'
$primaryExe = [IO.Path]::GetFullPath((Join-Path $primaryRelease 'SQL Recall.exe'))
$primaryArchive = Join-Path $primaryRelease 'resources/app.asar'
$pendingArchive = "$primaryArchive.pending-recall-update"

function Get-RecallHash([string]$file) {
    $sha = [Security.Cryptography.SHA256]::Create()
    $stream = $null
    try {
        $stream = [IO.File]::OpenRead($file)
        [BitConverter]::ToString($sha.ComputeHash($stream)).Replace('-', '')
    } finally {
        if ($stream) { $stream.Dispose() }
        $sha.Dispose()
    }
}

$launchMutex = [Threading.Mutex]::new($false, 'Local\SQLRecallLaunch')
$held = $false
try {
    try { $held = $launchMutex.WaitOne(8000) }
    catch [Threading.AbandonedMutexException] { $held = $true }
    if (-not $held) { throw 'SQL Recall launch is already in progress.' }
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

    $relativePaths = @('release-english-live\win-unpacked\SQL Recall.exe', 'release\win-unpacked\SQL Recall.exe', 'release\english-task-cards\win-unpacked\SQL Recall.exe')
    $candidates = foreach ($relative in $relativePaths) {
        $exe = Join-Path $recallRoot $relative
        $archive = Join-Path (Split-Path -Parent $exe) 'resources\app.asar'
        if ((Test-Path -LiteralPath $exe -PathType Leaf) -and (Test-Path -LiteralPath $archive -PathType Leaf)) {
            [PSCustomObject]@{ Exe = $exe; Archive = $archive; BuiltAt = (Get-Item -LiteralPath $archive).LastWriteTimeUtc; Manifest = $null }
        }
    }
    $verified = foreach ($release in Get-ChildItem -LiteralPath $recallRoot -Directory -Filter 'release-local-*') {
        if ($release.Attributes -band [IO.FileAttributes]::ReparsePoint) { continue }
        $marker = Join-Path $release.FullName 'release-ready.json'
        $exe = Join-Path $release.FullName 'win-unpacked\SQL Recall.exe'
        $archive = Join-Path $release.FullName 'win-unpacked\resources\app.asar'
        if (-not (Test-Path -LiteralPath $marker -PathType Leaf)) { continue }
        try {
            $markerFile = Get-Item -LiteralPath $marker
            if ($markerFile.Length -gt 4096) { continue }
            $manifest = Get-Content -LiteralPath $marker -Raw | ConvertFrom-Json
            if ($manifest.schema -ne 1 -or $manifest.product -ne 'sql-recall' -or
                $manifest.exeSha256 -notmatch '^[a-f0-9]{64}$' -or $manifest.archiveSha256 -notmatch '^[a-f0-9]{64}$') { continue }
            [PSCustomObject]@{ Exe = $exe; Archive = $archive; BuiltAt = $markerFile.LastWriteTimeUtc; Manifest = $manifest }
        } catch { continue }
    }
    $selected = foreach ($candidate in $verified | Sort-Object -Property BuiltAt -Descending) {
        try {
            if ((Get-Item -LiteralPath $candidate.Exe).Length -ne $candidate.Manifest.exeBytes -or
                (Get-Item -LiteralPath $candidate.Archive).Length -ne $candidate.Manifest.archiveBytes) { continue }
            if ((Get-RecallHash $candidate.Archive) -ne $candidate.Manifest.archiveSha256 -or
                (Get-RecallHash $candidate.Exe) -ne $candidate.Manifest.exeSha256) { continue }
            $candidate
            break
        } catch { continue }
    }
    if (-not $selected) { $selected = $candidates | Sort-Object -Property BuiltAt -Descending | Select-Object -First 1 }
    if (-not $selected) { throw 'SQL Recall.exe was not found. Build or restore the application first.' }
    if ($PrintTarget -or $PrepareOnly) { Write-Output $selected.Exe; return }
    if ($Background) {
        Start-Process -FilePath $selected.Exe -ArgumentList '--background' -WindowStyle Hidden -WorkingDirectory $recallRoot
    } else {
        Start-Process -FilePath $selected.Exe -WorkingDirectory $recallRoot
    }
} finally {
    if ($held) { $launchMutex.ReleaseMutex() }
    $launchMutex.Dispose()
}
