# Browser Support

Konkret Wallet's browser support policy is to support:

- The last and previous [Konform Browser](https://codeberg.org/konform-browser) releases
- The current and previous Firefox Extended Support Release
- The current and previous Firefox Stable Release
- The last two years of Chromium stable releases

We try to support other browser forks as well (aligned with supported Chromium/Firefox releases), but we don't actively test them.

## Providing notice of minimum supported version changes

Additionally, before bumping our minimum supported browser versions, we should always notify users in the application first. Otherwise users of older browser versions would unknowingly get stuck on old versions, even if they had automatic updates enabled.

We have a home screen notification already for this purpose. All we need to do us update the `OUTDATED_BROWSER_VERSIONS` constant in the release prior to the minimum version bump, and all affected users should be notified in-app.
