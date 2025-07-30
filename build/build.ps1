# === Parameter ===
$7zipExecutable = "C:\Program Files\7-Zip\7z.exe" # path to 7zip executable
$jsonFile     = "../src/manifest.json"
$sourceFolder = "../src/*"
# $targetPath   = "C:\UnifiedKurs\CWC_Waves\UserFiles\CustomControls"  # target path TIA Portal project
# $targetPath = "C:\Program Files\Siemens\Automation\Portal V19\Data\Hmi\CustomControls" # target path TIA Portal program folder
$targetPath = "../release";

# === read JSON and extract GUID ===
if (-Not (Test-Path $jsonFile)) {
    Write-Error "Configuration '$jsonFile' not found."
    exit 1
}

$jsonContent = Get-Content $jsonFile -Raw | ConvertFrom-Json
$guid = $jsonContent.control.identity.type
$guid = $guid -replace "^guid://", ""

# === create Filename ===
$targetFilename  = "{${guid}}.zip"
$target   = Join-Path $targetPath $targetFilename


# === create ZIP ===
if (-Not (Test-Path $sourceFolder)) {
    Write-Error "Source folder '$sourceFolder' not found."
    exit 1
}

& $7zipExecutable a -scsWIN $target $sourceFolder