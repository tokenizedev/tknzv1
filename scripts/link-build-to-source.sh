#!/bin/bash

# Find the contentScript-[hash].js file in the dist folder
# i need it this file: "contentScript-HpWyLiM6.js" but this may be dynamic
content_script_file=$(ls dist/assets/contentScript-????????.js)


# Copy the contents of the contentScript file to src/contentScript.tsx
cat "$content_script_file" > dist/src/contentScript.tsx

echo "Contents of $content_script_file copied to dist/src/contentScript.tsx"

# Find and copy the built injectedWallet JS into dist/src as a compiled script
injected_wallet_file=$(ls dist/assets/injectedWallet-*.js 2>/dev/null)
if [ -n "$injected_wallet_file" ]; then
  cat "$injected_wallet_file" > dist/src/injectedWallet.ts
  echo "Contents of $injected_wallet_file copied to dist/src/injectedWallet.ts"
else
  echo "Warning: injectedWallet build artifact not found, skipping copy"
fi

echo "Done"
