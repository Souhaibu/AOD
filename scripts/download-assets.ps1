$assetDirectory = 'C:\AODsite\public\images'
New-Item -ItemType Directory -Path $assetDirectory -Force | Out-Null
$assetIds = @(
 'photo-1483985988355-763728e1935b',
 'photo-1548036328-c9fa89d128fa',
 'photo-1598033129183-c4f50c736f10',
 'photo-1515372039744-b8f02a3ae446',
 'photo-1543163521-1bf539c55dd2',
 'photo-1553062407-98eeb64c6a62',
 'photo-1511499767150-a48a237f0083',
 'photo-1549298916-b41d501d3772',
 'photo-1539109136881-3be0616acf4b',
 'photo-1617137968427-85924c800a22',
 'photo-1584917865442-de89df76afd3',
 'photo-1445205170230-053b83016050',
 'photo-1441986300917-64674bd600d8'
)
foreach ($assetId in $assetIds) {
 $assetPath = Join-Path $assetDirectory ($assetId + '.jpg')
 if (-not (Test-Path -LiteralPath $assetPath)) {
  Invoke-WebRequest -Uri ('https://images.unsplash.com/' + $assetId + '?auto=format&fit=crop&w=1000&q=75') -OutFile $assetPath -TimeoutSec 45
 }
 Write-Output $assetId
}
