$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$indexPath = Join-Path $root 'index.html'
$sourcePath = Join-Path $root 'index.source.html'

if (-not (Test-Path -LiteralPath $sourcePath)) {
    Copy-Item -LiteralPath $indexPath -Destination $sourcePath
}

$html = Get-Content -LiteralPath $sourcePath -Raw
$css = Get-Content -LiteralPath (Join-Path $root 'css/sop-dashboard.css') -Raw
$chartJs = Get-Content -LiteralPath (Join-Path $root 'js/chart.min.js') -Raw
$dataJs = Get-Content -LiteralPath (Join-Path $root 'js/fpt-data.js') -Raw
$appJs = Get-Content -LiteralPath (Join-Path $root 'js/sop-app.js') -Raw

$html = $html.Replace('<link rel="stylesheet" href="css/sop-dashboard.css">', "<style>`n$css`n</style>")
$html = $html.Replace('<script src="js/chart.min.js"></script>', "<script>`n$chartJs`n</script>")
$html = $html.Replace('<script src="js/fpt-data.js"></script>', "<script>`n$dataJs`n</script>")
$html = $html.Replace('<script src="js/sop-app.js"></script>', "<script>`n$appJs`n</script>")

[System.IO.File]::WriteAllText($indexPath, $html, [System.Text.UTF8Encoding]::new($false))
Write-Output "Created standalone file: $indexPath"
