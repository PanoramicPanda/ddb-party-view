# D&D Beyond Party View

D&D Beyond Party View is a TaleSpire Symbiote designed to provide a detailed view of character stats, health, and status within the game. This tool allows Dungeon Masters and players to keep track of important metrics in real-time.

## Features

- Real-time health and status tracking for characters.
- Ability to manually override AC bonuses.
- Configurable API endpoint for fetching character data.
- Seamless integration with TaleSpire's campaign data storage.

## Installation Instructions

- Open the Mod.io Symbiote Browser within TaleSpire.
- Search for "Party View".
- Install the Symbiote!
- **Have an API Proxy setup, I will not provide one** (see below for steps to help you do that).

## Usage

- Open TaleSpire and load your campaign.
- Access the Symbiote through the in-game browser.
- Configure your API endpoint and character IDs through the settings menu.
- Save your settings to the TaleSpire campaign storage.

## In Symbiote Options
### API Endpoint

You need to provide an API Proxy Endpoint for the Symbiote to hit in order for it to work at all. **This is a cruical step**. This should be an API Proxy that can hit `https://character-service.dndbeyond.com/character/v5/character/<character id>`, and uses the `?character=` parameter to fully form the URL.

The API proxy endpoint should be able to accept a `?character=` query parameter to fetch character data. Do not include `?character=` in the setting field (it's added by the grabber script).

For example, if I set up my proxy to be `http://proxy-test.example/api` then it should be able to accept `http://proxy-test.example/api?character=48690485` and would redirect to `https://character-service.dndbeyond.com/character/v5/character/48690485`. When supplied to the Symbiote's settings window, I'd only input `http://proxy-test.example/api`.

For more on setting up your own proxy, give this article a read: <https://jakemccambley.medium.com/fixing-cors-errors-when-working-with-3rd-party-apis-a69dc5474804>. I recommend using Heroku as the server backend, just as the article does.

### Character IDs

Character IDs should be provided as a comma-separated list in the settings. Ensure each ID is a valid number. You can find these as part the url to the character sheet. You can test if its the right number by hitting `https://character-service.dndbeyond.com/character/v5/character/<character id>` with your browser.

### Manual AC Bonuses

Manual AC bonuses can be added as comma-separated arrays in the format `["character name", ac_bonus]`. This allows you to manually adjust the AC for specific characters if needed.

---
Anything down here you only need to worry about if you want to add to the Symbiote development or modify it for personal use.

## Development Prerequisites

- Node.js
- TaleSpire
- A Proxy to fetch D&D Beyond character data

## Installation for Development/Outside of TaleSpire

1. Clone the repository:

```bash
git clone https://github.com/yourusername/ts-party-summary.git
cd ts-party-summary
```

2. Install dependencies:

```bash
npm install
```

3. Deploy to TaleSpire:

```bash
npm run deploy
```
