# Global Grayscale Toggle (Chrome Extension, MV3)

A minimal Manifest V3 Chrome extension that toggles grayscale mode for webpages.

## Folder Structure

- `manifest.json` - Extension manifest (MV3), permissions, command, content script, popup, background service worker.
- `background.js` - Stores grayscale state, handles popup/command messages, broadcasts updates to all tabs.
- `content.js` - Applies/removes grayscale style tag at `document_start` and keeps it resilient for SPA updates.
- `popup.html` - Popup UI with a single ON/OFF checkbox.
- `popup.css` - Popup styling.
- `popup.js` - Reads current state and updates it when toggled.

## Load in Chrome

1. Open Chrome and go to `chrome://extensions`.
2. Enable **Developer mode** (top-right).
3. Click **Load unpacked**.
4. Select this folder (`chrome-extesnion-grayscale`).
5. Pin the extension from the extensions menu if you want quick access.

## Keyboard Shortcut

Default command is:
- Windows/Linux: `Ctrl+Shift+G`
- macOS: `Command+Shift+G`

To customize:
1. Open `chrome://extensions/shortcuts`.
2. Find **Global Grayscale Toggle**.
3. Change the shortcut for **Toggle grayscale mode**.

## How It Works

- State is persisted in `chrome.storage.local` under `grayscaleEnabled`.
- Popup sends `GRAYSCALE_GET` and `GRAYSCALE_SET` messages to the background service worker.
- Keyboard command triggers `toggle-grayscale` in background.
- Background updates storage and broadcasts `GRAYSCALE_SET` to all tabs.
- Content script injects/removes:

```css
html { filter: grayscale(100%) !important; }
```

using a fixed style ID: `grayscale-toggle-style`.

- Content script runs at `document_start` and requests the current state (`CONTENT_READY`) to reduce flicker.
- A `MutationObserver` re-applies the style if app code mutates DOM in SPA scenarios.
