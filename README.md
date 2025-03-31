# Konkret Wallet Browser Extension

<a href="https://codeberg.org/konkret-wallet/konkret-wallet">
  <img alt="https://codeberg.org/konkret-wallet/konkret-wallet" src="./app/images/logo/metamask-fox.svg" width="256px" />
</a>

Privacy-preserving digital assets wallet and key manager browser extension.

The project started as a community fork of [MetaMask Extension](https://github.com/MetaMask/metamask-extension.git) and Konkret Wallet would not be what it is today without having had MetaMask Extesion as a base to build on.

Konkret Wallet is developed by volunteers for free and is intended for non-commercial individual and educational use.

## Differences to upstream

Konkret Wallet takes a different tradeoff in terms of privacy and data-sharing.

### Philosophy

Similar in spirit to projects like [Konform Browser](https://codeberg.org/konform-browser) (Firefox fork), [ungoogled-chromium](https://github.com/ungoogled-software/ungoogled-chromium) (Chromium fork), it aims to provided a free, open, yet private vanilla experience without proprietary vendor integrations.

Konkret Wallet is developed with the following goals:

- Local-first: Works in airgapped and offline environments
- APIs in new functionality should be based on open protocols, ideally standardized
- When integrating with standardized APIs, do so in a standard-compliant manner
- Avoid proprietary vendor-specific APIs and API extensions
- Do not track or gather non-essential user data
- Do not expose user metadata to remote parties without explicit informed user consent (aka opt-in)
- Allow users granular control of wallet service integrations
- Graceful degradation and progressive enhancement
- Explorative and minimal UX: Remove promotional components from UI
- Environmentally friendly and efficient: Disable, reduce and remove code-paths and network calls not directly serving the user
  - aka "debloat"
- Inclusive and accessible: Full functionality regardless of who or where you are
- Robust and future-proof: Should work the same in 10+ years from now as today provided a compatible network provider

### Distribution

Konkret Wallet is officially only provided as source and unminified packaged dist builds. See [`LICENSE.txt`](./LICENSE.txt) for redistribution terms.

### Support

This software is provided as-is, with no guarantees, used on your own risk and under your own responsibility. Do your own research and inform yourself of applicable rules, regulations, and risks.

While MetaMask provides support service for users of MetaMask Extension, no such support is available for Konkret Wallet.

Konkret Wallet is not supported by or affiliated with MetaMask or ConsenSys in any way.

### Bring-Your-Own-Provider

The most obvious functional difference with upstream is the lack of preconfigured network providers.

While the MetaMask Extension comes with pre-enabled network providers (aka RPC providers) on the Infura platform, Konkret Wallet expects you to configure your own provider(s). The only preconfigured provider is `http://localhost:8545` and the user is prompted for custom node endpoint configuration during onboarding.

For an example of how to serve RPC providers on you local machine, see [this blogpost](https://chasewright.com/load-balancing-freemium-ethereum-endpoints/) by [MysticalRyuujin]() on how to set up [dshackle](https://github.com/emeraldpay/dhsackle) with [various providers](https://github.com/MysticRyuujin/dshackle-configs).

### Removed functionality

As a result of the points laid out above, the following functionality and integrations are removed:

- MetaMetrics analytics
- Behavioral measurement and tracking
  - Integration with analytics providers like Segment and Sentry
- Blockaid/PPOM Security Provider
  - Trusted obfuscated binary
- Remote Feature Flags
- Surveys
- Feauture announcements
- Internal advertising in UI
- MetaMask OnRamp
- MetaMask Portfolio

The following functionality is removed due to reliance on closed, proprietary and centralized services in upstream. Contributions implementing them in a compatible manner are welcome:

- Notifications
  - Upstream implementation requires Google Firebase integration
- Account Sync
  - Upstream implementation requires Google Firebase integration

### Disabled functionality

The following functionality is disabled due to reliance on remote endpoints and/or exposure of user metadata in upstream implementation. Contributions implementing them in a compatible manner are welcome:

- [ ] Hardware Wallets
  - [ ] Ledger: Loads execution iframe remotely
  - [ ] Trezor: Loads execution iframe remotely
  - [ ] Lattice: Loads execution iframe remotely
- Phishing detection
- Live reloading of chain metadata
- Notifications
  - Upstream implementation requires Google Firebase integration
- Account Sync
  - Upstream implementation requires Google Firebase integration
- Snaps
  - Loads execution iframe remotely
- Assets exchange rates
- Contract metadata
- Swaps
- Bridge

If you miss any of these features, please indicate interest in the [issue tracker](https://codeberg.org/konkret/konkret-wallet/issues).

### Added functionality

### TODO:

- [ ] Branded Connect option
  - In order to reduce fingerprinting vectors and preserve compatibility with legacy dapps, Konkret Wallet presents itself as upstream in Connect interactions with dapps. This feature may cause issues if MetaMask Extension is simultaneously enabled in the same browser profile.
- [ ] Accessible in-wallet signing

---

To report problems or requests, peruse the [issue tracker](https://codeberg.org/konkret/konkret-wallet/issues).

To learn how to develop compatible applications, visit [MetaMask Developer Docs](https://docs.metamask.io/).

To learn how to contribute to the upstream codebase, visit [MetaMask Contributor Docs](https://github.com/MetaMask/contributor-docs).

To learn how to contribute to the project itself, visit [Extension Docs](./docs).

## Building on your local machine

- Install [Node.js](https://nodejs.org) version 20
  - If you are using [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) (recommended) running `nvm use` will automatically choose the right node version for you.
- Enable Corepack by executing the command `corepack enable` within the project. Corepack is a utility included with Node.js by default. It manages Yarn on a per-project basis, using the version specified by the `packageManager` property in the project's package.json file. Please note that modern releases of [Yarn](https://yarnpkg.com/getting-started/install) are not intended to be installed globally or via npm.
- Duplicate `.metamaskrc.dist` within the root and rename it to `.metamaskrc` by running `cp .metamaskrc{.dist,}`.

  - Optionally, replace the `PASSWORD` value with your development wallet password to avoid entering it each time you open the app.

- Run `yarn install` to install the dependencies.
- Build the project to the `./dist/` folder with `yarn dist` (for Chromium-based browsers) or `yarn dist:mv2` (for Firefox)

  - Optionally, to create a development build you can instead run `yarn start` (for Chromium-based browsers) or `yarn start:mv2` (for Firefox)
  - Uncompressed builds can be found in `/dist`, compressed builds can be found in `/builds` once they're built.
  - See the [build system readme](./development/build/README.md) for build system usage information.

- Follow these instructions to verify that your local build runs correctly:
  - [How to add custom build to Chrome](./docs/add-to-chrome.md)
  - [How to add custom build to Firefox](./docs/add-to-firefox.md)

## Git Hooks

To get quick feedback from our shared code quality fitness functions before committing the code, you can install our git hooks with Husky.

`$ yarn githooks:install`

You can read more about them in our [testing documentation](./docs/testing.md#fitness-functions-measuring-progress-in-code-quality-and-preventing-regressions-using-custom-git-hooks).

If you are using VS Code and are unable to make commits from the source control sidebar due to a "command not found" error, try these steps from the [Husky docs](https://typicode.github.io/husky/troubleshooting.html#command-not-found).

## Contributing

### Development builds

To start a development build (e.g. with logging and file watching) run `yarn start`.

#### Development build with wallet state

You can start a development build with a preloaded wallet state, by adding `TEST_SRP='<insert SRP here>'` and `PASSWORD='<insert wallet password here>'` to the `.metamaskrc` file. Then you have the following options:

1. Start the wallet with the default fixture flags, by running `yarn start:with-state`.
2. Check the list of available fixture flags, by running `yarn start:with-state --help`.
3. Start the wallet with custom fixture flags, by running `yarn start:with-state --FIXTURE_NAME=VALUE` for example `yarn start:with-state --withAccounts=100`. You can pass as many flags as you want. The rest of the fixtures will take the default values.

#### Development build with Webpack

You can also start a development build using the `yarn webpack` command, or `yarn webpack --watch`. This uses an alternative build system that is much faster, but not yet production ready. See the [Webpack README](./development/webpack/README.md) for more information.

#### React and Redux DevTools

To start the [React DevTools](https://github.com/facebook/react-devtools), run `yarn devtools:react` with a development build installed in a browser. This will open in a separate window; no browser extension is required.

To start the [Redux DevTools Extension](https://github.com/reduxjs/redux-devtools/tree/main/extension):

- Install the package `remotedev-server` globally (e.g. `yarn global add remotedev-server`)
- Install the Redux Devtools extension.
- Open the Redux DevTools extension and check the "Use custom (local) server" checkbox in the Remote DevTools Settings, using the default server configuration (host `localhost`, port `8000`, secure connection checkbox unchecked).

Then run the command `yarn devtools:redux` with a development build installed in a browser. This will enable you to use the Redux DevTools extension to inspect.

To create a development build and run both of these tools simultaneously, run `yarn start:dev`.

#### Test Dapp

[This test site](https://metamask.github.io/test-dapp/) can be used to execute different user flows.

### Running Unit Tests and Linting

Run unit tests and the linter with `yarn test`. To run just unit tests, run `yarn test:unit`.

You can run the linter by itself with `yarn lint`, and you can automatically fix some lint problems with `yarn lint:fix`. You can also run these two commands just on your local changes to save time with `yarn lint:changed` and `yarn lint:changed:fix` respectively.

For Jest debugging guide using Node.js, see [docs/tests/jest.md](docs/tests/jest.md).

### Running E2E Tests

Our e2e test suite can be run on either Firefox or Chrome. Here's how to get started with e2e testing:

#### Preparing a Test Build

Before running e2e tests, ensure you've run `yarn install` to download dependencies. Next, you'll need a test build. You have 3 options:

1. Use `yarn download-builds:test` to quickly download and unzip test builds for Chrome and Firefox into the `./dist/` folder. This method is fast and convenient for standard testing.
2. Create a custom test build: for testing against different build types, use `yarn build:test`. This command allows you to generate test builds for various types, including:
   - `yarn build:test` for main build
3. Start a test build with live changes: `yarn start:test` is particularly useful for development. It starts a test build that automatically recompiles application code upon changes. This option is ideal for iterative testing and development. This command also allows you to generate test builds for various types, including:
   - `yarn start:test` for main build

Note: The `yarn start:test` command (which initiates the testDev build type) has LavaMoat disabled for both the build system and the application, offering a streamlined testing experience during development. On the other hand, `yarn build:test` enables LavaMoat for enhanced security in both the build system and application, mirroring production environments more closely.

#### Running Tests

Once you have your test build ready, choose the browser for your e2e tests:

- For Firefox, run `yarn test:e2e:firefox`.
  - Note: If you are running Firefox as a snap package on Linux, ensure you enable the appropriate environment variable: `FIREFOX_SNAP=true yarn test:e2e:firefox`
- For Chrome, run `yarn test:e2e:chrome`.

These scripts support additional options for debugging. Use `--help`to see all available options.

#### Running a single e2e test

Single e2e tests can be run with `yarn test:e2e:single test/e2e/tests/TEST_NAME.spec.js` along with the options below.

```console
  --browser           Set the browser to be used; specify 'chrome', 'firefox', 'all'
                      or leave unset to run on 'all' by default.
                                                          [string] [default: 'all']
  --debug             Run tests in debug mode, logging each driver interaction
                                                         [boolean] [default: true]
  --retries           Set how many times the test should be retried upon failure.
                                                              [number] [default: 0]
  --leave-running     Leaves the browser running after a test fails, along with
                      anything else that the test used (ganache, the test dapp,
                      etc.)                              [boolean] [default: false]
  --update-snapshot   Update E2E test snapshots
                                             [alias: -u] [boolean] [default: false]
```

For example, to run the `account-details` tests using Chrome, with debug logging and with the browser set to remain open upon failure, you would use:
`yarn test:e2e:single test/e2e/tests/account-menu/account-details.spec.js --browser=chrome --leave-running`

#### Running e2e tests against specific feature flag

While developing new features, we often use feature flags. As we prepare to make these features generally available (GA), we remove the feature flags. Existing feature flags are listed in the `.metamaskrc.dist` file. To execute e2e tests with a particular feature flag enabled, it's necessary to first generate a test build with that feature flag activated. There are two ways to achieve this:

- To enable a feature flag in your local configuration, you should first ensure you have a `.metamaskrc` file copied from `.metamaskrc.dist`. Then, within your local `.metamaskrc` file, you can set the desired feature flag to true. Following this, a test build with the feature flag enabled can be created by executing `yarn build:test`.

- Alternatively, for enabling a feature flag directly during the test build creation, you can pass the parameter as true via the command line. For instance, activating the MULTICHAIN feature flag can be done by running `MULTICHAIN=1 yarn build:test` or `MULTICHAIN=1 yarn start:test` . This method allows for quick adjustments to feature flags without altering the `.metamaskrc` file.

Once you've created a test build with the desired feature flag enabled, proceed to run your tests as usual. Your tests will now run against the version of the extension with the specific feature flag activated. For example:
`yarn test:e2e:single test/e2e/tests/account-menu/account-details.spec.js --browser=chrome`

This approach ensures that your e2e tests accurately reflect the user experience for the upcoming GA features.

#### Running specific builds types e2e test

Different build types have different e2e tests sets. In order to run them look in the `package.json` file. You will find:

```console
    "test:e2e:chrome:snaps": "SELENIUM_BROWSER=chrome node test/e2e/run-all.js --snaps",
    "test:e2e:firefox": "SELENIUM_BROWSER=firefox node test/e2e/run-all.js",
```

### Changing dependencies

Whenever you change dependencies (adding, removing, or updating, either in `package.json` or `yarn.lock`), there are various files that must be kept up-to-date.

- `yarn.lock`:
  - Run `yarn` again after your changes to ensure `yarn.lock` has been properly updated.
  - Run `yarn lint:lockfile:dedupe:fix` to remove duplicate dependencies from the lockfile.
- The `allow-scripts` configuration in `package.json`
  - Run `yarn allow-scripts auto` to update the `allow-scripts` configuration automatically. This config determines whether the package's install/postinstall scripts are allowed to run. Review each new package to determine whether the install script needs to run or not, testing if necessary.
  - Unfortunately, `yarn allow-scripts auto` will behave inconsistently on different platforms. macOS and Windows users may see extraneous changes relating to optional dependencies.
- The LavaMoat policy files
  - Manual update instructions: The _tl;dr_ is to run `yarn lavamoat:auto` to update these files, but there can be devils in the details:
    - There are two sets of LavaMoat policy files:
      - The production LavaMoat policy files (`lavamoat/browserify/*/policy.json`), which are re-generated using `yarn lavamoat:webapp:auto`. Add `--help` for usage.
        - These should be regenerated whenever the production dependencies for the webapp change.
      - The build system LavaMoat policy file (`lavamoat/build-system/policy.json`), which is re-generated using `yarn lavamoat:build:auto`.
        - This should be regenerated whenever the dependencies used by the build system itself change.
    - Whenever you regenerate a policy file, review the changes to determine whether the access granted to each package seems appropriate.
    - Unfortunately, `yarn lavamoat:auto` will behave inconsistently on different platforms.
      macOS and Windows users may see extraneous changes relating to optional dependencies.
    - If you keep getting policy failures even after regenerating the policy files, try regenerating the policies after a clean install by doing:
      - `rm -rf node_modules/ && yarn && yarn lavamoat:auto`
    - Keep in mind that any kind of dynamic import or dynamic use of globals may elude LavaMoat's static analysis.
      Refer to the LavaMoat documentation or ask for help if you run into any issues.
- The Attributions file
  - Manual update: run `yarn attributions:generate`.

## Architecture

- [Visual of the controller hierarchy and dependencies as of summer 2022.](https://gist.github.com/rekmarks/8dba6306695dcd44967cce4b6a94ae33)
- [Visual of the entire codebase.](https://mango-dune-07a8b7110.1.azurestaticapps.net/?repo=metamask%2Fmetamask-extension)

[![Architecture Diagram](./docs/architecture.png)][1]

## Other Docs

- [How to add a new translation](./docs/translating-guide.md)
- [Publishing Guide](./docs/publishing.md)
- [How to use the TREZOR emulator](./docs/trezor-emulator.md)
- [Developer notes](./development/README.md)
- [How to generate a visualization of this repository's development](./development/gource-viz.sh)
- [How to add new confirmations](./docs/confirmations.md)
- [Browser support guidelines](./docs/browser-support.md)

[1]: http://www.nomnoml.com/#view/%5B%3Cactor%3Euser%5D%0A%0A%5Bmetamask-ui%7C%0A%20%20%20%5Btools%7C%0A%20%20%20%20%20react%0A%20%20%20%20%20redux%0A%20%20%20%20%20thunk%0A%20%20%20%20%20ethUtils%0A%20%20%20%20%20jazzicon%0A%20%20%20%5D%0A%20%20%20%5Bcomponents%7C%0A%20%20%20%20%20app%0A%20%20%20%20%20account-detail%0A%20%20%20%20%20accounts%0A%20%20%20%20%20locked-screen%0A%20%20%20%20%20restore-vault%0A%20%20%20%20%20identicon%0A%20%20%20%20%20config%0A%20%20%20%20%20info%0A%20%20%20%5D%0A%20%20%20%5Breducers%7C%0A%20%20%20%20%20app%0A%20%20%20%20%20metamask%0A%20%20%20%20%20identities%0A%20%20%20%5D%0A%20%20%20%5Bactions%7C%0A%20%20%20%20%20%5BbackgroundConnection%5D%0A%20%20%20%5D%0A%20%20%20%5Bcomponents%5D%3A-%3E%5Bactions%5D%0A%20%20%20%5Bactions%5D%3A-%3E%5Breducers%5D%0A%20%20%20%5Breducers%5D%3A-%3E%5Bcomponents%5D%0A%5D%0A%0A%5Bweb%20dapp%7C%0A%20%20%5Bui%20code%5D%0A%20%20%5Bweb3%5D%0A%20%20%5Bmetamask-inpage%5D%0A%20%20%0A%20%20%5B%3Cactor%3Eui%20developer%5D%0A%20%20%5Bui%20developer%5D-%3E%5Bui%20code%5D%0A%20%20%5Bui%20code%5D%3C-%3E%5Bweb3%5D%0A%20%20%5Bweb3%5D%3C-%3E%5Bmetamask-inpage%5D%0A%5D%0A%0A%5Bmetamask-background%7C%0A%20%20%5Bprovider-engine%5D%0A%20%20%5Bhooked%20wallet%20subprovider%5D%0A%20%20%5Bid%20store%5D%0A%20%20%0A%20%20%5Bprovider-engine%5D%3C-%3E%5Bhooked%20wallet%20subprovider%5D%0A%20%20%5Bhooked%20wallet%20subprovider%5D%3C-%3E%5Bid%20store%5D%0A%20%20%5Bconfig%20manager%7C%0A%20%20%20%20%5Brpc%20configuration%5D%0A%20%20%20%20%5Bencrypted%20keys%5D%0A%20%20%20%20%5Bwallet%20nicknames%5D%0A%20%20%5D%0A%20%20%0A%20%20%5Bprovider-engine%5D%3C-%5Bconfig%20manager%5D%0A%20%20%5Bid%20store%5D%3C-%3E%5Bconfig%20manager%5D%0A%5D%0A%0A%5Buser%5D%3C-%3E%5Bmetamask-ui%5D%0A%0A%5Buser%5D%3C%3A--%3A%3E%5Bweb%20dapp%5D%0A%0A%5Bmetamask-contentscript%7C%0A%20%20%5Bplugin%20restart%20detector%5D%0A%20%20%5Brpc%20passthrough%5D%0A%5D%0A%0A%5Brpc%20%7C%0A%20%20%5Bethereum%20blockchain%20%7C%0A%20%20%20%20%5Bcontracts%5D%0A%20%20%20%20%5Baccounts%5D%0A%20%20%5D%0A%5D%0A%0A%5Bweb%20dapp%5D%3C%3A--%3A%3E%5Bmetamask-contentscript%5D%0A%5Bmetamask-contentscript%5D%3C-%3E%5Bmetamask-background%5D%0A%5Bmetamask-background%5D%3C-%3E%5Bmetamask-ui%5D%0A%5Bmetamask-background%5D%3C-%3E%5Brpc%5D%0A
