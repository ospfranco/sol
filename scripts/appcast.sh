#!/bin/bash

url="$1"
version="$2"

url_to_replace="https://raw.githubusercontent.com/ospfranco/sol/main/releases/$version.zip"

# XML template
# Read XML content from file
xml=$(cat releases/appcast.xml)

# Replace the url
xml=${xml//"$url_to_replace"/"$url"}

# Save XML content to a file
echo "$xml" > releases/appcast.xml

echo "XML file generated successfully."