#!/bin/bash

# Find the contentScript-[hash].js file in the dist folder
# i need it this file: "contentScript-HpWyLiM6.js" but this may be dynamic
content_script_file=$(ls dist/assets/contentScript-????????.js)


# Copy the contents of the contentScript file to dist/src/contentScript.js for manifest
cat "$content_script_file" > dist/src/contentScript.js

# No longer using .tsx for content script, .js has been copied

echo "Contents of $content_script_file copied to dist/src/contentScript.js"
echo "Done"
