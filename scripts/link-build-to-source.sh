#!/bin/bash

# Find the contentScript-[hash].js file in the dist folder
# i need it this file: "contentScript-HpWyLiM6.js" but this may be dynamic
content_script_file=$(ls dist/assets/contentScript-????????.js)


# Copy the contents of the contentScript file to src/contentScript.tsx
cat "$content_script_file" > dist/src/contentScript.tsx

echo "Contents of $content_script_file copied to dist/src/contentScript.tsx"

echo "Done"
