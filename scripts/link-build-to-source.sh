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
  # Copy for content script loader (source mapping)
  cat "$injected_wallet_file" > dist/src/injectedWallet.ts
  echo "Contents of $injected_wallet_file copied to dist/src/injectedWallet.ts"
  # Copy to root for module injection (must be .js for proper MIME type)
  cp "$injected_wallet_file" dist/injectedWallet.js
  echo "Contents of $injected_wallet_file copied to dist/injectedWallet.js"
  # Copy any ESM chunk needed by injectedWallet
  index_esm_file=$(ls dist/assets/index.browser.esm-*.js 2>/dev/null)
  if [ -n "$index_esm_file" ]; then
    cp "$index_esm_file" dist/$(basename "$index_esm_file")
    echo "Contents of $index_esm_file copied to dist/$(basename "$index_esm_file")"
  fi
else
  echo "Warning: injectedWallet build artifact not found, skipping copy"
fi

echo "Done"
