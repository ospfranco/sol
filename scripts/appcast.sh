#!/bin/sh

set -ex

url="$1"
version="$2"
release_notes="$3"

echo "🟠 Creating release version $version"
echo "Release Notes"
echo "$release_notes"

url_to_replace="https://raw.githubusercontent.com/ospfranco/sol/main/releases/$version.zip"

xml=$(cat releases/appcast.xml)

xml=${xml//"$url_to_replace"/"$url"}

# Add release notes to the first item (most recent version)
if [ -n "$release_notes" ]; then
    # Escape special characters in release notes for XML
    escaped_notes=$(echo "$release_notes" | sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g; s/"/\&quot;/g; s/'"'"'/\&#39;/g')
    
    # Find the first </title> and add description after it
    xml=$(echo "$xml" | sed '0,/<\/title>/{s|</title>|</title>\
            <description><![CDATA['"$escaped_notes"']]></description>|;}')
fi

echo "$xml" > releases/appcast.xml

echo "🟩 Created AppCast XML correctly"