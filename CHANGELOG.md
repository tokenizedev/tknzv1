# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

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
