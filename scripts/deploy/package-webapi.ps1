<#
.SYNOPSIS
Package Chat Copilot application for deployment to Azure
#>

param(
    [string]
    # Build configuration to publish.
    $BuildConfiguration = "Release",
    
    [string]
    # .NET framework to publish.
    $DotNetFramework = "net8.0",
    
    [string]
    # Target runtime to publish.
    $TargetRuntime = "win-x64",
    
    [string]
    # Output directory for published assets.
    $OutputDirectory = "$PSScriptRoot",

    [string]
    # Version to give to assemblies and files.
    $Version = "1.0.0",

    [string]
    # Additional information given in version info.
    $InformationalVersion = "",

    [bool]
    # Whether to skip building frontend files (false by default)
    $SkipFrontendFiles = $false,

    [string]
    # Header title
    $HeaderTitle = "Chat Copilot",

    [string]
    # Header title color
    $HeaderTitleColor = "#000000",

    [string]
    # Header background color
    $HeaderBackgroundColor = "#FFFFFF",

    [string]
    # Header logo
    $Logo = "",

    [string]
    # Disclaimer message
    $BannerMessage = "",

    [string]
    # Enable settings
    $SettingsEnabled = "true",

    [string]
    # Enable local document upload
    $DocumentLocalUpload = "true",

    [string]
    # Enable global document upload
    $DocumentGlobalUpload = "false"
)

Write-Host "Building backend executables..."

Write-Host "BuildConfiguration: $BuildConfiguration"
Write-Host "DotNetFramework: $DotNetFramework"
Write-Host "TargetRuntime: $TargetRuntime"
Write-Host "OutputDirectory: $OutputDirectory"

$publishOutputDirectory = "$OutputDirectory/publish"
$publishedZipDirectory = "$OutputDirectory/out"
$publishedZipFilePath = "$publishedZipDirectory/webapi.zip"
if (!(Test-Path $publishedZipDirectory)) {
    New-Item -ItemType Directory -Force -Path $publishedZipDirectory | Out-Null
}
if (Test-Path $publishOutputDirectory) {
    rm $publishOutputDirectory/* -r -force
}

New-Item -ItemType Directory -Force -Path $publishOutputDirectory | Out-Null

Write-Host "Build configuration: $BuildConfiguration"
dotnet publish "$PSScriptRoot/../../webapi/CopilotChatWebApi.csproj" --configuration $BuildConfiguration --framework $DotNetFramework --runtime $TargetRuntime --self-contained --output "$publishOutputDirectory" /p:AssemblyVersion=$Version /p:FileVersion=$Version /p:InformationalVersion=$InformationalVersion
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

if (-Not $SkipFrontendFiles) {
    Write-Host "Building static frontend files..."

    Push-Location -Path "$PSScriptRoot/../../webapp"
    
    $filePath = "./.env.production"
    if (Test-path $filePath -PathType leaf) {
        Remove-Item $filePath
    }
    
    Add-Content -Path $filePath -Value "REACT_APP_BACKEND_URI="
    Add-Content -Path $filePath -Value "REACT_APP_SK_VERSION=$Version"
    Add-Content -Path $filePath -Value "REACT_APP_SK_BUILD_INFO=$InformationalVersion"
    Add-Content -Path $filePath -Value "REACT_APP_HEADER_TITLE=$HeaderTitle"
    Add-Content -Path $filePath -Value "REACT_APP_HEADER_TITLE_COLOR=$HeaderTitleColor"
    Add-Content -Path $filePath -Value "REACT_APP_HEADER_BACKGROUND_COLOR=$HeaderBackgroundColor"
    Add-Content -Path $filePath -Value "REACT_APP_HEADER_LOGO=$Logo"
    Add-Content -Path $filePath -Value "REACT_APP_SETTINGS_ENABLED=$SettingsEnabled"
    Add-Content -Path $filePath -Value "REACT_APP_LOCAL_DOCUMENT_UPLOAD_ENABLED=$DocumentLocalUpload"
    Add-Content -Path $filePath -Value "REACT_APP_GLOBAL_DOCUMENT_UPLOAD_ENABLED=$DocumentGlobalUpload"
    Add-Content -Path $filePath -Value "REACT_APP_BANNER_TEXT=$BannerMessage"

    # Debug: List the contents of the .env.production file
    Write-Host "Contents of .env.production file:"
    Get-Content -Path $filePath | ForEach-Object { Write-Host $_ }

    Write-Host "Installing yarn dependencies..."
    yarn install
    if ($LASTEXITCODE -ne 0) {
        exit $LASTEXITCODE
    }

    Write-Host "Building webapp..."
    yarn build
    if ($LASTEXITCODE -ne 0) {
        exit $LASTEXITCODE
    }

    Pop-Location

    Write-Host "Copying frontend files to package"
    Copy-Item -Path "$PSScriptRoot/../../webapp/build/*" -Destination "$publishOutputDirectory\wwwroot" -Recurse -Force
}

Write-Host "Compressing package to $publishedZipFilePath"
Compress-Archive -Path $publishOutputDirectory\* -DestinationPath $publishedZipFilePath -Force

Write-Host "Published package to '$publishedZipFilePath'"