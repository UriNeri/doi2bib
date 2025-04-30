# DOI to BibTeX Chrome Extension

A Chrome extension that converts DOI (Digital Object Identifier) to BibTeX format using the Crossref API.

## Features

- Convert DOI to BibTeX format with a single click
- Clean, modern user interface
- Copy BibTeX to clipboard functionality
- Input validation for DOI format
- Real-time status updates

## Installation

1. Clone this repository or download the files
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the directory containing these files

## Usage

1. Click the extension icon in your Chrome toolbar
2. Enter a valid DOI in the input field
3. Click "Convert to BibTeX"
4. The BibTeX entry will appear in the text area
5. Click "Copy to Clipboard" to copy the BibTeX entry

## Development

The extension uses:
- Manifest V3
- Crossref API for DOI resolution
- Modern JavaScript (async/await)
- Clean, responsive UI

## Note

Please replace the User-Agent email in `popup.js` with your contact information as per Crossref's API etiquette guidelines. 