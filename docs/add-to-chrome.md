## Add Custom Build to Chromium-based browsers

![Load dev build](./load-dev-build-chrome.gif)

- Create a local build using your preferred method.
  - You can find build instructions in the [readme](../README.md).
- Open `Settings` > `Extensions`.
  - Or go straight to [chrome://extensions](chrome://extensions).
- Check "Developer mode".
- At the top, click `Load Unpacked Extension`.
- Navigate to your `dist/chrome` folder.
- Click `Select`.
- Change to your locale via `chrome://settings/languages`
- Restart the browser and test the extension in your locale

Your dev build is now added to your browser, and you can click `Inspect views background.html`
in its card on the extension settings page to view its dev console.
