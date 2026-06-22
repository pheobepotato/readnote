# Readnote Setup

Readnote has two parts:

- Chrome extension: the webpage annotation layer.
- Local companion: the local server that handles translation, Obsidian append, and Notion sync.

## 1. Start The Companion

From the project folder:

```bash
npm run companion
```

Then open:

```text
http://127.0.0.1:8791/setup
```

The setup page writes your choices to `.env.local`. This file is ignored by git.

## 2. Configure Translation

Choose a provider:

- DeepSeek: cost-effective for long-page translation.
- OpenAI: useful if you already use OpenAI models.
- MiniMax: optional alternative provider.

Paste your API key and model name in the setup page. Recommended starter value:

```text
Provider: deepseek
Model: deepseek-v4-flash
```

## 3. Configure Obsidian

Create or choose one Markdown file for reading notes, then paste its absolute path:

```text
/Users/you/Documents/Readnote/Reading Notes.md
```

Readnote appends saved excerpts to this one file, grouped by source and date.

## 4. Configure Notion

1. Create a Notion page for reading notes.
2. Create a Notion internal integration.
3. Copy the integration token.
4. Share your reading notes page with that integration.
5. Copy the page id from the page URL.
6. Paste token and page id into Readnote setup.

Notion sync is optional. If token or page id is missing, Readnote still saves to Obsidian when configured.

## 5. Load The Chrome Extension

Build:

```bash
npm run verify:extension
```

Load:

1. Open `chrome://extensions`.
2. Enable `Developer mode`.
3. Click `Load unpacked`.
4. Select the `dist` folder.

## 6. Use It

Open a webpage and click `Translate` to start paragraph-by-paragraph translation. Select text to highlight, underline, write a note, or save an excerpt.
