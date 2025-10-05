#!/usr/bin/env bun

const [url, version, releaseNotes] = process.argv.slice(2);

console.log(`🟠 Creating release version ${version}`);
console.log("Release Notes");
console.log(releaseNotes);

// Check if appcast.xml exists
const appcastPath = "releases/appcast.xml";
const file = Bun.file(appcastPath);

if (!(await file.exists())) {
    console.log("❌ Error: releases/appcast.xml is missing");
    process.exit(1);
}

// Read the XML content
let xml = await file.text();

if (!xml || xml.trim().length === 0) {
    console.log("❌ Error: releases/appcast.xml is empty");
    process.exit(1);
}

// Replace the URL
const urlToReplace = `https://raw.githubusercontent.com/ospfranco/sol/main/releases/${version}.zip`;
xml = xml.replace(urlToReplace, url);

// Add release notes to the specific version
if (releaseNotes && releaseNotes.trim().length > 0) {
    const titlePattern = `<title>${version}</title>`;
    const replacement = `${titlePattern}\n            <description><![CDATA[${releaseNotes}]]></description>`;
    xml = xml.replace(titlePattern, replacement);
}

// Write back to file
await Bun.write(appcastPath, xml);

console.log("🟩 Created AppCast XML correctly");