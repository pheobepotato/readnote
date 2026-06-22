# Readnote

Readnote is a local-first Chrome extension for reading the web like a notebook. It lets you translate long English pages paragraph by paragraph, highlight and annotate text on the original page, and save selected excerpts into your own Obsidian and Notion knowledge base.

## What It Does

- Keeps the original webpage as the reading surface.
- Adds paragraph-level Chinese reading aids under English paragraphs when translation is configured.
- Provides a compact selection toolbar for highlight, underline, note, and save.
- Restores your highlights and notes when you reopen the same URL.
- Saves selected excerpts into one continuous Markdown notebook.
- Optionally syncs saved excerpts to a Notion page you control.
- Keeps API keys and notebook paths in local `.env.local`.

## Install

Short-term public install uses GitHub plus a local companion:

```bash
curl -fsSL https://raw.githubusercontent.com/pheobepotato/readnote/main/install.sh | bash
```

For your own fork:

```bash
READNOTE_REPO_URL=https://github.com/yourname/readnote.git bash install.sh
```

The installer builds the Chrome extension and prints the local `dist` path to load in Chrome.

## Setup

Start the companion:

```bash
npm run companion
```

Open:

```text
http://127.0.0.1:8791/setup
```

Configure:

- Local profile name
- Translation provider, model, and API key
- Obsidian Markdown notebook path
- Notion token and page id

Detailed setup steps are in [docs/setup.md](docs/setup.md).

## Chrome Extension

Load the extension:

1. Open `chrome://extensions`.
2. Enable `Developer mode`.
3. Click `Load unpacked`.
4. Select the generated `dist` folder.

## Development

```bash
npm install
npm test
npm run check
npm run verify:extension
npm run audit:secrets
```

## Privacy

Readnote is local-first. Highlights and page translation cache stay in Chrome local storage. Excerpts sync only to destinations you configure. Translation sends paragraph text to the model provider you choose. See [docs/privacy.md](docs/privacy.md).
