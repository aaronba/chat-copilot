#!/usr/bin/env bash

# Package Chat Copilot application for deployment to Azure

set -e

SCRIPT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_DIRECTORY="$SCRIPT_ROOT"

usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Arguments:"
    echo "  -c, --configuration CONFIGURATION      Build configuration (default: Release)"
    echo "  -d, --dotnet DOTNET_FRAMEWORK_VERSION  Target dotnet framework (default: net8.0)"
    echo "  -r, --runtime TARGET_RUNTIME           Runtime identifier (default: win-x64)"
    echo "  -o, --output OUTPUT_DIRECTORY          Output directory (default: $SCRIPT_ROOT)"
    echo "  -v  --version VERSION                  Version to set files to (default: 1.0.0)"
    echo "  -i  --info INFO                        Additional info to put in version details"
    echo "  -nz, --no-zip                          Do not zip package (default: false)"
    echo "  -s, --skip-frontend                    Do not build frontend files"
    echo "  -ht, --header-title HEADER_TITLE       Header title (default: NSERC Copilot)"
    echo "  -htc, --header-title-color HEADER_TITLE_COLOR Header title color (default: #000000)"
    echo "  -hbc, --header-background-color HEADER_BACKGROUND_COLOR Header background color (default: #FFFFFF)"
    echo "  -l, --logo LOGO                        Header logo (default: none)"
    echo "  -dm, --disclaimer-message DISCLAIMER_MESSAGE Disclaimer message (default: none)"
    echo "  -se, --settings-enabled                Enable settings (default: false)"
    echo "  -dlu, --document-local-upload          Enable local document upload (default: false)"
    echo "  -dgu, --document-global-upload         Enable global document upload (default: false)"

}

# Parse arguments
while [[ $# -gt 0 ]]; do
    key="$1"
    case $key in
    -c | --configuration)
        CONFIGURATION="$2"
        shift
        shift
        ;;
    -d | --dotnet)
        DOTNET="$2"
        shift
        shift
        ;;
    -r | --runtime)
        RUNTIME="$2"
        shift
        shift
        ;;
    -o | --output)
        OUTPUT_DIRECTORY="$2"
        shift
        shift
        ;;
    -v | --version)
        VERSION="$2"
        shift
        shift
        ;;
    -i | --info)
        INFO="$2"
        shift
        shift
        ;;
    -ht | --header-title)
        HEADER_TITLE="$2"
        shift
        shift
        ;;
    -nz | --no-zip)
        NO_ZIP=true
        shift
        ;;
    -s|--skip-frontend)
        SKIP_FRONTEND=true
        shift
        ;;
        *)
        echo "Unknown option $1"
        usage
        exit 1
        ;;
    -htc | --header-title-color)
        HEADER_TITLE_COLOR="$2"
        shift
        shift
        ;;
    -hbc | --header-background-color)
        HEADER_BACKGROUND_COLOR="$2"
        shift
        shift
        ;;
    -l | --logo)
        LOGO="$2"
        shift
        shift
        ;;
    -dm | --disclaimer-message)
        DISCLAIMER_MESSAGE="$2"
        shift
        shift
        ;;
    -se | --settings-enabled)
        SETTINGS_ENABLED=true
        shift
        ;;
    -dlu | --document-local-upload)
        DOCUMENT_LOCAL_UPLOAD=true
        shift
        ;;
    -dgu | --document-global-upload)
        DOCUMENT_GLOBAL_UPLOAD=true
        shift
        ;;
    esac
done

echo  "Building backend executables..."

# Set defaults
: "${CONFIGURATION:="Release"}"
: "${DOTNET:="net8.0"}"
: "${RUNTIME:="win-x64"}"
: "${VERSION:="0.0.0"}"
: "${INFO:=""}"
: "${OUTPUT_DIRECTORY:="$SCRIPT_ROOT"}"
: "${DOCUMENT_LOCAL_UPLOAD:="false"}"
: "${DOCUMENT_GLOBAL_UPLOAD:="false"}"
: "${HEADER_TITLE:="NSERC Copilot"}"

PUBLISH_OUTPUT_DIRECTORY="$OUTPUT_DIRECTORY/publish"
PUBLISH_ZIP_DIRECTORY="$OUTPUT_DIRECTORY/out"
PACKAGE_FILE_PATH="$PUBLISH_ZIP_DIRECTORY/webapi.zip"

if [[ ! -d "$PUBLISH_OUTPUT_DIRECTORY" ]]; then
    mkdir -p "$PUBLISH_OUTPUT_DIRECTORY"
fi
if [[ ! -d "$PUBLISH_ZIP_DIRECTORY" ]]; then
    mkdir -p "$PUBLISH_ZIP_DIRECTORY"
fi

echo "Build configuration: $CONFIGURATION"
dotnet publish "$SCRIPT_ROOT/../../webapi/CopilotChatWebApi.csproj" \
    --configuration $CONFIGURATION \
    --framework $DOTNET \
    --runtime $RUNTIME \
    --self-contained \
    --output "$PUBLISH_OUTPUT_DIRECTORY" \
    -p:AssemblyVersion=$VERSION \
    -p:FileVersion=$VERSION \
    -p:InformationalVersion=$INFO \

if [ $? -ne 0 ]; then
    exit 1
fi

if [[ -z "$SKIP_FRONTEND" ]]; then
    echo "Building static frontend files..."

    pushd "$SCRIPT_ROOT/../../webapp"

    filePath="./.env.production"
    if [ -f "$filePath" ]; then
        rm "$filePath"
    fi

    echo "REACT_APP_BACKEND_URI=" >> "$filePath"
    echo "REACT_APP_SK_VERSION=$Version" >> "$filePath"
    echo "REACT_APP_SK_BUILD_INFO=$InformationalVersion" >> "$filePath"
    echo "REACT_APP_HEADER_TITLE=$HEADER_TITLE" >> "$filePath"
    echo "REACT_APP_HEADER_TITLE_COLOR=$HEADER_TITLE_COLOR" >> "$filePath"
    echo "REACT_APP_HEADER_BACKGROUND_COLOR=$HEADER_BACKGROUND_COLOR" >> "$filePath"
    echo "REACT_APP_HEADER_LOGO=$LOGO" >> "$filePath"
    echo "REACT_APP_SETTINGS_ENABLED=$SETTINGS_ENABLED" >> "$filePath"
    echo "REACT_APP_HEADER_PLUGINS_ENABLED=$HEADER_PLUGINS_ENABLED" >> "$filePath"
    echo "REACT_APP_LOCAL_DOCUMENT_UPLOAD_ENABLED=$DOCUMENT_LOCAL_UPLOAD" >> "$filePath"
    echo "REACT_APP_GLOBAL_DOCUMENT_UPLOAD_ENABLED=$DOCUMENT_GLOBAL_UPLOAD" >> "$filePath"
    echo "REACT_APP_CREATE_NEW_CHAT=$CreateNewChat" >> "$filePath"
    echo "REACT_APP_DISCLAIMER_TEXT=$DISCLAIMER_MESSAGE" >> "$filePath"

    echo "Installing yarn dependencies..."
    yarn install
    if [ $? -ne 0 ]; then
        echo "Failed to install yarn dependencies"
        exit 1
    fi

    echo "Building webapp..."
    yarn build
    if [ $? -ne 0 ]; then
        echo "Failed to build webapp"
        exit 1
    fi

    popd

    echo "Copying frontend files to package"
    cp -R "$SCRIPT_ROOT/../../webapp/build/." "$PUBLISH_OUTPUT_DIRECTORY/wwwroot"
fi

# if not NO_ZIP then zip the package
if [[ -z "$NO_ZIP" ]]; then
    pushd "$PUBLISH_OUTPUT_DIRECTORY"
    echo "Compressing to $PACKAGE_FILE_PATH"
    zip -r $PACKAGE_FILE_PATH .
    popd
fi
