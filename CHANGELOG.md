# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

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
