param(
  [string]$Base = "http://localhost:3000"
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

function Invoke-Json($url) {
  try {
    $r = Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 60
    return $r.Content
  } catch {
    return "ERR: $($_.Exception.Message)"
  }
}

Write-Host "== Health ==" -ForegroundColor Cyan
$h = Invoke-Json "$Base/api/health"
Write-Host $h

$cases = @(
  @{ name="valid-minimal"; q="didache" },
  @{ name="with-site-coptic"; q="أثناسيوس"; site="coptic"; max_pages="1"; max_follow="0" },
  @{ name="with-site-christianlib"; q="didache"; site="christianlib"; max_pages="2"; max_follow="2" },
  @{ name="digits-mixed"; q="test"; max_pages=" 5abc "; max_follow=" 10xyz " },
  @{ name="too-large"; q="test"; max_pages="9999"; max_follow="9999" },
  @{ name="negative"; q="test"; max_pages="-3"; max_follow="-2" },
  @{ name="empty-query"; q="" },
  @{ name="no-params" }
)

Write-Host "`n== Proxy cases ==" -ForegroundColor Cyan
foreach ($c in $cases) {
  $pairs = @()
  if ($c.ContainsKey('q')) { $pairs += "q=" + [Uri]::EscapeDataString($c.q) }
  if ($c.site) { $pairs += "site=" + [Uri]::EscapeDataString($c.site) }
  if ($c.max_pages) { $pairs += "max_pages=" + [Uri]::EscapeDataString($c.max_pages) }
  if ($c.max_follow) { $pairs += "max_follow=" + [Uri]::EscapeDataString($c.max_follow) }
  $qs = if ($pairs.Count -gt 0) { "?" + ($pairs -join "&") } else { "" }
  $url = "$Base/api/proxy/library$qs"
  $res = Invoke-Json $url
  $preview = if ($res.Length -gt 200) { $res.Substring(0,200) + "…" } else { $res }
  Write-Host ("• {0} → {1}" -f $c.name, $url) -ForegroundColor Yellow
  Write-Host $preview
}
