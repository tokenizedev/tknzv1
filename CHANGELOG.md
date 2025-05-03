# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

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
