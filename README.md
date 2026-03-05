# Quick Snapshotter

A Google Chrome extension that allows you to effortlessly select and capture screenshots of specific HTML elements on any webpage. 

## Features
- **Precise Element Selection**: Hover over elements to see exactly what will be captured.
- **Action Menu**: Click to lock onto an element and reveal quick actions.
- **Download**: Instantly download the cropped element screenshot.
- **Copy to Clipboard**: Copy the element's image directly to your clipboard for easy pasting into documents or chat apps.

## Installation
Currently, the extension is installed via Developer Mode in Chrome.

1. Clone or download this repository.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** in the top right corner.
4. Click **Load unpacked** and select the folder containing this extension's code.

## Usage
1. Right-click anywhere on a webpage and select **"Screenshot Element"** from the context menu, or click the extension's icon in your toolbar.
2. Hover your mouse over the element you wish to capture.
3. Click to lock the selection.
4. Choose **Download** or **Copy to Clipboard** from the floating menu. (Press **Cancel** or hit the `Escape` key to abort).

## Project Structure
- `manifest.json`: Configuration for Manifest V3.
- `src/background.js`: Service worker handling capture, cropping, and clipboard/download orchestration.
- `src/content.js`: Content script injected into the page to manage hover highlighting and user interaction.
- `src/styles.css`: CSS for the highlight overlay and the floating action menu.
