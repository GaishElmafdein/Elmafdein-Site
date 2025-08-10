try {
  $resp = (Invoke-WebRequest -UseBasicParsing 'http://127.0.0.1:8000/api/library?q=didache' -TimeoutSec 95).Content
  if($resp.Length -gt 200){
    $resp.Substring(0,200)
  } else {
    $resp
  }
} catch {
  'LIB_ERROR: ' + $_.Exception.Message
}
