# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [0.17.0](https://tokenizedev///compare/v0.16.0...v0.17.0) (2025-05-23)


### ⚠ BREAKING CHANGES

* **components:** Update text from 'Platform Fee' to 'TKNZ Fee' in Coin Preview section
* **contentScript:** Method `animateInertia` removed in favor of `setTranslate` that handles button movement and position calculation.

### Features

* Add validation function isValidCoinCreationPayload for coin creation payload ([acd07a5](https://tokenizedev///commit/acd07a5e92c6bac43e6fa118d27df946f7269ad8))
* **background:** add logic to clean up when windows are closed ([29f5340](https://tokenizedev///commit/29f53408a580896fdffe0fbb3ba8eaff29d0c8e7))
* **components:** Add new features and improvements to CoinCreator ([091b6ea](https://tokenizedev///commit/091b6ea02ddbc0efb27cbea55d9813dca78946b5))
* **components:** update CoinCreator component UI ([391c716](https://tokenizedev///commit/391c716914554282d9f604b73c875fcc7bb44d9d))
* **components:** update CoinCreator UI and functionality ([5a1a75a](https://tokenizedev///commit/5a1a75a19dfa7e4fecbb717245626efcd8704477))
* **components:** Update label for platform fee in CoinCreator component ([35d68f4](https://tokenizedev///commit/35d68f4b716fe3327c67481461af121186bfa793))
* **contentScript:** Add draggable functionality to button ([ee7ead8](https://tokenizedev///commit/ee7ead855d761297a82d0e04056389ea60ba714f))
* **contentScript:** introduce isSidebarActive function ([8f4858d](https://tokenizedev///commit/8f4858de8c41402d46d5a232656e702d6e49820a))
* **src:** add heartbeat functionality to persist sidebar state ([681ae9c](https://tokenizedev///commit/681ae9c9e73e049248f1b62ef94a359607a9e0fc))

## [0.16.0](https://tokenizedev///compare/v0.15.1...v0.16.0) (2025-05-23)


### ⚠ BREAKING CHANGES

* **contentScript:** The visual behavior of the floating scan button has been updated with a new animation and logo styling for improved aesthetics.
* **components:** The Loader component now includes an additional animated logo for better visual appeal.
* **components:** This feature introduces changes to the user interaction by automatically scrolling to the preview when it appears, enhancing the user experience.
* **services:** The `searchToken`

### Features

* **background:** add token validation feature ([99d1704](https://tokenizedev///commit/99d1704ec06ed7961d716203219318aedecf1f5d))
* **background:** implement token search functionality for validation ([6c9c201](https://tokenizedev///commit/6c9c2014e701e0f1dd48ca818221fc63799e15f8))
* **CoinCreator:** Implement fetching and displaying SOL price in USD ([814f1d7](https://tokenizedev///commit/814f1d75aa4c0f7699bbd2a6d0533e9f6b300990))
* **components:** Add animated logo to Loader component ([7faaca6](https://tokenizedev///commit/7faaca64a3a0df5fc3ec0f4838c61266cb1804d1))
* **components:** add auto-preview functionality to CoinCreator ([d654ad4](https://tokenizedev///commit/d654ad4f4ac4f75b680e8e04a27705a86fcd16de))
* **components:** Add auto-scroll feature to CoinCreator form ([b016b08](https://tokenizedev///commit/b016b086527738a4a7a7bbdf72b62fb187c2cd32))
* **components:** Add functionality to update investment input value ([18a0d8d](https://tokenizedev///commit/18a0d8deed3f780670e6f9bc42e74162cdc70ebb))
* **contentScript:** Add bounce-in animation and update logo styling ([d314996](https://tokenizedev///commit/d314996a4304f0bf1c9562c86bc3dff958dfef27))
* **contentScript:** Add check to skip injection in input fields ([a2b9e5c](https://tokenizedev///commit/a2b9e5cc28f48d19b6c2e7c89e2ae615844e484f))
* **contentScript:** Add image extraction support for meta image selectors, picture elements, CSS background images, video poster images, SVG images, canvas elements, image inputs, special attributes, and JSON-LD structured data ([a56b3f7](https://tokenizedev///commit/a56b3f7680d27403d14287a36e80d71412026f07))
* **contentScript:** Add menu for TKNZ Actions ([627f744](https://tokenizedev///commit/627f744020d5c68591bd48c509178f5259cfd28b))
* **contentScript:** Update selection mode to include images for direct selection ([279d4f8](https://tokenizedev///commit/279d4f88fe5aa308141adb90932e2adf95111a20))
* **services:** add new function to search for token asset by query string ([ebc7aeb](https://tokenizedev///commit/ebc7aeb6d553e593fd98cb971710b2935ce5d23a))
* **settings:** Add domain blocklist feature and global buy button toggle ([3562770](https://tokenizedev///commit/3562770f5e3a905fb4500599a4180f589f507f15))

## [0.15.1](https://tokenizedev///compare/v0.15.0...v0.15.1) (2025-05-21)


### Features

* **App:** Add success sound effect when creating glitch effect ([9f43193](https://tokenizedev///commit/9f431937f03e7faffe09fe89dd7aca2acef710e0))
* **App:** pre-populate options for SDK token creation and store them locally ([616ce51](https://tokenizedev///commit/616ce51a71f697696ea07f02d95d8cd6c5dc9b5d))
* **README:** Added 'SDK Token Creation API' section and 'Code of Conduct' section ([d3ec8d3](https://tokenizedev///commit/d3ec8d3e55620597f1ba097666506ce580fabe14))


### Bug Fixes

* **components:** insufficientFundsModal - remove hardcoded value and use var ([1e8fac5](https://tokenizedev///commit/1e8fac5682ee074805dd7e14107bd0c252d915f7))

## [0.15.0](https://tokenizedev///compare/v0.14.0...v0.15.0) (2025-05-21)


### ⚠ BREAKING CHANGES

* **background:** The behavior of displaying the swap page has been modified to align with the context flag. Users may experience differences in UI presentation.
* **contentScript:** Removed console logs for initializing and initialized messages.
* **background:** Revised the flow for displaying the swap page based on the side panel state. This may affect current behavior related to showing content in sidebar contexts.
* **contentScript:** Existing notification system has been replaced with a more robust and visually appealing system.
* **content script:** This feature may affect existing custom positioning of the button, especially if relying on specific CSS styles like left, right
* **components:** - Updated the 'activeSection' state in SettingsPage to include a new value 'scan' to support page scanning feature.
* **components:** This feature introduces a new button for manual scan triggering, providing users with more control over the scanning process.
* **contentScript:** Updated network tracking for improved performance

### Features

* Add ability to resolve token address by symbol in background service(worker) ([f27aa50](https://tokenizedev///commit/f27aa5097d91a81e6bec985d2b34a72bdd32abb8))
* Add toggle feature for floating scan button ([64bbd1b](https://tokenizedev///commit/64bbd1b75603f58671bf908fbd961ef940e7703e))
* **App:** add SDK token creation options and populate creating form with SDK options ([fa59be4](https://tokenizedev///commit/fa59be4511acc99a8ef5fc0b36e20580f0be16c5))
* **App:** pre-populate form fields and navigate to create view for SDK token create init ([5a5ad58](https://tokenizedev///commit/5a5ad582c492c762decbaaf8dcf71b037874fa64))
* **background:** add check for sidebar context in content script ([4b952e3](https://tokenizedev///commit/4b952e3e32561e2996eb3d7b7bbda42b0f730d39))
* **background:** Add functions for validating coin creation payload and trigger ([e0f8fba](https://tokenizedev///commit/e0f8fbafa37c717ebe727581d515bc7b960bf5f1))
* **background:** add logic for showing swap page in correct context ([622ee60](https://tokenizedev///commit/622ee604ca98fcf7623d5a38766d7b6aa08e7474))
* **background:** Add logic to check side panel state before showing swap page ([379e681](https://tokenizedev///commit/379e6817b2d8f769b7c59c49d48ebd6e0a5e02c3))
* **background:** implement asynchronous token click handler ([d88bdd3](https://tokenizedev///commit/d88bdd398d4787239323e6f7d88dbd0799587b52))
* **background:** improve handling of UI context flag ([aa84056](https://tokenizedev///commit/aa84056f2af0fcf8a67754e515c61139eb2ba75c))
* **components:** Add functionality to pre-populate form fields with initial token creation parameters ([b439804](https://tokenizedev///commit/b43980405c75ccfa91579dc146008e89988b7c7f))
* **components:** Add manual page scanning feature ([bfabe6e](https://tokenizedev///commit/bfabe6e1233184d9b684851a5fc8080e2fe31193))
* **components:** add manual scan trigger button ([dd4e211](https://tokenizedev///commit/dd4e2113951d00a04a5276a3ecbb84b760d8d7c7))
* **components:** add sdkOptions prop to CoinCreator ([d2e683d](https://tokenizedev///commit/d2e683d9b872b261010394099d0df406b3eafba7))
* **components:** Add Token Detection feature and settings ([d54289e](https://tokenizedev///commit/d54289e040cc57d73c5771d332d4dfe655f0897a))
* **components:** retrieve settings individually from storage ([65f527e](https://tokenizedev///commit/65f527ebf893d18bd759707a849e6c2739844454))
* **content script:** Add functionality to reposition button off-screen when needed ([e682187](https://tokenizedev///commit/e682187d8ef0eac051e72da595dcc80652c73e46))
* **content script:** Add temporary hiding and restoring of buy buttons ([473cbc5](https://tokenizedev///commit/473cbc51c835321a311919013e78892b26622cef))
* **contentScript:** add event listener for message and sendMessage for INIT_TOKEN_CREATE and INJECT_SDK ([2163491](https://tokenizedev///commit/2163491cc478c8428641503faa0b9ebebbfcd278))
* **contentScript:** add floating scan button feature ([478a089](https://tokenizedev///commit/478a089a70d521c28e0c9e6f35d9480af45d640e))
* **contentScript:** add network idle detection for content load ([68b53a1](https://tokenizedev///commit/68b53a1d991a2382a8d228374a87442a02eb7804))
* **contentScript:** Add notification system for content script ([1c8381c](https://tokenizedev///commit/1c8381c37c45b2829759e345353505b5afdb8885))
* **contentScript:** add smooth gliding and inertia for draggable button ([2433f74](https://tokenizedev///commit/2433f744b409fc1008095cee41639fc39510c17c))
* **contentScript:** improve tweet data extraction and visibility ([602d57a](https://tokenizedev///commit/602d57a0687902559dd79c36a7dc0f62290ad72d))
* Listen for manual scan trigger from extension UI ([0fcb10e](https://tokenizedev///commit/0fcb10e07169e5e3a3197dd70f3cc709593b1a35))
* **services:** add validation switch setting and condition to skip token validation ([0c3be26](https://tokenizedev///commit/0c3be262e76df38245f44e8aafe79521167cbaa4))
* **settings:** Add token validation feature toggle ([9c97989](https://tokenizedev///commit/9c97989dbfae78b0ae5b65b82bca9477c879e754))
* **store:** Add initialTokenCreateParams and functions to set and clear initial token creation parameters ([#123](https://tokenizedev//null/issues/123)) ([1e0d102](https://tokenizedev///commit/1e0d102676409a15be579fe7c80964ec40e05557))
* **SwapPage:** Remove manual scan button and FaSync icon ([9babb17](https://tokenizedev///commit/9babb1786d919d19dad2d71d9a241e812bfdc2eb))
* **types:** Add initialTokenCreateParams, setInitialTokenCreateParams, and clearInitialTokenCreateParams to WalletState ([58833d4](https://tokenizedev///commit/58833d4f00cadc3304d9597fe7c31aa089a1e0cc))


### Bug Fixes

* **components:** Fix initialToMint handling and token selection logic ([b118f93](https://tokenizedev///commit/b118f932c6b3a18c25689706f953a4c4fa07f9a1))
* **components:** remove unused import and constant declaration ([62c8651](https://tokenizedev///commit/62c86512f10c5d7765234bfab81c1bd357a29670))
* **components:** update PUMP_FEE to 0.03 to calculate required balance accurately ([ee94d88](https://tokenizedev///commit/ee94d880e0171ea29dea78c721b4cd03ba17560c))

## [0.14.0](https://tokenizedev///compare/v0.13.2...v0.14.0) (2025-05-20)


### ⚠ BREAKING CHANGES

* **components:** This update changes the behavior of initial token selection in the SwapPage component to provide more flexibility
* **swap:** This change affects the behavior of initial token selection and warning messages in the SwapPage component. Unsupported tokens will no longer be automatically selected, and users will be notified of blocked or unsupported tokens with warning messages.
* **components:** CSS classes for blocklist and allowlist containers have been updated.
* **components:** The TokenCreationProgress component now includes a new TypewriterText component and logic for displaying simulated log entries to enhance the user experience.
* **components:** Removed duplicate declaration of refreshPortfolioData
This change adds a new feature to the CoinCreator component, introducing breaking changes by removing duplicate code.

### Features

* Add focus highlight animation for deploy button in index.css ([4fc8e98](https://tokenizedev///commit/4fc8e9886aece872bc5d1ae52b7636ef6af340b4))
* Add visual effects and enhancements to TerminalLoader component ([e8a94bb](https://tokenizedev///commit/e8a94bb1688c8b2fde31e4bc0a5aff4be02ec8df))
* **App:** Add error notification on coin creation failure ([4e89e7e](https://tokenizedev///commit/4e89e7eebab853cb323fc48384f5debe27ddea60))
* **App:** introduce new dramatic success effect with creation success states 'glitch' and 'fade' ([7b96b16](https://tokenizedev///commit/7b96b160deb1bfbad79ef48cc3b6c2ca463c9a64))
* **CoinCreator:** Add ref for preview container and deploy button, update handlePreview function for improved scrolling and button focus behavior ([76a81da](https://tokenizedev///commit/76a81da7b8ba39a8a0540d3fcd979388001a1e15))
* **components:** Add ability to handle confirmation process in CoinCreator ([7f08034](https://tokenizedev///commit/7f08034a81b8fbaefa6b2ad8b41986d7bf4737c2))
* **components:** Add blacklist and whitelist management to SettingsPage ([2127d57](https://tokenizedev///commit/2127d5786603b78c9ac8c3edf8518778a963990f))
* **components:** Add constant for pump fee in CoinCreator ([e653c8c](https://tokenizedev///commit/e653c8c61434a1a68978163128f3da0cdb2a0f0e))
* **components:** Add detailed error handling and log extraction in handleConfirm ([be4bbc8](https://tokenizedev///commit/be4bbc82cd725a2aaa67add0f57711b4702b8b1b))
* **components:** Add functionality to handle the Preview Confirm button click ([d0aa47c](https://tokenizedev///commit/d0aa47cdfd728481b5c771e2d8f487493e8233bf))
* **components:** Add functionality to manage blocklist and allowlist CA entries ([6c18207](https://tokenizedev///commit/6c1820756730bca8a7f93d300166a8a7444b39ea))
* **components:** Add preview token creation functionality ([c917f4b](https://tokenizedev///commit/c917f4bcc7289da9b8eae9015b824e65a4b357bd))
* **components:** Add VersionBadgeProps and LoaderProps to CoinCreator component ([94825f9](https://tokenizedev///commit/94825f9ea21cac0b36680296589289fca95f3579))
* **components:** allow address or symbol selection for initial tokens ([c3b652c](https://tokenizedev///commit/c3b652c37b46597a48e1dfeaf36d578fe7d7dc8d))
* **components:** enhance TokenCreationProgress component with typewriter effect and simulated log entries ([8a5093e](https://tokenizedev///commit/8a5093eb62add77934c903c201708f4bacf696a8))
* **components:** improve scrolling behavior in SettingsPage ([f6c5d2f](https://tokenizedev///commit/f6c5d2fe7071c1d27266b1e302a5deb8442f0348))
* **components:** Improve user experience with updated text and balance calculation ([80ea259](https://tokenizedev///commit/80ea25928d351565c37fe508952e10d13f5f91ff))
* **components:** update button and loader text in CoinCreator component ([4aed451](https://tokenizedev///commit/4aed45154db6c2a0ab240a5790a6f10be13d679f))
* **components:** Update CoinCreator preview display fields ([9a2d56c](https://tokenizedev///commit/9a2d56c29579a9f3c41c27d8df89868d0e7fde30))
* **components:** update createCoin method to createCoinRemote ([1beb5b4](https://tokenizedev///commit/1beb5b4bea98d16cdbfa8daee4f2db9dcb9fe754))
* **components:** Update fee display format in CoinCreator component ([472dd0f](https://tokenizedev///commit/472dd0f1c447cd07deb1429d71dca5f8ad09aa48))
* Improve coin creation process by allowing parent component to handle creation start; fallback to default behavior if no parent handler provided ([84b7ba6](https://tokenizedev///commit/84b7ba63cec080a485918a0ee6bdfa73e317e7f0))
* **services:** Add validation service for filtering created coins based on various criteria ([d22694e](https://tokenizedev///commit/d22694ecb15d8dd4277d687aea4729c7dc4fe1df))
* **services:** Implement Helius service for fetching token data ([3ca59ec](https://tokenizedev///commit/3ca59ec0915faf78b5a3b88868012df195b3ef8d))
* **settings:** update naming convention for blacklist and whitelist ([77cd66f](https://tokenizedev///commit/77cd66f72d980b863b46232f34a051c9ccf59671))
* **src:** Add terminal-specific animations for token creation ([b2228c8](https://tokenizedev///commit/b2228c8502b5c124a3d5900f028daef8ddeced0f))
* **store:** add remote coin creation feature ([8e96b14](https://tokenizedev///commit/8e96b146ecdb364e99ec8281ca5a8f53db022d43))
* **store:** implement token creation with raw signed versioned transaction ([3f8b48d](https://tokenizedev///commit/3f8b48d9f990f5ef5707f8d397d25326a8fc0dd9))
* **store:** store additional preview details including pumpFeeAmount and totalCost ([b7e5da1](https://tokenizedev///commit/b7e5da1347f94eb7baa36fe47f9d950931301d35))
* **swap:** Implement initial token selection handling ([881b534](https://tokenizedev///commit/881b534a61fbee32b92bd8de0a84f05535347972))
* **types:** add detailed previewData for token creation ([479746b](https://tokenizedev///commit/479746bf1ee9d6f40630d80dcb8048b10085bd29))
* **wallet:** add createCoinRemote method for creating coins remotely ([110930f](https://tokenizedev///commit/110930fb0d150ae4db8e6e885fb4f82d6511ed94))
* **wallet:** add token creation preview functionality ([9544a02](https://tokenizedev///commit/9544a0274ccb7ee5e5189be9297b5495578fd475))


### Bug Fixes

* add check for chrome.storage API availability ([a952317](https://tokenizedev///commit/a9523174f12c2a0d7cdcc44582f8fa336e48bcdb))
* add missing avatar field when initializing wallets ([53f3291](https://tokenizedev///commit/53f32915b0eefef6be2b01c54e6f03270a6bca5a))
* **components:** Update required balance calculation in CoinCreator ([dcbf088](https://tokenizedev///commit/dcbf08833032cef56e370cfd9d9258f9c5f4c49f))
* Rename parameters 'whitelist' and 'blacklist' to 'allowlist' and 'blocklist' in validateToken function ([01fe746](https://tokenizedev///commit/01fe7462064aae678b3f20bc94837a3a34505f68))

## [0.13.2](https://tokenizedev///compare/v0.13.1...v0.13.2) (2025-05-15)


### Features

* **components:** Update WalletOverview component layout for better token display ([4672126](https://tokenizedev///commit/4672126b75665f710b862be943ce8aa4acf47bfa))


### Bug Fixes

* **components:** Adjust layout of VersionBadge in CoinCreator component ([a411ac0](https://tokenizedev///commit/a411ac0586cac9a3406aef7eab940486e004a158))

## [0.13.1](https://tokenizedev///compare/v0.13.0...v0.13.1) (2025-05-15)


### Features

* **App:** Persist UI mode for content script to detect sidePanel vs popup ([53f9a17](https://tokenizedev///commit/53f9a17eab5cbd3b72bf434fc895331711106793))
* **background:** Add support for tracking side panel visibility per window ([8d335cb](https://tokenizedev///commit/8d335cb7dc1abfa4f0f994eb7c6add96429d49c9))
* **components:** add copy wallet address functionality ([b9343f1](https://tokenizedev///commit/b9343f1615204b3fc8d20648d139a7e3cab6f4b0))
* **components:** add message about changes taking effect after page refresh ([a981e58](https://tokenizedev///commit/a981e58dd0f11d474ae811e3d38ea8b1668fa3de))
* **components:** add retry shake animation effect ([1f3b96a](https://tokenizedev///commit/1f3b96abf2ba62647d6bac9dbc9ea8f19118575e))
* **components:** log token swap event to Firestore ([077c1e9](https://tokenizedev///commit/077c1e912c6d600dda3a517c2c5f1a146552a21f))
* **contentScript:** add 'marginRight' style to buy buttons ([0047c1e](https://tokenizedev///commit/0047c1e4e21a317cabccd37ffff2532dd31a4a54))
* **contentScript:** add toggleable buy buttons feature ([7b1212c](https://tokenizedev///commit/7b1212c56ca89ac3f4db8da0bab7ad55cf815939))
* **contentScript:** Notify background of selected content and UI context ([06d88f4](https://tokenizedev///commit/06d88f4139695f282c148f497bd41c6b24763fea))
* **SettingsPage:** Add Buy Button Feature ([392b1c1](https://tokenizedev///commit/392b1c15b372c43c2611d68fc9fee038b734d9d2)), closes [#123](https://tokenizedev///issues/123)
* **swap:** Add helper function to show truncated contract address ([5c95e18](https://tokenizedev///commit/5c95e182ed9317913796d67a77497dff3ec86071))
* **SwapPage:** Add useMemo for uniqueTokens and uiTokens creation ([a30bfb0](https://tokenizedev///commit/a30bfb098353af9384f86f1a8f82374bcdf87c1b))

## [0.13.0](https://tokenizedev///compare/v0.12.2...v0.13.0) (2025-05-14)


### ⚠ BREAKING CHANGES

* **components:** The behavior of selecting initialToMint token has been enhanced to handle both address and symbol lookup.

### Features

* Add functionality to handle token buy button clicks from content script ([610f3cc](https://tokenizedev///commit/610f3ccb79cb231a8d1c9d62a2a6655c4e5d2bc8))
* Add functionality to handle token buy requests and show swap modal ([8c6ef3f](https://tokenizedev///commit/8c6ef3fec74ae3796aa3ea08d8c95fc0f054d651))
* **ci:** update Node.js version to '23' and set cache to 'yarn' ([b3e90a0](https://tokenizedev///commit/b3e90a0ddd6fcfdec809af0f8b8657cc8a3436b6))
* **components:** Add functionality to refresh portfolio data ([f3009b3](https://tokenizedev///commit/f3009b320aa92d0285c94c2641d14953425e8640))
* **components:** add tryAgain functionality to InsufficientFundsModal component ([21754a5](https://tokenizedev///commit/21754a5a24c1d6e0450f54c2b01d63c1f0aa7d74))
* **components:** improve initialToMint token selection logic ([e713dfe](https://tokenizedev///commit/e713dfe35e88dd321f2f2e09c5b59b3ea3bc1008))
* **contentScript:** add periodic full DOM scan for Buy buttons every 5s ([25153cf](https://tokenizedev///commit/25153cfdc57361949c11af51618a10098bcc4cf9))
* **contentScript:** Add state for tracking injected buttons and always scan for tokens ([f8bb85f](https://tokenizedev///commit/f8bb85fdabb88c3769fa0ffabb9d5a6b8c6ba432))
* **contentScript:** introduce Token Buy Feature ([d2b7391](https://tokenizedev///commit/d2b7391149f9a8420c8969de3113c773fdcb1dbb))
* **contentScript:** observe dynamic content and inject buy buttons ([f2fa671](https://tokenizedev///commit/f2fa671afbf6acc77b308b88b1abadf1c30294aa))

## [0.12.2](https://tokenizedev///compare/v0.12.1...v0.12.2) (2025-05-14)


### Features

* **SwapPage:** add handling for gas estimation and fee calculation on max button click ([009c359](https://tokenizedev///commit/009c3599dd458365a4ea21d4ac9dfc117ddf9549))

## [0.12.1](https://tokenizedev///compare/v0.12.0...v0.12.1) (2025-05-14)


### Features

* **SendTokenModal:** Add ability to calculate and set MAX amount including estimated fee for native SOL ([a113f42](https://tokenizedev///commit/a113f42b91aa8841d2a7fcb14bf1717c57a3f30c))

## [0.12.0](https://tokenizedev///compare/v0.11.3...v0.12.0) (2025-05-13)


### ⚠ BREAKING CHANGES

* **components:** Updated state type for `tokens` in `useStore` hook to include a `pendingOnJupiter` flag for pending tokens. This may affect components relying on the

### Features

* **App:** Add the ability to swap to a specific token ([a3b4967](https://tokenizedev///commit/a3b49673a08d09942a29b3c35c42f7f29eb65cb3))
* **components:** Add support for initialToMint selection ([25901f4](https://tokenizedev///commit/25901f4b18d09be0c0c32bc3fe48d15dca4b9a63))
* **components:** add support for locally created tokens ([43ff7b6](https://tokenizedev///commit/43ff7b67a34ac38bbacceb768409fb5a8bb9c53a))


### Bug Fixes

* **components:** update tooltip text for Jupiter trading support ([484628f](https://tokenizedev///commit/484628f6fc1df6490207f156bfe09209fc92dbf1))

## [0.11.3](https://tokenizedev///compare/v0.11.2...v0.11.3) (2025-05-13)


### Features

* **tokenService:** updated decimals to 6 and added extensions field ([a5d8225](https://tokenizedev///commit/a5d8225a240d7eeb7ff1f6ed40a24fb575ad65c1))

## [0.11.2](https://tokenizedev///compare/v0.11.1...v0.11.2) (2025-05-13)


### Features

* **App:** add 'onSwapToken' prop to 'CreatedCoinsPage' and 'MyCreatedCoinsPage' components ([a06a200](https://tokenizedev///commit/a06a200ec222fcf22c4e35402ebd3f9a05fdda9e))
* **CreatedCoinsPage:** Add ability to swap tokens ([975d5ec](https://tokenizedev///commit/975d5ec5a756e3d611ea614205789a2608d5509f))
* **MyCreatedCoinsPage:** Add onSwapToken prop for swapping token functionality ([81f062a](https://tokenizedev///commit/81f062a3aed803ce714282862cc7f493d10e4ebf))

## [0.11.1](https://tokenizedev///compare/v0.11.0...v0.11.1) (2025-05-13)


### Features

* **App:** enhance notification handling for transaction statuses ([1f817bb](https://tokenizedev///commit/1f817bb70675e7da1c76d7fc248f10ab40b73b3b))

## [0.11.0](https://tokenizedev///compare/v0.10.1...v0.11.0) (2025-05-13)


### ⚠ BREAKING CHANGES

* **store:** The method for fetching token prices has been updated and enhanced, including the introduction of new parameters and API requests.

### Features

* Add functionality to seed token database on startup using loadVerifiedTokens from tokenService ([8197a06](https://tokenizedev///commit/8197a06a3ba99e1dbd60321b524e7e6da1bf87ee))
* Add support for handling pending transactions and notifications in App component ([be6e28f](https://tokenizedev///commit/be6e28f0ca3d58cd4931412244cbb5cf6e17d038))
* **components/swap:** Add default tokens to TokenList ([c365518](https://tokenizedev///commit/c3655185a78de2966e1376d5077e9242f36aa821))
* **components:** add fallback token lookup for initialMint ([a81fc95](https://tokenizedev///commit/a81fc954e8265faec723227a779f431c5cf3e8dd))
* **package.json:** add rxdb and rxjs dependencies ([8343818](https://tokenizedev///commit/83438185f1e0d0cef98b516176c4ac94083a4188))
* **services:** implement simple in-memory caching for price data ([7cf1617](https://tokenizedev///commit/7cf1617db2742b1e40ba05667152022255af5f66))
* **services:** normalize token data before bulk insertion ([31db9b7](https://tokenizedev///commit/31db9b71a08cb03bb0371afd9127de555d817f41))
* **store:** Add function to fetch USD price for SPL tokens or SOL ([dde1b3a](https://tokenizedev///commit/dde1b3a55c90394529c129ba1249f95b0cd65225))
* **store:** modify sendToken function to return signature immediately ([69b4975](https://tokenizedev///commit/69b4975141f65e5f4e2ee1831f489554090e5137))
* **swap:** Add memoization to improve TokenList performance ([b042cc7](https://tokenizedev///commit/b042cc7c466af2da0b9d922ef72f6cb4986d354d))
* **swap:** Add token info fallback for missing local matches ([3123c0e](https://tokenizedev///commit/3123c0e6b370d2637ac63687d87117ef33277394))
* **SwapPage:** Refactor token loading to use cached tokens and merge with platform coins ([4bd34b5](https://tokenizedev///commit/4bd34b5fa7763c39ee9f0f172d07c378221c01fb))
* **tokenDb:** introduce logging for database creation and collection addition ([f16c36a](https://tokenizedev///commit/f16c36a1f39351f6c8e487e120d23ed401eacef1))
* **tokenService:** add logging statements and metadata patching ([a382a34](https://tokenizedev///commit/a382a3413ee3063a9454721d820874b4de4d7d19))
* **tokens:** implement token datasources services ([16f076e](https://tokenizedev///commit/16f076e0f3b859e7c1a2b87ebec40e64c26ff137))


### Bug Fixes

* **database:** Update Z-Schema validation comment in tokenDb service ([957e553](https://tokenizedev///commit/957e55305836efa7b1b55081c437eb46e39fa204))

## [0.10.1](https://tokenizedev///compare/v0.10.0...v0.10.1) (2025-05-13)


### Features

* **components:** add 'isSuccess' state to track success in SendTokenModal ([5a13dc8](https://tokenizedev///commit/5a13dc852533310483d95b72ca22ea64d9d0e9f0))
* **components:** add support for displaying token symbol in SendTokenModal ([4f357ad](https://tokenizedev///commit/4f357ad439b227bdfe139ffe6fb5af91c10cbd36))
* **components:** add useMemo hook and address book functionality in SendTokenModal ([0226479](https://tokenizedev///commit/02264797eec19f1bf1976dc8c8a07b8d71eacd7d))
* **components:** update button alignment in BalanceDisplay ([1cc68ff](https://tokenizedev///commit/1cc68ffbdb51c486543677f20acce5b0db52a012))
* **store:** add address book functionality ([afd5dd8](https://tokenizedev///commit/afd5dd8a786fe7fb734d98bb291b161517ec01d7))
* **types:** Add address book functionality with addAddressBookEntry and removeAddressBookEntry methods ([cfb1cd5](https://tokenizedev///commit/cfb1cd588c39f9375b0aea3f5075d2cd251b70f9))

## [0.10.0](https://tokenizedev///compare/v0.9.0...v0.10.0) (2025-05-13)


### ⚠ BREAKING CHANGES

* **components:** The addCreatedCoin function has been removed from CoinCreator component. Users relying on this function need to update their usage to accommodate the changes.
* **store:** This introduces a new field 'balance' to the WalletState interface. Users relying on the previous structure will need to update their code accordingly.

### Features

* Add polyfills for improved browser compatibility ([cb45667](https://tokenizedev///commit/cb456677b3018265421038256321f41b756d689c))
* **App:** add more descriptive event listeners for CoinCreator component ([612c4df](https://tokenizedev///commit/612c4df9a6f6642654ae8657e3558a20a5025a51))
* **components:** update CoinCreator component to remove addCreatedCoin function ([176face](https://tokenizedev///commit/176face72028ae6b27c337cfd891f00c989dd830))
* **components:** Update CoinCreator to use nativeSolBalance instead of balance in useStore ([1c16ad1](https://tokenizedev///commit/1c16ad1f5df251efce03480ae84336b096b16a59))
* **store:** Add balance field to WalletState ([081c06b](https://tokenizedev///commit/081c06bd818bd471103db44e53c26a7b6ceeeeb0))

## [0.9.0](https://tokenizedev///compare/v0.8.0...v0.9.0) (2025-05-13)


### ⚠ BREAKING CHANGES

* **components:** This update adds a new prop 'usdValue' to the BalanceDisplay component, which may affect existing implementations that rely solely on the balance prop.

### Features

* Add usdBalance field to WalletState in types.ts ([9019346](https://tokenizedev///commit/90193468acfd38a04fc78df8523453158ccde39f))
* **components:** Add AlertTriangle icon to lucide-react library ([ecc74de](https://tokenizedev///commit/ecc74de8f2f9b41f9ff0aec454d132541c05eeab))
* **components:** add optional USD value display in BalanceDisplay component ([867ef04](https://tokenizedev///commit/867ef041f815fdef73a4178d2d9326dd7086b263))
* **components:** Update WalletOverview component to use totalPortfolioUsdValue ([871b55d](https://tokenizedev///commit/871b55d8b20e29125375eb595437db32fe22d8f0))
* **Navigation:** Add usdValue to BalanceDisplay component ([f46659b](https://tokenizedev///commit/f46659bea52b9e8ab7c4adae1197da8a1a3378c5))
* **Navigation:** Implement changes to use nativeSolBalance and totalPortfolioUsdValue from store ([5aba96d](https://tokenizedev///commit/5aba96d786f60dc13388b0592befd1ea0a012db5))
* **store:** Add TokenAmount to store imports ([d9f12bd](https://tokenizedev///commit/d9f12bd7fd59fe1c6b254404f30e24540da5fcad))
* **store:** add USD balance calculation using SOL price API ([1d9615f](https://tokenizedev///commit/1d9615ffe9b4bdc315968dff737c1963c77b262e))
* **types:** Add USD price and USD value fields to CreatedCoin interface ([3814120](https://tokenizedev///commit/38141201b16b3ff79c016f5debc8315d2259e661))

## [0.8.0](https://tokenizedev///compare/v0.7.1...v0.8.0) (2025-05-13)


### ⚠ BREAKING CHANGES

* **components:** Removed the old logo element and updated the layout in the Navigation component.

### Features

* Add BalanceDisplay component in Navigation component ([50ed2ea](https://tokenizedev///commit/50ed2ea2bc1462053a3674aefb303f532ece9ac8))
* Add settings page functionality and UI components ([d280be4](https://tokenizedev///commit/d280be4c167aada383a43865adaa257215fee47b))
* **balance-display:** implement balance display component ([2257de4](https://tokenizedev///commit/2257de45ed69e91424ad6e19b254d25fe46ad6dc))
* **components:** Add 'Wallets' button to BottomNavigation ([d7ab49a](https://tokenizedev///commit/d7ab49a79044a3e507e0a41fd4faa4575f90716a))
* **components:** add ArrowLeft icon to CreatedCoinsPage ([a58d17f](https://tokenizedev///commit/a58d17f6ca63eec2ea0ce5bcb1f4388f18cb1f7f))
* **components:** add Fingerprint icon to lucide-react component library ([f11effd](https://tokenizedev///commit/f11effd84ad42fc04a13f556773907431c5aaa60))
* **components:** Add wallet balance display and overview button in Navigation component ([657d7c5](https://tokenizedev///commit/657d7c5f0865bee61ccb88cc317ea1ca071ef101))
* **components:** Update BottomNavigation title and icon ([7aee642](https://tokenizedev///commit/7aee642543b7bd038e7f421b7979b1a04a45ace5))
* **components:** Update CoinCreator component styles ([402c5cd](https://tokenizedev///commit/402c5cdc2e9de29b5ba21a5894f1ae06c0de2fde))
* **components:** Update SwapPage component to use initialMint and onBack function ([a50a05e](https://tokenizedev///commit/a50a05e27bf062950ca30eb3b869dd7c3a524012))
* **MyCreatedCoinsPage:** Add back button functionality and update highlightCoin handling ([4281440](https://tokenizedev///commit/428144038be8dd200ca5607fe62253071aabd6eb))
* **navigation:** add `BottomNavigation` component ([6e71bd5](https://tokenizedev///commit/6e71bd504f735eb62c70372765106dec0de1bcc0))
* Reduce padding on WalletPageCyber component ([d5f0fe2](https://tokenizedev///commit/d5f0fe27bd0f8c22212c1ecdd5986c17eda5b1f2))
* **WalletOverview:** Add back button and update portfolio header ([4b7761e](https://tokenizedev///commit/4b7761e279c3a6b79a7c5336b0fd8ea64fde8a87))


### Bug Fixes

* **components:** Fix padding value in Loader component ([9abaaba](https://tokenizedev///commit/9abaaba58ca801eb9afaf15c33c340ffe6c10110))
* **components:** Fix wallet manager page layout padding issue ([1776ce1](https://tokenizedev///commit/1776ce1b86ca2b32f019d95feaf3c84393f507ec))

## [0.7.1](https://tokenizedev///compare/v0.7.0...v0.7.1) (2025-05-12)


### Features

* **assets:** add missing 128 ([104eddc](https://tokenizedev///commit/104eddcbb549219c5c7a376d95d0464f9aad152b))
* **components:** Improve formatting of token amounts and USD values in WalletOverview component ([0097910](https://tokenizedev///commit/009791055ff5a84991a5bdb2d0d6e45587c66d38))
* **store:** add optimistic updates and persist to storage ([29bd0e3](https://tokenizedev///commit/29bd0e3c3cc37c470870754ea3b00c2460663794))
* **tests:** mock firebase module in store.test.ts ([5cc776c](https://tokenizedev///commit/5cc776caf059d5aebecdf2a35b900bc994b81804))


### Bug Fixes

* Remove unnecessary .DS_Store file ([632a833](https://tokenizedev///commit/632a833bf1ac84b755cf7765816dedd8facc9b09))
* Update binary file assets/logo-01.xcf ([b24ee5f](https://tokenizedev///commit/b24ee5ff1249314214c6f598deb5a0af40cb57cd))
* **vite:** Exclude store tests from coverage report in Vite config ([d3c05f3](https://tokenizedev///commit/d3c05f3b9ea2cd24fdec83ff11cffa0f986c02a5))

## [0.7.0](https://tokenizedev///compare/v0.6.0...v0.7.0) (2025-05-11)


### ⚠ BREAKING CHANGES

* **components:** This commit introduces new visual effects and animations for the SwapPage component, enhancing the user experience.
* **components:** The layout of the wallet balance display has been updated for improved user experience.

### Features

* Add functionality to automatically close the modal after an error in sending tokens ([96d648c](https://tokenizedev///commit/96d648cfdee6dd4bc8043a0880ea568d6eaf83d6))
* Add functionality to send native SOL or SPL tokens to a recipient address ([5779c39](https://tokenizedev///commit/5779c39378a56155d14db6879fb98ad2787ecd03))
* **App:** add ability to send tokens and refresh balances ([43ea354](https://tokenizedev///commit/43ea35406011f4c2d96abc5a360ee6c513684b6d))
* **App:** Add functionality to toggle wallet overview view ([9f594fb](https://tokenizedev///commit/9f594fb3bf587257e52a470070916d3ea3069aff))
* **App:** add initialFromMint prop to SwapPage ([9f58a94](https://tokenizedev///commit/9f58a9465c0e3f74b30cb21af319dc551b546ece))
* **app:** Add lucide-react ExternalLink component for Solscan transaction view ([b455108](https://tokenizedev///commit/b45510883b8429e134602f2c9d1aa3f432714781))
* **app:** Add swapping and sending token functionality ([7825b5e](https://tokenizedev///commit/7825b5eb548542e4b550ed4dd4df1da8cfc4ec24))
* **assets:** new logos ([4c4d4db](https://tokenizedev///commit/4c4d4db9e55f2235ebc2807419874ac1a79f6cc7))
* **components:** Add ability to pre-select token using initialFromMint ([a23a4b9](https://tokenizedev///commit/a23a4b9de85b6ae26348ab4654968191f57bc566))
* **components:** add chart placeholder in WalletOverview ([cf0682b](https://tokenizedev///commit/cf0682b7109e880b280fab4412ddf538348bb5f6))
* **components:** add random dot background effect and custom animations ([ee832b1](https://tokenizedev///commit/ee832b1f436db69a75f1a1ca9147409de0cdfdf2))
* **components:** improve navigation layout and wallet balance display ([68a4148](https://tokenizedev///commit/68a4148633990d697b4c958a3d5b72a626d8481b))
* **components:** Update labels and button text in PasswordSetup component ([999760b](https://tokenizedev///commit/999760b415f1bfdfc4f97d1f4dd1b560fbc6f516))
* **deps:** update dependencies for @solana/buffer-layout-utils, @solana/codecs-core, @solana/codecs-data-structures, @solana/codecs-numbers, @solana/codecs-strings, @solana/codecs, @solana/errors, @solana/options, @solana/spl-token-group, @solana/spl-token-metadata, @solana/spl-token, @solana/web3.js, bigint-buffer, bignumber.js, chalk, commander ([0cf14ed](https://tokenizedev///commit/0cf14eda8ea4182298612a91136fa6248eab3feb))
* logo updates ([d585215](https://tokenizedev///commit/d5852155cf0d5dc7fde62a0d54cbfd17e0fbcada))
* **Navigation:** Add onViewOverview to navigate to wallet overview screen ([e4c4a6c](https://tokenizedev///commit/e4c4a6cce77ce6d4a03c67bbf99e88cab776c8fe))
* **package.json:** add @solana/spl-token v0.4.13 dependency ([c4c1518](https://tokenizedev///commit/c4c1518fcb42af9c92be16f8eba5c9d50980ee47))
* **send:** implement send functionality ([120378b](https://tokenizedev///commit/120378b792e144746e5c974fcd2633124a3a4359))
* **send:** onscreen send ([464a4e1](https://tokenizedev///commit/464a4e19b2722787cad6f6541420f68e10f7043f))
* **wallet-overview:** init wallet overview panel ([b6a5e6e](https://tokenizedev///commit/b6a5e6e46c75df790cbeddfb612244c34c80be6f))
* **wallet:** add functionality for swapping and sending tokens ([f8f861f](https://tokenizedev///commit/f8f861f686b71d9f724e02ab4d0e150619464318))
* **wallet:** Add useCallback and useMemo hooks for token loading ([6e69035](https://tokenizedev///commit/6e69035e454586bf38e8e5f03012ab426ebf0920))

## [0.6.0](https://tokenizedev///compare/v0.5.1...v0.6.0) (2025-05-10)


### ⚠ BREAKING CHANGES

* **components:** The width of the wallet drawer panel has been changed to 72px, which may affect the overall layout of the component. Please adjust any styling or layout accordingly.
* **services:** Removed the unused TOKEN_API_BASE constant from jupiterService.ts
* **SwapPage:** Updated token handling logic to include platform-wide created tokens from Firebase, replacing the previous approach of mapping created tokens from the store.
* **services:** The module now includes functions for retrieving token-related data via Jupiter Token API, introducing new functionalities and endpoints.
* **swap:** The token data structure has been updated to use the TokenOption interface, impacting token selection and balance display logic.
* **Navigation:** This change introduces a new feature for swapping tokens in the navigation component. Please update any relevant documentation or dependent components accordingly.
* **package.json:** This introduces a new watch script for building with nodemon.
* **styles:** Updated CSS animations for improved user experience and interaction. Make sure to review and adjust existing styles that may be impacted.
* **store:** The way private keys are parsed and validated has been updated. Users may need to adjust their input formats accordingly.
* **app:** - Removed previous wallet functionalities related to buy, sell, and send tokens
- Replaced with comprehensive wallet capabilities for improved user experience
* Updated roadmap implementation with features' completion statuses and deployment initiation. Check [here](roadmap-05-01-2025.md) for details.

### Features

* add .yarn-cache and .yarn-global to .gitignore ([003432d](https://tokenizedev///commit/003432d2a2581ab5f51196686b6dc17ec00a47da))
* Add 'buffer' alias to resolve in vite.config.ts ([53d7152](https://tokenizedev///commit/53d7152f95c695b8d7226858117b3eee9fe84c49))
* add bip39 package to dependencies ([332b665](https://tokenizedev///commit/332b6652c90793c3fbc4dcd9b70f36200a531e14))
* add Buffer dependency to package.json ([a06b878](https://tokenizedev///commit/a06b8786952f99cced71f5ba11c800d57620e736))
* Add configuration for affiliate referral fee on Jupiter Ultra swaps ([d3076ee](https://tokenizedev///commit/d3076eee98cd32f0df72e944086a16870aadd2e4))
* Add custom AI prompts and the ability to purchase tickers from x ([9353749](https://tokenizedev///commit/9353749f0c128b0d39570479521e428cefa2fd38))
* Add JUP_AG_API_KEY to .env.example file ([f613337](https://tokenizedev///commit/f6133372a6267844cdc21fb85689b8247eb18d8c))
* Add new text animations and styles ([bb456ba](https://tokenizedev///commit/bb456ba1bdc34d16b3255d850aa13cd927fe32e1))
* Add onViewMyCoins function to Navigation component ([e0b62a7](https://tokenizedev///commit/e0b62a70f27812d5aa1b209e16fbba1537813970))
* Add polyfills for better cross-browser compatibility ([65eb536](https://tokenizedev///commit/65eb536f754cdb19885fd0ac0f6bbcc7a048dcca))
* Add version number display in Navigation component ([27a02b4](https://tokenizedev///commit/27a02b455358b72293eb7891ef2ae640e52d0e07))
* Add VITE_AFFILIATE_FEE_BPS configuration option ([a3a66f7](https://tokenizedev///commit/a3a66f7a450f8b772f8b3762c924271f72eb1fc3))
* Add VITE_AFFILIATE_WALLET to .env.example ([9d98c2a](https://tokenizedev///commit/9d98c2a83759a06fcd5704be6a11aadc9560da26))
* Add wallet indicator and button for managing wallets in Navigation component ([64bd0df](https://tokenizedev///commit/64bd0dfb37cb8eea739a75db6e188ee8c13a8024))
* Add WalletDrawer component and useStore hook for wallet management ([a54ef77](https://tokenizedev///commit/a54ef77c7734d430112dc90a29e525cc5eed0178))
* Added TypeScript declaration for react-jdenticon to fix the error and refactored import wallet component into ImportWalletForm component ([151faed](https://tokenizedev///commit/151faed48b41712b6c15978e2cb24e48d9543380))
* **App:** Add 'My Created Coins' page and functionality for users ([5aa1e7c](https://tokenizedev///commit/5aa1e7cf0385e9f8b4854557311fbf3919f4eeb4))
* **App:** add ability to open wallet details view ([9886b65](https://tokenizedev///commit/9886b6530ab54f825ea726fbc63588b61b8dc4cf))
* **App:** add functionality to close the wallet drawer ([b6c584e](https://tokenizedev///commit/b6c584e6cbcd0ff1cb76223926d60f4a4ede408b))
* **App:** Add PrivacyPolicy feature and footer link ([4970532](https://tokenizedev///commit/4970532ede10a13eb37fee7ae61b68e5677c4f27))
* **App:** Add SwapPage component and toggle functionality ([ba245c3](https://tokenizedev///commit/ba245c3a48955314eeb8a10b710fd8748308f077))
* **app:** Added full wallet capability with password wall, wallet import, wallet update/create, wallet connect, and standard wallet connection ([0c05362](https://tokenizedev///commit/0c0536246f7d0dc35c74f0a9d62ef686aebac1a7)), closes [#1234](https://tokenizedev///issues/1234)
* **App:** Implement exclusive UI panel views ([10bb432](https://tokenizedev///commit/10bb432eaf2c6f55f52944376e4393333f88f64b))
* **coins-created:** add dedicated page for created coins ([8f85a31](https://tokenizedev///commit/8f85a31d05aa4d1ddaae9db5d3e0f21ac29a7862))
* **coins:** add my coins created page ([04deb70](https://tokenizedev///commit/04deb7058274a3dabe85dacd1ff8d278221d3059))
* **component:** add glitch effect and header decoration ([5795207](https://tokenizedev///commit/5795207cb6b665944f54baac84c25db40d8521f7))
* **components:** Add 'Upload' and 'Repeat' icons to lucide-react ([c251634](https://tokenizedev///commit/c2516346a5372e65ac233d66eb6f4e4617368ffd))
* **components:** add copy functionality and wallet drawer ([1c25f01](https://tokenizedev///commit/1c25f0199b6a0056c01c368f70ea159745fb8748))
* **components:** add declaration for react-jdenticon to fix type error ([dd4ffc0](https://tokenizedev///commit/dd4ffc089e286f46fd011aa87b93458010233da1))
* **components:** add encryption key setup and biometric authentication ([a625d06](https://tokenizedev///commit/a625d069bcf4a342fe5722dc452ae6f1c2c41369))
* **components:** Add functionality to close wallet drawer when other navigation items are clicked ([3cb6de3](https://tokenizedev///commit/3cb6de34b88d21f87088243db41f9c3a5ff99fb2))
* **components:** Add functionality to fetch and display detailed token information ([1a9a0b4](https://tokenizedev///commit/1a9a0b44f3af9cabfa967c473626d9c2edae631b))
* **components:** Add glitch effect and decorative security text ([d6927d4](https://tokenizedev///commit/d6927d41ae69930eeb72b4b307c26ed77c5dee22))
* **components:** Add helper function getUiBalance for retrieving UI balance for tokens ([094d551](https://tokenizedev///commit/094d551e869340334fce312c01fb2f5ceca0f935))
* **components:** add ImportWalletForm component ([a7d45fb](https://tokenizedev///commit/a7d45fbafbcb84f533124f08b0ff4e395aefac7c))
* **components:** Add leaderboard tokens to the token list ([6bf7b05](https://tokenizedev///commit/6bf7b0595745994d79613afef713baf118b19614))
* **components:** add logging for allTokensMints in SwapPage ([3df8f89](https://tokenizedev///commit/3df8f89768acd91c2b96cba149034eaf4f8fb262))
* **components:** add onViewWallet function to Navigation component ([d2e3050](https://tokenizedev///commit/d2e3050a7c4ff0845dd98783799c929f899c358c))
* **components:** add SYSTEM_TOKEN constant and refinement in token handling ([ded21e0](https://tokenizedev///commit/ded21e00b055a89b3fe41cffb0286103eef6fb35))
* **components:** Add Users icon to WalletIndicator component ([3312b72](https://tokenizedev///commit/3312b72bc12ca9a8a495b16e75081f5236e314e6))
* **components:** Add VersionBadge component to App screen ([b8eef42](https://tokenizedev///commit/b8eef4292a9247256d11dba029b494fea033aa7b))
* **components:** Add VersionBadge component to show the app version ([0701bad](https://tokenizedev///commit/0701bad5dcd9957dc057f192c3cfa8775ad93194))
* **components:** add VersionedTransaction import ([dd30850](https://tokenizedev///commit/dd30850640c34e9309f4b23cf9612886c12b7189))
* **components:** allow custom token addition and reordering ([f4c295d](https://tokenizedev///commit/f4c295d55c0a2726ea2640440e580c9dca9d53d2))
* **components:** enhance token fetching in SwapPage ([c2e7156](https://tokenizedev///commit/c2e71561f60961d1bb8c2192a287e71082bf1416))
* **components:** implement avatar update functionality ([7fa4f35](https://tokenizedev///commit/7fa4f358afa0cd48e1f77f366c18c3feacc3dfd8))
* **components:** implement helper function for getting UI balance ([4331bca](https://tokenizedev///commit/4331bcac5826d38c8e50188b45a859023e1f7378))
* **components:** Implement manual forward and reverse conversion using previewData rate ([d5f442d](https://tokenizedev///commit/d5f442d6253eecc459eb460151605b8c1eb51f58))
* **components:** improve display of wallet public key in WalletDrawer component ([a858fa8](https://tokenizedev///commit/a858fa8cd858be16742e40838d0a9c492268e5e2)), closes [#123](https://tokenizedev///issues/123)
* **components:** improve passkey retrieval in PasswordUnlock component ([b007b34](https://tokenizedev///commit/b007b343f50d46c715f4ad5e6bd260d127451bc5))
* **components:** improve wallet drawer layout and action buttons ([31563b5](https://tokenizedev///commit/31563b5bec05ae80ec75acfd2b5f76f412c51142))
* **components:** Introduce helper function getUiBalance for handling token balances ([f8f468f](https://tokenizedev///commit/f8f468fb998c6cac0d173e97789e384b96b6ef13))
* **components:** update CreatedCoinsPage to display all created coins ([e52eb91](https://tokenizedev///commit/e52eb91d892d15d8ac8b462b8f304f3170c8a4c3))
* **components:** update title to TKNZ VAULT UNLOCK in PasswordUnlock component ([0a6fd1b](https://tokenizedev///commit/0a6fd1b6b3b431d4e52d8c9a2637dbf247ae7f5d))
* **components:** update token property from 'logoUrl' to 'logoURI' ([8abb760](https://tokenizedev///commit/8abb76032457b5c5a756891fd78f87061d0215a7))
* **components:** Update WalletDrawer button styles ([c323f38](https://tokenizedev///commit/c323f389370b0a06f2ed0043429f9fb1bdc60ff3))
* **components:** Update WalletDrawer styling and add coin buttons ([cfcb327](https://tokenizedev///commit/cfcb327ada238993ed15676d5240dc7f0ee9d206))
* **dependencies:** update axios to version 1.9.0 and follow-redirects to version 1.15.9 ([300320f](https://tokenizedev///commit/300320f92bb1ed41fdf68d027d41da32dec25db8))
* **deps:** add Buffer@^0.0.0 ([1c5342d](https://tokenizedev///commit/1c5342d41bbf612d2198a215d54e01b4157ce953))
* **deps:** update "@noble/hashes" to v1.8.0 and add "bip39" v3.1.0 ([33d3d3c](https://tokenizedev///commit/33d3d3cdc3077985057a138eec9182753f31efda))
* **deps:** update canvas-renderer to v2.2.1 ([a5d19e3](https://tokenizedev///commit/a5d19e3234593c8cbdbe3958a8fa09cf1f748168))
* **deps:** update chokidar, debug, ignore-by-default, minimatch, pstree.remy, semver, simple-update-notifier, supports-color, touch, undefsafe, nodemon ([74aa4e2](https://tokenizedev///commit/74aa4e258138e36f30bda3df9a0d3cc975fb8376))
* **firebase:** add getAllCreatedCoins function to fetch all created coins from Firestore ([3a5c0f8](https://tokenizedev///commit/3a5c0f8b98462508dcbf1947492bd30d60076acc))
* Implement TKNZ Roadmap feature with completion status and deployment initiation. ([279b09a](https://tokenizedev///commit/279b09ae500e3f724452456af7a9892945ad8de1))
* **jupiter:** init jupiter service ([9af477b](https://tokenizedev///commit/9af477b0d0fcb57c8decafada4778b60113d157a))
* lots of updates ([5b3b9a6](https://tokenizedev///commit/5b3b9a69d63b63e50ad8ab49a54c2e2a6e3717c9))
* **manifest:** update icons path and add new icon sizes ([810cce0](https://tokenizedev///commit/810cce0445497777153ed01887fa7267b8dabfb0))
* **mnemonic-wallet:** add specific component for mnemonic wallet backup ui ([381b96a](https://tokenizedev///commit/381b96afb18a0e6a02f0f2aa93c9f0809cea8b8b))
* **Navigation:** Add SOL balance indicator without logo animation ([e6ede1a](https://tokenizedev///commit/e6ede1a64c70a1431b469f3c50147b13d0db7b32))
* **Navigation:** Add swap functionality with 'onSwap' handler and 'showSwap' prop ([772a1e3](https://tokenizedev///commit/772a1e3b60fff49d98d76819373f6ee8629a9902))
* **Navigation:** Remove version number display from header ([34099d1](https://tokenizedev///commit/34099d104c74c8363f9f9ba2ac627c5ccc36f112))
* **package.json:** add axios package	resolve [#1234](https://tokenizedev//null/issues/1234) ([fb0499e](https://tokenizedev///commit/fb0499ef505a9ef3cb6e49a6d2325c0baea67515))
* **package.json:** add react-jdenticon v1.4.0 to dependencies ([58b3cc6](https://tokenizedev///commit/58b3cc63379d59ecfd12835985bdb1bc0c3fd2eb))
* **package.json:** add watch:build script using nodemon ([04451cb](https://tokenizedev///commit/04451cb7c430cb2b8f958cf774df7ca193952bbc))
* **passwordUnlock:** add mnemonic recovery functionality ([c8c6019](https://tokenizedev///commit/c8c60196a7952b24fc5db0f54031e0cb06292d5f))
* **services:** add Jupiter Token API integration ([be8e04f](https://tokenizedev///commit/be8e04f6f8eeea301468154f4e12ae327746081d))
* **services:** add logging for retrieved tokens data ([babff22](https://tokenizedev///commit/babff2201a2d8b9ebb6061d0cba7cef1b5814b3b))
* **services:** enhance getOrder function to support affiliate account and fee configuration ([92dc091](https://tokenizedev///commit/92dc091fb33b5dbdb0605b80b47ee1f5bc34f68c))
* **services:** introduce new functions getOrder and executeOrder for interacting with Jupiter Ultra API ([0c51be0](https://tokenizedev///commit/0c51be07e8de591a28ad0d0a2d7b0673f88bdaa1))
* **sidebar:** add multiple icon sizes for better compatibility ([12f09d7](https://tokenizedev///commit/12f09d76cf3bded783bcb9572a3540b1c050f592))
* **store:** add ability to generate new wallet via mnemonic seed phrase ([6884423](https://tokenizedev///commit/6884423c6fbf091e408af32b4bbffb9855e14fad))
* **store:** add ability to update wallet avatar ([88d05f6](https://tokenizedev///commit/88d05f64f906a0d0406cb70affbb5c718a85de97))
* **store:** add function to derive seed from mnemonic using Web Crypto API ([cb20eec](https://tokenizedev///commit/cb20eecb476f5134e5a89b36b18f27718ba5eda2))
* **store:** add support for parsing JSON input, seed phrases, and raw private keys ([7c0b2c5](https://tokenizedev///commit/7c0b2c5da3c1570e77486073c7e87dafa1b02a80))
* **styles:** Add 'walletItemSlideIn' and 'cyber-pulse' animations ([507d7a0](https://tokenizedev///commit/507d7a03b36777e4ef8c357d639e023371a54699))
* **styles:** Add animations for progress bar, modal glitch effect, and slide up/down ([5f5aec2](https://tokenizedev///commit/5f5aec27f2508e514a601a63192e7144f2893e3f))
* **styles:** Add new CSS animations for better user interactions ([233ed51](https://tokenizedev///commit/233ed512ebb08962c30d8c70c9813131802adba7))
* **swap:** add 'decimals' field to TokenInfo interface ([ef2c982](https://tokenizedev///commit/ef2c982a0bad8e12cf199ee34947511a624a8919))
* **swap:** Add display for platform fee in SwapDetails component ([2eadec2](https://tokenizedev///commit/2eadec21cfd998648742f64eb4444bae645b888b))
* **swap:** Add Jupiter integration for real swap execution ([3cf783c](https://tokenizedev///commit/3cf783c9ba83cc1557682e2219cbd14c5d0d9997))
* **swap:** Add Jupiter order preview state and update order preview handling ([181ba85](https://tokenizedev///commit/181ba856bcb40e4775981f37610c27317964b6a6))
* **swap:** Add platformFee field to SwapConfirmation component ([d1385dc](https://tokenizedev///commit/d1385dca4d729f9d3e93d100d7a3800d2be67bbb))
* **swap:** Add token list and balance fetching functionality ([1471828](https://tokenizedev///commit/1471828e634756106b54e98947efed2017e09855))
* **swap:** Add USD price quotes and update UI amounts ([3d24635](https://tokenizedev///commit/3d246355db51343f705bb8289f8b653fa9007b7c))
* **SwapPage:** Add platform (referral) fee breakdown in basis points for order preview data ([2fc3100](https://tokenizedev///commit/2fc3100848b8613c1eb843a65bdb933932be050c))
* **SwapPage:** Add platform-wide created tokens from Firebase ([986541b](https://tokenizedev///commit/986541b6c32fa1314cfe7ef1389af5c80999d001))
* **SwapPage:** Add support for custom created tokens and merge them with existing tokens ([4b19718](https://tokenizedev///commit/4b197185e89baada40d7a9c993f8107d27c3f396))
* **SwapPage:** Add support for manual reverse conversion using Jupiter order preview ([d1721f6](https://tokenizedev///commit/d1721f682ec458b8ff03cb76f9cd5827bfd68c5e))
* **SwapPage:** Introduce fallback mechanism for affiliate fee basis points ([f43859c](https://tokenizedev///commit/f43859c5af429f0ab7207cd5d49730c0304bc6d3))
* **SwapPage:** Remove import of `PublicKey` from web3.js and update created_at field to a specific date ([45f2532](https://tokenizedev///commit/45f25329cfb1e193dd90cdaf3f37298c2710145e))
* **SwapPage:** Update token logo URLs on TokenSelector components and handle leaderboard token response with new structure ([5f6fd3c](https://tokenizedev///commit/5f6fd3cf55f9340cf8cfab4d908f397bd0aadf38))
* **swaps:** implement swaps ui ([177ed4f](https://tokenizedev///commit/177ed4f8fc044ca11cf0248173533b86ccfaec99))
* **tkz:** introduce a suite of features for creating and managing meme coins ([905fd9a](https://tokenizedev///commit/905fd9a9f9452936357ac88d29c2493e361226cc))
* **types:** add optional avatar field to WalletInfo interface ([dbafd17](https://tokenizedev///commit/dbafd1741ccf939c69702480bd49ab4800874bf8))
* **types:** Add walletAddress field to CreatedCoin interface ([c63be11](https://tokenizedev///commit/c63be11febc174546bc383c4966a1d34e71919f7))
* **types:** add WalletData interface ([eac0395](https://tokenizedev///commit/eac03950dfc2626421cd7606b69d0cd71080a636))
* Update dependencies versions and add new package "react-icons" ([3b73bca](https://tokenizedev///commit/3b73bca558f6ec5216b1ce6cf4a83a1a2fdacade))
* Update favicon links in index.html to support multiple sizes ([72598a2](https://tokenizedev///commit/72598a2a5a8a9c00fdd7e5407863ba70c7beb96d))
* Update manifest.json with new favicon images ([a7b24bb](https://tokenizedev///commit/a7b24bb69a9d65d41365fdc0928782e532f9b78e))
* update package versions in yarn.lock file ([396ee9f](https://tokenizedev///commit/396ee9f6f1a11e5a96d9015d59a3c807461f0148))
* Update project license to CC BY-NC 4.0 International ([75a58b2](https://tokenizedev///commit/75a58b25465475236985ddda76f37432122df680))
* Update transition to My Created Coins view in App component ([333206f](https://tokenizedev///commit/333206fc5f217d5ca70444d4a5d12a24e78047ac))
* **utils:** update production RPC endpoint URL ([f7692fa](https://tokenizedev///commit/f7692fa1a6ee7e78d0e158c8905062c245749819))
* **VersionBadge:** add glitch effect and random glitch animation ([23622b9](https://tokenizedev///commit/23622b9081a552c29463ad61b1263f2de7ca2d58))
* **wallet:** add ability to copy mnemonic ([8fa5c1a](https://tokenizedev///commit/8fa5c1a8ea043a30715d859e8b3ca769de9bf636))
* **wallet:** Add CreateWalletForm component and generateNewAvatar function ([2ecdbd9](https://tokenizedev///commit/2ecdbd9a0014b700b60774d8db607d0ca069b8d6))
* **wallet:** Add functionality to backup mnemonic for new wallet creation ([8bf6c46](https://tokenizedev///commit/8bf6c46f12355adb7ace25af9136a5f659c9174f))
* **wallet:** Add functionality to view wallet details ([0519194](https://tokenizedev///commit/0519194bb3b8321821ccc94acba0fe7a6dc209bb))
* **wallet:** Add Jdenticon support for user avatars in WalletIndicator ([0962dd1](https://tokenizedev///commit/0962dd19089f7c6c2e9f2561acb4ba8c4d73aa01))
* **wallet:** add onViewMyCoins function and buttons ([3b795c0](https://tokenizedev///commit/3b795c002cda7f8c0c31271cc15f96a32e68837d))
* **wallet:** add password firewall setup ([cbc8fdb](https://tokenizedev///commit/cbc8fdbf17ce99c72f183ba7f864664687230a43))
* **wallet:** add wallet drawer component ([9e1603e](https://tokenizedev///commit/9e1603e4a4b4dcf63f75bdfa7dd1c57e9ce85e7e))
* **wallet:** add Wallet import feature and enhance Wallet Connect functionality ([291e62c](https://tokenizedev///commit/291e62cdb8fc87657ba8ea6a35c7c16fda7a925a))
* **wallet:** allow users to set avatars for wallets ([62f905c](https://tokenizedev///commit/62f905cfc9285c65c60281b8ae91cf887b9fee17))
* **wallet:** enhance createNewWallet to return mnemonic ([74fbb44](https://tokenizedev///commit/74fbb4429b974cdf21a8790a45aa84f8995bc6ac))
* **wallet:** implement wallet unlock wall ([cf38fdf](https://tokenizedev///commit/cf38fdfcb69601b8e6f5f0d5867a4aa96e98fafe))
* **wallet:** import wallet ui updates ([51db921](https://tokenizedev///commit/51db9214c2d636b9f12d1381bb434d80970e844f))
* **WalletIndicator:** Add conditional rendering for wallet avatar and display styling changes ([da22af2](https://tokenizedev///commit/da22af2185446f806038b1757ccf1ee352ce2cca))
* **WalletIndicator:** support displaying avatar with Jdenticon if not present ([63e02c6](https://tokenizedev///commit/63e02c696980ff70fbb1cf8e52a8936d706fbe9e))
* **wallets:** add create wallet component ([fccb5dd](https://tokenizedev///commit/fccb5dd4bc2c7f8cd4909751ab6823183fae0f4b))
* **wallets:** implement multi-wallet support / wallet management ([1ac3130](https://tokenizedev///commit/1ac313071647cd22a8ce742c5925c9b06cb4b485))
* **wallet:** Update styling and add new features to WalletDrawer component ([d20aca2](https://tokenizedev///commit/d20aca20a19d0f8cd2f4efaebd984e76348f41bf))
* **wallet:** update WalletIndicator component to display wallet icon instead of user icon ([a1c36b7](https://tokenizedev///commit/a1c36b7f5bb8590fa09e0dba3830fe51f1e593fe))


### Bug Fixes

* **App:** remove unnecessary padding-top styling ([428a373](https://tokenizedev///commit/428a3731ca2c544df33c3afe4919b022597919fe))
* **build:** Update watch:build script to watch all nested directories ([bd7a62a](https://tokenizedev///commit/bd7a62ad40ed0975346c792fd1f061f2e0a0420d))
* **components/swap:** update TokenList logoUrl to logoURI ([be8eb22](https://tokenizedev///commit/be8eb22a0b76ef8ae405971291d62a93c528fb16))
* **components:** fix text in CoinCreator button ([994daf5](https://tokenizedev///commit/994daf54121ea98ee360e68eb6ec62bc55f08152))
* Remove redundant span element in WalletIndicator component ([4ba2e06](https://tokenizedev///commit/4ba2e0679308a65085116aa593b29d90c3912949))
* remove unnecessary .DS_Store file ([a6a6d1d](https://tokenizedev///commit/a6a6d1dcb03edca92061fd6d3e7d3049b41b4147))
* Remove unnecessary console logs in jupiterService.ts ([01c3267](https://tokenizedev///commit/01c3267bfba042b710efae857081e5272424c9c7))
* Remove unnecessary console.log and empty line in SwapPage component ([d598989](https://tokenizedev///commit/d598989ec88bfbe87e0adfc5ad38c15a2642e382))
* **store:** prevent creation of tokens with reserved symbol TKNZ ([f64ef49](https://tokenizedev///commit/f64ef497e5270c4fec594be1e908153d01a27438))
* **swap:** update token logo property name from logoUrl to logoURI in SwapConfirmation component ([1f7a1e8](https://tokenizedev///commit/1f7a1e8b14e669a30c9e592960815d4b15b5ba1d))
* Update avatar preview styling in ImportWalletForm ([d3812fc](https://tokenizedev///commit/d3812fc817a2e981cc0ed7d69b647c22bc79dc33))
* update logo file extension in README.md ([d050586](https://tokenizedev///commit/d05058680a63d768262252d2ad506f8203730725))
* Update VITE_JUPITER_API_KEY in .env.example file ([f19b245](https://tokenizedev///commit/f19b245230612fcce8be56fca27c22e952057f42))

## [0.5.1](https://tokenizedev///compare/v0.5.0...v0.5.1) (2025-05-05)


### Bug Fixes

* Reorder 'release' script commands in package.json ([9c71f61](https://tokenizedev///commit/9c71f614d6ec0d2e0e67a50bbab2f650750e2dc1))

## [0.5.0](https://tokenizedev///compare/v0.4.0...v0.5.0) (2025-05-05)


### ⚠ BREAKING CHANGES

* **background:** Updated behavior for side panel closed event to remove tab ID from status instead of opening popup

### Features

* Add functionality to notify background when side panel is open for the tab ([621c6cb](https://tokenizedev///commit/621c6cb840329b659a98c9469859b3dd7b51a58e))
* Add functionality to send message to tab when side panel is closed ([c2a7641](https://tokenizedev///commit/c2a76411e9ed4ea664fe19af5370b01c776edeeb))
* **background:** Add logging for side panel status and handle side panel closed event ([ba71bec](https://tokenizedev///commit/ba71becfb735e74949c3c432a7ad1d3fabd569a1))
* **background:** Track side panel status per tab and handle side panel ready notification ([#37](https://tokenizedev//null/issues/37)) ([ccb646b](https://tokenizedev///commit/ccb646b068176b6288615fc8a1d1a8c4c1e120a9))
* **components:** Add isSidebar parameter to START_SELECT_MODE message ([94278da](https://tokenizedev///commit/94278da260c2dc36b4d62d4f20b8d9e8b665dadc))
* **components:** add listener for selectedContent in local storage ([338a57f](https://tokenizedev///commit/338a57fa92c64e3bcd2c806ce6f1b84ab8dd3dd8))
* **contentScript:** add sidebar parameter to startSelectionMode function ([715ee24](https://tokenizedev///commit/715ee24e979f4ad00fcf9b45074f6526ccd4fcde))

## [0.4.0](https://tokenizedev///compare/v0.3.3...v0.4.0) (2025-05-05)


### ⚠ BREAKING CHANGES

* **WalletPageCyber:** Pagination functionality has been introduced in the Created Coins Section. Users will now see a limited number of coins per page, with navigation controls to move between pages.
* **store:** This feature introduces a new migration process for local coins to Firestore.
* **components:** The behavior of the 'CoinCreator' component has changed to include error handling for coin creation. Users implementing this component will need to pass a function to the 'onCreationStart' prop to handle the submission logic.
* **components:** The structure of the ArticleData interface has been updated to include a new 'images' property as an array of image URLs.
* **components:** This feature introduces a breaking change as it alters the behavior of the CoinCreator component by adding a new function for resetting form fields and state.
* **contentScript:** The function
* **contentScript:** This feature introduces a new behavior for selecting content in the content script.
* **components:** The `CoinCreator` component now includes a `TerminalLoading` component for better loading animation and progress visualization.

### Features

* Add dynamic class handling based on sidebar mode and pass the sidebar mode to App component ([c4030a4](https://tokenizedev///commit/c4030a4b0013ac795591ce24c9d89287e4cd17c2))
* Add Firebase Storage functionality and image upload capability ([4d5b758](https://tokenizedev///commit/4d5b7588b688bf9690488a8f30fe86c3dc5b34d5))
* Add fixed header and empty wallet drawer placeholders in Loader component ([02eff4a](https://tokenizedev///commit/02eff4a97ee7c17cec858ac5335088accf75d941))
* Add functionality to extract image and content based on website type ([246ec48](https://tokenizedev///commit/246ec4862b7d5f261cf37e2eda796ca39d3d11b6))
* Add JSON.stringify for selected content in chrome storage ([e215a91](https://tokenizedev///commit/e215a9135bd056abacdf4e0ba791a6e463e1ca7d))
* add VITE_ENV option to .env.example ([8d7974d](https://tokenizedev///commit/8d7974d68ea35df9d39b70453d695c9ab8cbe7b4))
* **App:** add CheckCircle icon to lucide-react imports ([493a26b](https://tokenizedev///commit/493a26bb9b8f8830acb73fe5b7c163aae1e75817))
* **App:** Add ChevronDown, ChevronUp, and Menu icons to lucide-react library ([2ff6151](https://tokenizedev///commit/2ff6151be066bb649b4b6ba7448fafa7081656df))
* **app:** add copy functionality for wallet address ([f33f7f5](https://tokenizedev///commit/f33f7f5cda4f6583ce85a32e185d6412f7f2716e))
* **App:** Add error handling for coin creation process ([e75a2b1](https://tokenizedev///commit/e75a2b1854a74147e5e88794eb723232fb395563))
* **App:** Add new features and animations for coin balance and leaderboard ([b7ff7cd](https://tokenizedev///commit/b7ff7cd410f00370d8b9f762acb3b7640fc92922))
* **App:** add new Wallet button with sequential animation ([3e9f99e](https://tokenizedev///commit/3e9f99ece2ad1fcfc02505051aacf764a8536424))
* **App:** Add sequential animations to display nav components ([fed83bc](https://tokenizedev///commit/fed83bc0b52b9d65f9a45c5bc537bab1df920f83))
* **App:** Add streamlined cyberpunk header with slide-down animation ([6d6b62a](https://tokenizedev///commit/6d6b62a15cc4d4d1833598e0085e4a81d717b603))
* **App:** implement new feature to toggle Leaderboard view ([635f8f2](https://tokenizedev///commit/635f8f2281915e8b0103ab7b7f31896f9700cfd3))
* **App:** Remove unnecessary Lucide icons and Leaderboard component ([#123](https://tokenizedev//null/issues/123)) ([4397afe](https://tokenizedev///commit/4397afe4c11a6a48d1f4aab98d7faa4d9e1cc758))
* **App:** update CoinCreator component to accept isSidebar prop ([06da7f8](https://tokenizedev///commit/06da7f8763062e12ea05f456ad9780fafc7e9c56))
* **App:** Update header design to include streamlined cyberpunk theme ([442fc21](https://tokenizedev///commit/442fc21ab8352988d0af3865d2041431ff7d8c25))
* **background:** enhance message handling and content injection ([733b281](https://tokenizedev///commit/733b28182af2e015a3867deb5a4ca01c5bf2e3d3))
* **CoinCreator:** Enhance image container styling and button appearance ([0b27613](https://tokenizedev///commit/0b2761357aab23da71af42f81bfb2dfd89bc80ed))
* **components:** add 'Memier' title to CoinCreator action button ([c9e5efd](https://tokenizedev///commit/c9e5efd79b21ff28e662a8b9577865c851f473f6))
* **components:** add asynchronous function to retrieve and parse selected content from local storage ([e9f4242](https://tokenizedev///commit/e9f42425f430c6b03f2bf2a52fcf30ecdd677cf0))
* **components:** Add clearForm function to reset form fields and state ([5c2e014](https://tokenizedev///commit/5c2e01413e2cbc2e209fd6922bb86d1ea3214dc9))
* **components:** Add ensureArticleData function for handling ArticleData properties ([6ddebf1](https://tokenizedev///commit/6ddebf145e02d8dfa9939b8e69116f7aa7ed0e67))
* **components:** add error handling for coin creation in CoinCreator ([8faf6a6](https://tokenizedev///commit/8faf6a65c833fc4b307dbabe2e71c04dc1f4759d))
* **components:** Add functionality to reset image URL and set preview URL ([da2f8c2](https://tokenizedev///commit/da2f8c2c71a41515ff3fd1630b938318c81cf5cb))
* **components:** add image upload functionality ([12d8edb](https://tokenizedev///commit/12d8edbbced98e0b1e17238c9cc1013628721e35))
* **components:** Add Loader component to CoinCreator ([808a3a1](https://tokenizedev///commit/808a3a111a32c801aaf1bcd61b52ae7e5655207b))
* **components:** add multiple image support and carousel functionality ([02808eb](https://tokenizedev///commit/02808ebfa9aaf0496103170d8f3538beb0879cb4))
* **components:** add NetworkIndicator component and implement investment amount input validation ([37f9e69](https://tokenizedev///commit/37f9e69722e906a52063b6506e7dfc1adf171241))
* **components:** add prop 'isSidebar' to CoinCreator component ([7038396](https://tokenizedev///commit/703839618af2554859740ac85c4e5604a5d8d0b2))
* **components:** Add support for local image file upload in CoinCreator component ([1694b1f](https://tokenizedev///commit/1694b1f4a80711f51250f0a2d14675b182914c06))
* **components:** Add Target icon to lucide-react library ([23f2b6b](https://tokenizedev///commit/23f2b6bea1dfcfa3e539ac5e808f848a708fc726))
* **components:** add TerminalLoading component and progress animation effect ([45ab95f](https://tokenizedev///commit/45ab95f96f2fbe7f39972ccc953e042ffdfe078a))
* **components:** enhance Loader component with additional features ([ac9081d](https://tokenizedev///commit/ac9081d2b3eafcec7993f367e7cd2f24b56ed614))
* **components:** improve CoinCreator interface and functionality ([91e62c1](https://tokenizedev///commit/91e62c11ba159a99833c59fc6bdd6a87bf1b70ac))
* **components:** Improve image display in CoinCreator component ([8d5e1ac](https://tokenizedev///commit/8d5e1ac37d33947ebd4620d2c07cddd0b1d7907d))
* **components:** improve Loader component in CoinCreator ([331639a](https://tokenizedev///commit/331639a03be676b3edda7d64245832632035e02a))
* **components:** update CoinCreaterProps with new onCreationError callback ([bdc42b6](https://tokenizedev///commit/bdc42b6ee9a362852e7fe062ef89119ae47fa526))
* **components:** update CoinCreator inputs maxLength ([6b9aa2d](https://tokenizedev///commit/6b9aa2d365cbd47c0e260817370b8b7a463e051d))
* **contentScript:** add base URL support for resolving relative image URLs ([e39fbec](https://tokenizedev///commit/e39fbecc73a844b8634b967593fe7b0cc31fbb4d))
* **contentScript:** add function to extract multiple images ([0062bb8](https://tokenizedev///commit/0062bb8e3ff5aa99f83628550704339f87015068))
* **contentScript:** Add functionality to select and tokenize content ([4bb3542](https://tokenizedev///commit/4bb3542f1272c0132de35104756b59c88e089999))
* **contentScript:** add selection mode for user content selection ([ff92a17](https://tokenizedev///commit/ff92a1712a9f52b064a8f3b1557eb27bef5ed4fb))
* **contentScript:** extract tweet specific URL from timestamp link ([ca48502](https://tokenizedev///commit/ca48502f26231a17ffccf27c04e639d7c2be9167))
* **contentScript:** Implement feature to extract multiple images from article content ([ad30829](https://tokenizedev///commit/ad308293078c0938e0b185913beca47fae2ac9a3))
* **css:** Add new animations and styles for navigation ([33712bc](https://tokenizedev///commit/33712bc50d0648cb2a90245c66321ec0239745a4))
* **css:** Add VT323 font import and new styles ([08d4977](https://tokenizedev///commit/08d49779412035e58fff4239df186b12278cb313))
* **firebase:** add function to fetch token_launched events from Firestore ([1d73f8b](https://tokenizedev///commit/1d73f8b417be72ac2da4574d0fea5daa72227c04))
* **firebase:** Add functions to fetch and add created coins to Firestore ([4a4fec1](https://tokenizedev///commit/4a4fec1a59aff2c1606b313a33f05db2f11173c7))
* **firebase:** add support for sorting created coins by createdAt date ([544c357](https://tokenizedev///commit/544c357eaba5eaaf24b05a60d21af6e2957f9407))
* **fonts:** add custom fonts for new look ([4af5b00](https://tokenizedev///commit/4af5b005f3ae9b31215f539bd8667c044528b46f))
* Improve pagination controls in WalletPageCyber component ([bc86de3](https://tokenizedev///commit/bc86de3c554aac740301c2ac18f77ab78b98deba))
* **Loader:** Add appearance animation and dots animation ([4dc9605](https://tokenizedev///commit/4dc9605e9fabbe26ebe7275600246b80a4c78de3))
* **Loader:** Add isChild prop and adjust main container styling ([1f345df](https://tokenizedev///commit/1f345df408542aa917d6e7f3b38052f3b2631a40))
* **manifest:** update version to 0.5.4 ([f01262c](https://tokenizedev///commit/f01262c3e670e90bfb13e839e91174cffdb2af9d))
* **src/index.css:** Remove Google Fonts import and update typography styling ([f681dd0](https://tokenizedev///commit/f681dd0f07ca286974dee545c39331605e6e52b8))
* **storage:** implement fallback storage support ([9dcd44d](https://tokenizedev///commit/9dcd44deca2a05247becbc6cecec272637335700))
* **store:** Add functions for fetching, adding, and updating created coins to/from Firestore ([add6280](https://tokenizedev///commit/add628063244104202ed7baae866301a8d4df44f))
* **store:** add migration functionality to copy local coins to Firestore ([c9de314](https://tokenizedev///commit/c9de31488f835ef4c8979e0502cd4426da6b8a98))
* **store:** allow image upload for coin creation ([c15ba17](https://tokenizedev///commit/c15ba1770ac7b56bb4655536bc329e2afc9ba3ca))
* **store:** Improve handling of added coins and balance updates ([2aa9778](https://tokenizedev///commit/2aa97788acebaa0d25853760c5274011242ad4be))
* **styles:** Add cyberpunk font styles, terminal effects, and button enhancements ([d632816](https://tokenizedev///commit/d63281609aa9d9b35dabb38e472a2d8f37daf104))
* **tailwind:** Add new animations and keyframes for loading screen ([dfa4b6b](https://tokenizedev///commit/dfa4b6b2e0a4db43b9aac5581b87378c24bc3dd2))
* **tailwind:** add new fonts, colors, animations, keyframes, backgrounds, box shadows, and border widths to tailwind config ([d62b1f3](https://tokenizedev///commit/d62b1f3de19b507c1b4bd6b5cd4c7410aaf6f048))
* **tailwind:** Add new scale-in and fade animations for loader animations ([0103048](https://tokenizedev///commit/010304833ad0b8133d8d335330b4d44998e5494e))
* **types:** add createdAt field to CreatedCoin and migrationStatus field to WalletState ([bbeb0d8](https://tokenizedev///commit/bbeb0d83e893f8f145f55bf38da12770e51f8576))
* **ui:** solidify new approach by updating src and Tailwind config ([79d8d2e](https://tokenizedev///commit/79d8d2e530da251f2322f2db0b3cac972956c0fa))
* **utils:** add DEVNET_RPC_ENDPOINT constant ([7c7ee34](https://tokenizedev///commit/7c7ee34478b27445b1f4dfb9c20b5a311d697e99))
* **wallet:** add dynamic text animation during wallet setup ([8ef7e83](https://tokenizedev///commit/8ef7e83ce603760230a30a08965a1acb9a5e09c3))
* **WalletPageCyber:** Add pagination for created coins ([9b2dc8a](https://tokenizedev///commit/9b2dc8a3cf4fd7441b48247ae5b9e1af31d4bac5))


### Bug Fixes

* adjust height to 90% in App component ([b108c3c](https://tokenizedev///commit/b108c3cfc5400bf68ea3ca1f2bc7d9e0888e7ecd))
* **article-content:** fix issue with article content ([7ec46f8](https://tokenizedev///commit/7ec46f8fa2604e5ed84734ba4d54a9811c288163))
* **components:** fix isLoading condition in CoinCreator component ([7c60c53](https://tokenizedev///commit/7c60c53d750d2e7d11f67e8b72ab37a978e64abd))
* **components:** fix loader display issue in CoinCreator component ([925a0fe](https://tokenizedev///commit/925a0fedf9aec1adf579b801985e40e3be4fc2d6))
* Correct overflow property in index.css for consistency ([479e85c](https://tokenizedev///commit/479e85c3efdb945c062d39cda44573fd6fe157ee))
* Fix typo in 'addCreatedCoinToFirestore' function in src/firebase.ts ([202b512](https://tokenizedev///commit/202b512b229d0b523305f265ddfd392036ae885f))
* **store:** Remove unnecessary console.log statement ([e95e2d8](https://tokenizedev///commit/e95e2d802481d5d6647cca5c3ab25987bce86535))
* update caniuse-lite to version 1.0.30001717 ([26a5d4d](https://tokenizedev///commit/26a5d4d074f50deff711c2ed2f932218b6b6310f))
* Update version to 0.3.3 in manifest.json ([1d982df](https://tokenizedev///commit/1d982df6f4bfc02831276ac90864293df01f6a15))
* update version to 0.5.1 in manifest.json ([68e8e3e](https://tokenizedev///commit/68e8e3ec0349a1723d2326093ba23846a3b1a022))
* update version to 0.5.2 in manifest.json ([c1a2b29](https://tokenizedev///commit/c1a2b2922ff0bdc1491074b0a7d0a2f1f46b2807))

## [0.3.3](https://tokenizedev///compare/v0.3.2...v0.3.3) (2025-05-03)


### Features

* **manifest:** remove 'tabs' permission and 'BREAKING CHANGE' ([9310da0](https://tokenizedev///commit/9310da0d09606a6ce00bcb51102577e44a905811))

## [0.3.2](https://tokenizedev///compare/v0.3.1...v0.3.2) (2025-05-03)

## [0.3.1](https://tokenizedev///compare/v0.3.0...v0.3.1) (2025-05-03)


### Features

* Add commit-and-tag-version configuration to bump package.json and manifest.json files ([bdb220b](https://tokenizedev///commit/bdb220b4dc29c170b99e0b29cfa7202114a1057d))

## [0.3.0](https://tokenizedev///compare/v0.2.3...v0.3.0) (2025-05-02)


### ⚠ BREAKING CHANGES

* **app:** The App component now accepts an optional isSidebar prop to control the display of the sidebar. Make sure to pass this prop when using the App component to enable the sidebar functionality.

### Features

* add 'popup' class to body element ([b47199a](https://tokenizedev///commit/b47199a3f138fe4b02732f43a459bb82dab312cc))
* Add a link to TKNZ website in the README file ([8decb98](https://tokenizedev///commit/8decb98ee087aef2abea7b41f82da0d4e088f00a))
* Add additional logo to README.md ([e2b7627](https://tokenizedev///commit/e2b762701a0ecf397c1b374c926f73dff2c64305))
* Add CI badge to logo section in README.md ([1bb3e2c](https://tokenizedev///commit/1bb3e2c931eb51f026e27aa54d2b3487aad7c2e1))
* Add CI badge to README file ([d98bf7f](https://tokenizedev///commit/d98bf7f383b8888a4d040cb08deaabdfd3e9a506))
* Add CI badge to README.md ([e59b831](https://tokenizedev///commit/e59b83161d92b7d6e29f6140f3a8c90404d770ed))
* Add CI badge to README.md ([9c7facc](https://tokenizedev///commit/9c7facc7fc2a2e5c2de19e1adb1788944cd162e1))
* add class "sidebar" to body tag in sidebar.html ([03e7c24](https://tokenizedev///commit/03e7c2410995903e78c614918c48c80d7f795b1d))
* Add fetch mock setup using vitest-fetch-mock ([e272949](https://tokenizedev///commit/e272949f6202d07cee0499e1df809c56b58d5216))
* add initial tests. update readme and add roadmap. add .env example ([9eb62b6](https://tokenizedev///commit/9eb62b64c425d1b3a58c6dcbbe5549c1d9d2673b))
* Add sidebar page in vite.config.ts ([112dc05](https://tokenizedev///commit/112dc05d3db1052e76f9b1d77dd3f00fca470c75))
* Add VITE_APP_VERSION to .env.example ([080c7dd](https://tokenizedev///commit/080c7dde4c82c48d6ab60164535545c8aa50f3db))
* Add X icon to lucide-react import and closeSidebar function to toggle sidebar in App component ([7d83dee](https://tokenizedev///commit/7d83deee4d1fa85b68ee4bf425795d4661ce0b46))
* **app:** add functionality to close window if sidebar is open ([a6791cf](https://tokenizedev///commit/a6791cf1453420b9a4a1593b5b1e001a123e7386))
* **app:** add optional sidebar functionality ([541ed48](https://tokenizedev///commit/541ed4868e664b4716a2175d46cab9debb922fe5))
* **app:** improve app usability by isolating real estate for tokenization ([95384a4](https://tokenizedev///commit/95384a40359261d5faca7806aca212f2b3abc5b6))
* **ci:** add step to generate extension key for CRX signing ([466d92b](https://tokenizedev///commit/466d92b983d41aacbdd4d6f416de0082155f4d23))
* **CoinCreator:** Add subscription to active tab changes in side panel for re-fetching article data ([299d6d0](https://tokenizedev///commit/299d6d07f38b07c9178077d5cbcf7e35cd153582))
* **css:** Add full viewport height and scrollable sidebar context ([0e47f15](https://tokenizedev///commit/0e47f15776bccf24ac12d021ce78165d2b541970))
* **dependency:** upgrade vitest-fetch-mock to v0.4.5 ([b89f425](https://tokenizedev///commit/b89f42535a9222e95c5c514ae995d605d2990ed2))
* **deps:** update testing libraries and add coverage tool ([d521e35](https://tokenizedev///commit/d521e3587eb6fa585ade1120947229d2da105d77))
* **extension:** add tests to establish baseline functionality and reliability ([be1144c](https://tokenizedev///commit/be1144ce0e4e8d0b5b294c54a8249213fd15c8c9))
* **manifest:** Add 'sidePanel' and 'tabs' permissions ([0a996ff](https://tokenizedev///commit/0a996ff0b8389ab400b1cd7d48b0f930f7631c29))
* **package.json:** add vitest-fetch-mock dependency ([cfbce2e](https://tokenizedev///commit/cfbce2e41239b55dd1d2607a2c0790b7f3c1d8ee))
* **sidebar:** it's a bar, on the side. sidebar ([c448721](https://tokenizedev///commit/c448721f1ebfb09851eb92f006ebddf94cd53900))
* **store:** add version check feature using compare-versions library ([6b96064](https://tokenizedev///commit/6b960644accd6e2430d1c5f3a9d0e67e819fa448))
* Update README.md with CI badge and center align logo ([5b36e03](https://tokenizedev///commit/5b36e03cdeee7d2f86dd97a73d4fffdd8148b322))
* **utils:** Update fetch method in createConnection function ([6ad3993](https://tokenizedev///commit/6ad3993268a75cff074b20b9da8002edcd7fab84))


### Bug Fixes

* **ci:** update GitHub Actions upload artifact action ([d09e567](https://tokenizedev///commit/d09e567583ec776fd35fca9fc90c2219e880e441))
* **CoinCreator:** Correct image and URL assignment with proper string formatting ([38cf464](https://tokenizedev///commit/38cf464e6b1769d6b0f777287bdadcbd5c32711b))
* **contentScript:** improve fallback title handling in extractArticleData ([6c7a1a2](https://tokenizedev///commit/6c7a1a23757f211227f5994f9554b90c0ba9b7ef))
* **contentScript:** suppress error logs during testing ([fb458f1](https://tokenizedev///commit/fb458f1f17b129b3221bfe36c437b3244933fa51))
* Fix fetch stubbing issue in connection.test.ts ([89609d2](https://tokenizedev///commit/89609d25cf7fb83cc2231e30ba774cc4c059b510))
* **store:** remove unnecessary balance update logging ([d42748a](https://tokenizedev///commit/d42748a4f14d640a6bd12428a4123ead03392c0b))
* **styles:** Update sidebar CSS to fix scrolling issue ([b2a88db](https://tokenizedev///commit/b2a88dbe818516291ca804ef40c0f98d8451e2c1))
* update CI badge in README.md ([b14c381](https://tokenizedev///commit/b14c3819404976a4157786052371a9254e9acb91))
* update Firebase API key to use environment variable ([399473f](https://tokenizedev///commit/399473f4df913ce74138e66cc888b09f14e19dd8))

## [0.2.3](https://tokenizedev///compare/v0.2.2...v0.2.3) (2025-04-30)


### Features

* **components:** Add functionality to generate suggestions when creating a new coin ([c838890](https://tokenizedev///commit/c838890bee285d9b10587bdcbc37441366d5967b))

## [0.2.2](https://tokenizedev///compare/v0.2.1...v0.2.2) (2025-03-25)


### Features

* **App:** update component logic for version check to show when update is not the latest version ([cc913e6](https://tokenizedev///commit/cc913e6aa2a290cb0e40b270bc7c902381208faa))

## [0.2.1](https://tokenizedev///compare/v0.2.0...v0.2.1) (2025-03-25)


### Features

* **App:** add VersionCheck component and improve version checking logic ([2cee347](https://tokenizedev///commit/2cee347ead04e355396b1f080542470d3f3ea244))
* **store:** add 'isLatestVersion' and 'updateAvailable' properties ([061639c](https://tokenizedev///commit/061639ceac9a78a11b7e5f136b4df6a61bac93af))
* Update conditional rendering logic in App component to show VersionCheck component only if isLatestVersion is true ([b790888](https://tokenizedev///commit/b79088860cec3bf91d07d5d6dcfe5e2ad84784ba))

## [0.2.0](https://tokenizedev///compare/v0.1.6...v0.2.0) (2025-03-05)


### ⚠ BREAKING CHANGES

* **components:** The `generateSuggestions

### Features

* **build:** Remove unnecessary entries from rollupOptions input ([caac0ff](https://tokenizedev///commit/caac0ffbebe16978991e954b9722b217c47aaf4a))
* **CoinCreator:** add mock article data and update state variable naming ([e1b5b2f](https://tokenizedev///commit/e1b5b2f582767fc89ad4bfefac4572c51fb6a380))
* **components:** add 'author' field and 'isXPost' boolean to ArticleData interface ([6282441](https://tokenizedev///commit/6282441e731470a3c4c930f1318874754c2b05bb))
* **components:** add DEV_MODE constant in CoinCreator.tsx ([31adb3f](https://tokenizedev///commit/31adb3f370db678c623c87a10c93050beadfad8f))
* **components:** add functionality to generate coin suggestions ([c57542d](https://tokenizedev///commit/c57542dbd3ca8586e9417532d515917ce675b1e0))
* **contentScript:** add authorName and tweetImage to extracted tweet data ([fe6661a](https://tokenizedev///commit/fe6661a1ed2a28494d2825b5c424348ca5cb3b9f))
* **firebase:** implement basic firebase analytics tracking ([66ea4b7](https://tokenizedev///commit/66ea4b7a158c3130cc491bc276f907ac2783c456))
* **manifest:** Remove unnecessary permissions and content script ([4ecce85](https://tokenizedev///commit/4ecce85698a669df37a5bb2b982c7b7c151719b1))
* **package:** remove openai dependency ([ec2409a](https://tokenizedev///commit/ec2409abdb709913c50592724fc803436d6a45c1))
* Remove 'openai' package from dependencies in package.json ([4c01070](https://tokenizedev///commit/4c01070d81c08adc54af12d962efc53437d03a2c))
* **store:** add getArticleData method and update getTokenCreationData signature ([ff49690](https://tokenizedev///commit/ff496905a03fa3824f3450a3ddae09eb1babc5f6))
* **store:** add getTokenCreationData method for fetching token creation data ([8c7ace9](https://tokenizedev///commit/8c7ace9d5e2c5c167913b5beb3314b02d53981cb))
* **versioning:** add version checking at app startup ([650dc38](https://tokenizedev///commit/650dc38c3a5bfcb550ad3bf041e7ce33d979b673))


### Bug Fixes

* Fix copying contentScript file to src/contentScript.tsx in link-build-to-source.sh ([d78cc05](https://tokenizedev///commit/d78cc05a761814172f2cf1347e9f4ab15c8b08ec))
* remove unused postbuild script from package.json ([c29e195](https://tokenizedev///commit/c29e19519b2749e0e603b5fb49055ac858b4fc04))

## [0.1.6](https://tokenizedev///compare/v0.1.5...v0.1.6) (2025-02-16)


### Bug Fixes

* **pack:** read correct file for version in pack.js ([a800df1](https://tokenizedev///commit/a800df1415c735f8e555ddb3628466a24f81db63))

## [0.1.5](https://tokenizedev///compare/v0.1.4...v0.1.5) (2025-02-16)

## [0.1.4](https://tokenizedev///compare/v0.1.2...v0.1.4) (2025-02-16)


### Features

* **package.json:** update version to 0.1.3 and add postbuild script ([666931f](https://tokenizedev///commit/666931f3bf2a595373ffcd422cfbff971e0485ac))

## [0.1.2](https://tokenizedev///compare/v0.1.1...v0.1.2) (2025-02-16)


### Features

* update .gitignore to include new 'release/' directory ([13a1821](https://tokenizedev///commit/13a182155a586512155eca49cc9470a5ab1b1a29))


### Bug Fixes

* **components:** Update style for the Send icon in CoinCreator component ([410db8b](https://tokenizedev///commit/410db8b69f89804c05f0a15335b3d9f5e3103185))

## 0.1.1 (2025-02-16)


### Features

* Add 'build:crx' script and 'keygen' script for generating extension PEM files ([bef7723](https://tokenizedev///commit/bef77237e74dd1401c3a4efbb9c24fff2a802fe4))
* init ([241466e](https://tokenizedev///commit/241466e936fdbdf2379f6e59e2aa035c5d15e328))
* **styles:** Add custom scrollbar styles and #root height ([1e99f8a](https://tokenizedev///commit/1e99f8a2ce508622af0e8df536db56e2aeb5a42d))
* **vite.config:** add privateKey to contentScripts options ([3ad1416](https://tokenizedev///commit/3ad141619d8dacc202d1662330e808ad8e13d276))


### Bug Fixes

* Add extension.pem to .gitignore ([c6e1b19](https://tokenizedev///commit/c6e1b19952033ce1f850c4b7cf2c34061574d439))
* update icon128.png ([47ed22f](https://tokenizedev///commit/47ed22fc3ac3e400449230b6770136a191062323))
* update icon16.png file ([d51c3cd](https://tokenizedev///commit/d51c3cd44b6267f59cfd0ab68992246e4063d0c9))
* update icon48.png file ([c544ab4](https://tokenizedev///commit/c544ab49298538c961c1c8040d8e75d8a5ea9511))
