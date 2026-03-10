# PiP Force

Re-enables Picture-in-Picture on videos where sites have disabled it.

## Features

- **Force-enable PiP:** Overrides `disablePictureInPicture` on any video element, bypassing site restrictions.
- **One-click toggle:** Click the extension icon or use the right-click context menu to activate or deactivate PiP.
- **Auto-resume:** When the current video ends or its source changes (e.g., next episode), PiP automatically resumes on the new video.
- **Shadow DOM support:** Finds videos inside nested shadow roots, so it works on sites with custom video players.
- **Visual feedback:** The extension icon changes to indicate whether PiP is currently active.
- **Largest video detection:** Automatically targets the largest visible video on the page.

## Installation

1. Download or clone this repository.
2. Go to `chrome://extensions` in your Chrome browser.
3. Enable "Developer mode" (top right).
4. Click "Load unpacked" and select the `extension` folder.

~~**Also available on the [Chrome Web Store](https://chromewebstore.google.com/detail/pip-force/TODO)**~~
~~_(Note: The Chrome Web Store version may not always have the latest updates.)_~~

## Usage

- Click the extension icon (or right-click and select "PiP Force") on any page with a video.
- The largest playing video will enter Picture-in-Picture mode.
- Click the icon again to exit PiP.
- If the video source changes, PiP will try to automatically resume on the new video.

## License
See [LICENSE](LICENSE).

---

## Author
- Jaewoo Jeon [@thejjw](https://github.com/thejjw)

If you find this extension helpful, consider supporting its development via GitHub Sponsors (one-time or monthly), or Buy Me a Coffee:

[![Buy Me A Coffee](https://cdn.buymeacoffee.com/buttons/default-yellow.png)](https://www.buymeacoffee.com/thejjw)
