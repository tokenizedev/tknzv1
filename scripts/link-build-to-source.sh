#!/bin/bash

# Find the contentScript-[hash].js file in the dist folder
# i need it this file: "contentScript-HpWyLiM6.js" but this may be dynamic

# Locate the compiled content script file (e.g., contentScript-<hash>.js)
content_script_file=$(ls dist/assets/contentScript-????????.js)


# Ensure output directory exists and copy the content script into dist/src
mkdir -p dist/src
cat "$content_script_file" > dist/src/contentScript.tsx

echo "Contents of $content_script_file copied to dist/src/contentScript.tsx"

echo "Done"
