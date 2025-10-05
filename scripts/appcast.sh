#!/bin/sh

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
# Find the first <item> and add description after the title
if [ -n "$release_notes" ]; then
    # Escape special characters in release notes for XML
    escaped_notes=$(echo "$release_notes" | sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g; s/"/\&quot;/g; s/'"'"'/\&#39;/g')
    
    # Add description after the first <title> tag within an <item>
    xml=$(echo "$xml" | sed '0,/<item>/,/<\/title>/{s|</title>|</title>\n            <description><![CDATA['"$escaped_notes"']]></description>|;}')
fi

echo "$xml" > releases/appcast.xml

echo "🟩 Created AppCast XML correctly"