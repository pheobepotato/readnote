# Readnote Privacy

Readnote is designed as a local-first tool.

## Local Data

The Chrome extension stores annotations and translation cache in Chrome local storage. The companion stores your setup in `.env.local`. This file is ignored by git and should not be shared.

## Translation

When you click `Translate`, Readnote sends paragraph text from the current page to the translation provider you configured. The provider receives the selected source title, URL, and paragraph text needed to produce the translation.

## Obsidian

When Obsidian is configured, Readnote appends saved excerpts to the Markdown file path you provide. It does not scan your vault.

## Notion

When Notion is configured, Readnote appends saved excerpts to the page id you provide using your Notion integration token. It does not access other pages unless your integration and Notion permissions allow it.

## Secrets

Do not commit `.env.local`. Before publishing or opening a pull request, run:

```bash
npm run audit:secrets
```
