<div align="center">
  <img src="assets/logo.jpg" alt="TKNZ Logo" width="200" />
</div>

[https://tknz.fun](https://tknz.fun)

 # TKNZ (Tokenize) Chrome Extension

 TKNZ (pronounced "tokenize") is a Chrome extension that lets you create meme coins on Pump.fun directly from news articles and tweets. It provides a simple UI to manage a Solana wallet, extract article or tweet data (title, image, description) and generate token metadata, then launch tokens with a specified investment amount.

 ## Table of Contents
 - [Goals](#goals)
 - [Features](#features)
 - [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Installation](#installation)
   - [Environment Variables](#environment-variables)
 - [Development](#development)
 - [Build & Packaging](#build--packaging)
 - [Chrome Extension Installation](#chrome-extension-installation)
 - [Scripts](#scripts)
 - [Directory Structure](#directory-structure)
 - [Architecture](#architecture)
 - [Contributing](#contributing)
 - [Roadmap](#roadmap)
 - [License](#license)

 ## Goals
 - Simplify the workflow for launching meme coins based on article or tweet content.
 - Abstract the complexity of Solana SPL token creation and metadata hosting.
 - Provide real-time SOL and token balance updates.
 - Integrate with Pump.fun for token creation and pools.
 - Track key events (balance updates, token launches) via Firebase (optional).
 - Support modern web apps and dynamic content (e.g., SPAs, Twitter/X posts).

 ## Features
 - Extract title, image, and description from articles and tweets.
 - Generate token metadata via an AI-powered Token Creation API.
 - Host metadata on IPFS through Pump.fun.
 - Create and fund Solana SPL tokens with a configurable investment amount.
 - View and refresh SOL and token balances.
 - Version checking and update prompts.
 - Analytics logging to Firestore (requires Firebase configuration).
 - Responsive UI built with React, Vite, Tailwind CSS, and Zustand.

 ## Getting Started

 ### Prerequisites
 - Node.js >= 16.x
 - npm (>= 8.x) or yarn
 - Chrome or any Chromium-based browser

 ### Installation
 1. Clone the repository:
    ```bash
    git clone https://github.com/tokenizedev/tknzv1.git
    cd tknzv1
    ```
 2. Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```
 3. Generate a private key for packaging (one-time):
    ```bash
    npm run keygen
    ```
    This creates `extension.pem` used by CRXJS for signing.

 ### Environment Variables
 Create a `.env` file in the project root with the following:
 ```ini
 VITE_FIREBASE_API_KEY=<Your Firebase Web API Key>
 ```
 Optionally override the app version:
 ```ini
 VITE_APP_VERSION=0.2.3
 ```

 ## Development
 Start the Vite development server:
 ```bash
 npm run dev
 ```
 Load the extension as an unpacked extension:
 1. Navigate to `chrome://extensions/`.
 2. Enable **Developer mode**.
 3. Click **Load unpacked** and select the project root.
 4. Click the TKNZ icon in the toolbar to open the popup.

 ## Build & Packaging
 Build for production:
 ```bash
 npm run build
 ```
 Package into a CRX file:
 ```bash
 npm run package
 ```
 Release (bump version, build, package):
 ```bash
 npm run release
 ```
 The generated `.crx` file will be in the project root.

 ## Chrome Extension Installation
 To install the packaged CRX:
 1. Drag and drop the `.crx` file into `chrome://extensions/`.
 2. Confirm installation.
 Alternatively, load the `dist/` folder as an unpacked extension.

 ## Scripts
 - `npm run dev`         — Start development server with HMR.
 - `npm run build`       — Build extension (includes TypeScript compile).
 - `npm run build:crx`   — Alias for build.
 - `npm run lint`        — Run ESLint.
 - `npm run preview`     — Preview the build locally.
 - `npm run bump`        — Bump version and create Git tag.
 - `npm run keygen`      — Generate `extension.pem` for packaging.
 - `npm run package`     — Package into CRX.
 - `npm run release`     — Build, bump version, and package.
 - `npm run test`        — Run unit tests in watch mode.
 - `npm run test:ci`     — Run tests once with coverage.

 ## Directory Structure
 ```
 .
 ├── public/                # Static assets (icons, images)
 ├── src/                   # Extension source code
 │   ├── background.ts      # Background service worker
 │   ├── contentScript.tsx  # Content script for data extraction
 │   ├── firebase.ts        # Firebase analytics
 │   ├── App.tsx            # React popup UI
 │   ├── main.tsx           # React entry point
 │   ├── store.ts           # Zustand store (wallet & token logic)
 │   ├── components/        # React components (WalletSetup, CoinCreator, etc.)
 │   └── config/            # Configuration (version, etc.)
 ├── scripts/               # Helper scripts (keygen, postbuild)
 ├── manifest.json          # Chrome extension manifest (MV3)
 ├── package.json           # npm scripts & dependencies
 ├── vite.config.ts         # Vite + CRXJS config
 ├── tsconfig.json
 └── README.md              # <-- You are here
 ```
  
 ## Architecture
 
 ```mermaid
 graph LR
   subgraph "Chrome Extension"
     CS["Content Script"]
     BG["Background Service Worker"]
     UI["React Popup UI"]
     Store["Zustand Store"]
   end

   subgraph "External Services"
     AI["Token Creation API"]
     PumpFun["Pump.fun API & IPFS"]
     Solana["Solana Blockchain"]
     Firebase["Firebase Analytics"]
   end

   CS -->|Extract content| BG
   UI -->|User actions| BG
   BG -->|State updates| Store
   BG -->|Generate metadata| AI
   BG -->|Upload metadata| PumpFun
   BG -->|Create & fund tokens| Solana
   BG -->|Log events| Firebase
   Store -->|State| UI
 ```

 ## Contributing
 Contributions welcome! Please fork the repo and submit a pull request:
 1. Fork the repo.
 2. Create a feature branch: `git checkout -b feature/YourFeature`.
 3. Commit your changes: `git commit -m 'feat: add amazing feature'`.
 4. Push to your branch: `git push origin feature/YourFeature`.
 5. Open a pull request.
 Ensure code is linted and builds cleanly.

 ## Roadmap
 The project's roadmap is available [here](roadmap-05-01-2025.md).

 ## License
 This project is private. Please contact the maintainers for access.