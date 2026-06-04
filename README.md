# League of Legends Randomizer

A web service for **Ultimate Bravery** — the well-known community challenge in League of Legends in which a player must assemble a fully random build and play only with it. With a single button press the app generates a random setup: champion, role, summoner spells, runes, items, ability leveling order, and a champion to ban.

> One click on **REROLL** gives you a fully random — yet playable — setup: it accounts for the role, item conflicts, and champion specifics. The rest is up to you: win the game.

---

## What is Ultimate Bravery

Ultimate Bravery is a self-imposed challenge: a dedicated generator hands out a random champion, summoner spells, runes, item build, and ability leveling order, and the player must strictly follow that set for the entire game. This service automates the generation and makes it "fair": it respects the role, never hands out conflicting items, and surfaces important build nuances.

---

## Features

- **A full random build in one roll:**
  - champion (background art + name on the main card);
  - role — Top / Jungle / Mid / Bot / Support;
  - two summoner spells (in Jungle the first is always Smite);
  - runes: primary and secondary branches, 4 primary runes, 2 secondary runes, and 3 stat shards — with the selected ones highlighted;
  - items: starting item, boots, and 5 legendaries (6 for Bot);
  - ability leveling order (Q / W / E);
  - a champion to ban.
- **Role filter** — buttons to the left of the card. A click locks a single role, a second click clears the filter (then the role is chosen from all).
- **"No repeats" toggle** — the champion does not repeat within the last 10 rolls.
- **"Boots start" toggle** — allows boots as the starting item.
- **Roll history** — the last 15 generations are saved to `localStorage`. Clicking a champion name in the history restores the entire build on the main card.
- **Smart item selection:**
  - **conflict** handling — mutually exclusive items (for example, Lich Bane / Trinity Force / Iceborn Gauntlet) never end up in the same build;
  - **star indicators** above items with unique passives (Spellblade, Manaflow, Hydra, etc.) with a tooltip on hover;
  - Runaan's Hurricane is flagged as "ranged only" and is not handed to melee champions.
- **Tooltips** with the names of items, runes, summoners, and the role on hover.
- **Aphelios special case** — instead of Q / W / E the abilities show AD / AS / ArP labels.

---

## Tech stack

- **Backend:** Python 3.9, [Flask](https://flask.palletsprojects.com/) — serves a single page and passes the lists of champions, items, runes, etc. to the frontend.
- **Frontend:** vanilla JavaScript (no frameworks), HTML, CSS.
- **Storage:** browser `localStorage` (roll history).
- **Templates:** Jinja2 (`templates/base.html`).

Data is passed from Flask to the frontend through the `data-*` attributes of a hidden container, while all of the randomization logic runs on the client in [`static/main.js`](static/main.js).

---

## Project structure

```
lolrandomizer/
├── app.py                  # Flask app: champion/item/rune lists, page rendering
├── templates/
│   ├── base.html           # main page markup
│   └── index.html          # extends base.html
├── static/
│   ├── main.js             # all randomization, history, and UI logic
│   ├── main_page1..4.css   # styles
│   ├── fonts.css           # fonts
│   └── images/             # assets
│       ├── character_arts/     # champion arts (card background)
│       ├── character_icons/    # champion icons (ban)
│       ├── abilities/<champ>/  # ability icons (q/w/e) per champion folder
│       ├── items/
│       │   ├── start/{common,jungle,support}/  # starting items per role
│       │   ├── boots/                          # boots
│       │   └── legendary/                      # legendary items
│       ├── runes/
│       │   ├── branches/   # 5 rune branches
│       │   ├── core/       # primary runes per branch
│       │   ├── additional/ # secondary runes per branch
│       │   └── shards/     # stat shards
│       ├── roles/          # role icons
│       ├── summoners/      # summoner spells
│       └── others/         # logos, star, icons
└── README.md
```

---

## Running

Requires **Python 3.9+** installed.

```bash
# 1. Clone the repository
git clone https://github.com/Junkenrat/League-of-Legends-Randomizer.git
cd League-of-Legends-Randomizer

# 2. Create and activate a virtual environment
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# 3. Install dependencies
pip install Flask

# 4. Run the app
python app.py
```

Once started, the app is available at **http://127.0.0.1:5000/**.

> By default the app runs in debug mode (`debug=True`). For production, disable it and use a WSGI server (for example, `gunicorn` or `waitress`).

---

## How it works

1. On a request for the main page, Flask (`app.py`) builds the lookup data: the champion list with attack type (`m` — melee, `r` — ranged), legendary items, starting items per role, boots, runes, summoners — and passes them into the template.
2. The template stores this data in the `data-*` attributes of the hidden `#data-container`.
3. On page load and on every click of **REROLL** the script [`static/main.js`](static/main.js):
   - picks a role (respecting the active filters);
   - selects the champion, summoners, runes, items, and abilities per the rules below;
   - updates the UI and the rune highlighting;
   - saves the roll into history (`localStorage`, up to 15 entries — a ring buffer).

### Generation rules

- **The role affects the item pool:** dedicated starting items for Jungle and Support; Bot gets 6 legendaries instead of 5; Support gets 4.
- **Jungle** always gets Smite as the first summoner.
- **Item conflicts** (`conflicts` in `main.js`) — a candidate is skipped if a mutually exclusive item is already in the build.
- **Champion type:** Runaan's Hurricane is never handed to melee champions.
- **Bloodsong (Support):** with that starting item, Trinity Force / Iceborn Gauntlet / Lich Bane are excluded from the pool.
- **The ban** cannot match the selected champion.

---

## Disclaimer

League of Legends and all related assets (champion, item, and rune icons) are the property of **Riot Games, Inc.** This is a fan-made project and is not affiliated with Riot Games. Images are used for non-commercial purposes only.
