param([string]$Base="https://REPLACE_RAILWAY_URL")
try { Invoke-RestMethod "$Base/health" -TimeoutSec 10 | Out-Null } catch {}
try { Invoke-RestMethod "$Base/api/library?site=coptic&max_pages=1&max_follow=0" -TimeoutSec 25 | Out-Null } catch {}
"warm ok $(Get-Date -Format o)"
