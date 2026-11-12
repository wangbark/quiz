param([string]$ProjectRoot='C:\QuizWeb')
$ErrorActionPreference='Stop'
$module='games'
$source=Join-Path $ProjectRoot ('docs\'+$module)
if(-not (Test-Path -LiteralPath (Join-Path $source 'index.html') -PathType Leaf)){
  throw ('Missing source: '+(Join-Path $source 'index.html'))
}
$stamp=Get-Date -Format 'yyyyMMdd_HHmmss'
$backup=Join-Path 'C:\QuizWeb_Backups' ('Module_'+$module+'_'+$stamp)
$targets=@(
  (Join-Path $ProjectRoot ('wwwroot\'+$module)),
  (Join-Path $ProjectRoot ('publish\wwwroot\'+$module))
)
$allowed=@('.html','.css','.js','.json','.svg','.png','.jpg','.jpeg','.webp','.gif','.ico','.woff','.woff2','.ttf','.mp3','.wav','.mp4','.webm')
$files=@(Get-ChildItem -LiteralPath $source -Recurse -File -ErrorAction Stop | Where-Object { $allowed -contains $_.Extension.ToLowerInvariant() })
if($files.Count -lt 1){throw ('No web assets found in '+$source)}
$plan=New-Object System.Collections.ArrayList
foreach($targetRoot in $targets){
  foreach($file in $files){
    $rel=$file.FullName.Substring($source.Length).TrimStart([char]'\')
    $dest=Join-Path $targetRoot $rel
    [void]$plan.Add([pscustomobject]@{ Source=$file.FullName; Destination=$dest; TargetRoot=$targetRoot; Relative=$rel })
  }
}
Write-Host ('=== QuizWeb patch'+$module+'.ps1 ===') -ForegroundColor Cyan
Write-Host ('Module: '+$source)
foreach($p in $plan){
  $dir=Split-Path -Parent $p.Destination
  if(-not (Test-Path -LiteralPath $dir -PathType Container)){
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
  }
  if(Test-Path -LiteralPath $p.Destination -PathType Leaf){
    $suffix=if($p.TargetRoot -like '*\publish\wwwroot\*'){'publish'}else{'source'}
    $destBackup=Join-Path $backup (Join-Path $suffix $p.Relative)
    $bkDir=Split-Path -Parent $destBackup
    if(-not(Test-Path -LiteralPath $bkDir -PathType Container)){
      New-Item -ItemType Directory -Path $bkDir -Force | Out-Null
    }
    Copy-Item -LiteralPath $p.Destination -Destination $destBackup -Force
  }
  Copy-Item -LiteralPath $p.Source -Destination $p.Destination -Force
  $h1=(Get-FileHash -LiteralPath $p.Source -Algorithm SHA256).Hash
  $h2=(Get-FileHash -LiteralPath $p.Destination -Algorithm SHA256).Hash
  if($h1 -ne $h2){throw ('Hash mismatch: '+$p.Destination)}
  Write-Host ('  OK: '+$p.Destination) -ForegroundColor Green
}
Write-Host ('Module '+$module+' deployed to both webroots; no service restart; other modules untouched.') -ForegroundColor Green