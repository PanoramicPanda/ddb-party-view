# D&D Beyond Party View

D&D Beyond Party View is a TaleSpire Symbiote designed to provide a detailed view of character stats, health, and status within the game. This tool allows Dungeon Masters and players to keep track of important metrics in real-time.

## Features

- Real-time health and status tracking for characters.
- Ability to manually override AC bonuses.
- Configurable API endpoint for fetching character data.
- Seamless integration with TaleSpire's campaign data storage.

## Prerequisites

- Node.js
- TaleSpire
- A Proxy to fetch D&D Beyond character data

## Installation

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
## Usage

- Open TaleSpire and load your campaign.
- Access the Symbiote through the in-game browser.
- Configure your API endpoint and character IDs through the settings menu.
- Save your settings to the TaleSpire campaign storage.

## Configuration
### API Endpoint

The API endpoint should be able to accept a `?characterId=` query parameter to fetch character data. Do not include `?characterId=` in this field (it's added by the grabber script).

This should be an API Proxy that can hit `https://character-service.dndbeyond.com/character/v3/character/<character id>`, and uses the `?characterId=` parameter to fully form the URL.

For more on setting up your own, give this article a read: <https://jakemccambley.medium.com/fixing-cors-errors-when-working-with-3rd-party-apis-a69dc5474804>

### Character IDs

Character IDs should be provided as a comma-separated list in the settings. Ensure each ID is a valid number.

### Manual AC Bonuses

Manual AC bonuses can be added as comma-separated arrays in the format `["character name", ac_bonus]`. This allows you to manually adjust the AC for specific characters if needed.
