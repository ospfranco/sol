#!/bin/sh

set -e  # Remove -x temporarily for cleaner output

url="$1"
version="$2"
release_notes="$3"

echo "🟠 Creating release version $version"
echo "Release Notes"
echo "$release_notes"

# Check if appcast.xml exists and has content
if [ ! -f "releases/appcast.xml" ] || [ ! -s "releases/appcast.xml" ]; then
    echo "❌ Error: releases/appcast.xml is missing or empty"
    exit 1
fi

url_to_replace="https://raw.githubusercontent.com/ospfranco/sol/main/releases/$version.zip"

xml=$(cat releases/appcast.xml)

# Check if we successfully read the XML
if [ -z "$xml" ]; then
    echo "❌ Error: Failed to read appcast.xml"
    exit 1
fi

xml=${xml//"$url_to_replace"/"$url"}

# Add release notes to the specific version
if [ -n "$release_notes" ]; then
    # No need to escape when using CDATA
    
    # Use awk instead of sed for better newline handling
    xml=$(echo "$xml" | awk -v version="$version" -v notes="$release_notes" '
        $0 ~ "<title>" version "</title>" {
            print $0
            print "            <description><![CDATA[" notes "]]></description>"
            next
        }
        { print }
    ')
fi

# Check if xml is not empty before writing
if [ -n "$xml" ]; then
    echo "$xml" > releases/appcast.xml
    echo "🟩 Created AppCast XML correctly"
else
    echo "❌ Error: XML content became empty, not overwriting file"
    exit 1
fi