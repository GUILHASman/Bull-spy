# 🐂 Bull-Spy

> Discord bot for detecting cheat server members in real-time, with analytics, whitelist management, and usage controls.

---

## 📌 What it does

**Bull-Spy** monitors Discord servers and checks whether a user is a member of known cheat servers. It works in two modes:

- **Manual** — staff or public users run `!check <ID>` to look up a Discord user
- **Automatic** — the bot watches a join-log channel for Discord IDs and triggers a live check instantly

Detections are logged to a Supabase database for analytics and history tracking.

---

## ⚙️ Features

- 🔍 **Real-time member lookup** across multiple cheat servers
- ⚪ **Whitelist system** — mark trusted users to skip alerts
- 🚨 **Danger role highlighting** — flags roles like `Customer`, `Buyer`, `VIP`, etc.
- 📊 **Detection history & rankings** — top offenders and most active staff
- 🔢 **Usage limits** — public users capped at 10 free checks
- 📝 **Staff logging** — every check is logged to a private staff channel
- 🌐 **Bilingual support** — responses in Portuguese and English depending on channel
- 🔔 **Guild removal alerts** — notifies staff if the bot is kicked from a monitored server

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js ≥ 20.18 |
| Discord | discord.js-selfbot-v13 |
| Database | Supabase (PostgreSQL) |
| Config | dotenv |

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/LimaDev-01/Bull-spy.git
cd Bull-spy
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```env
DISCORD_TOKEN=your_discord_token_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key
MAIN_GUILD_ID=your_main_guild_id
ALERT_CHANNEL_ID=channel_id_for_alerts
JOIN_LOGS_CHANNEL_ID=channel_id_to_monitor
```

### 4. Set up the database

Run the SQL in `supabase_schema.sql` via the [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql).

### 5. Start the bot

```bash
node index.js
```

---

## 💬 Commands

| Command | Aliases | Description | Access |
|---|---|---|---|
| `!check <ID>` | `!checar`, `!verificar` | Check if a Discord ID is in cheat servers | Public (10 uses) / Staff (unlimited) |
| `!whitelist` | — | Manage the whitelist (`add`, `remove`, `list`) | Staff only |
| `!listservers` | — | List all monitored cheat servers | Staff only |
| `!stats [ID]` | `!historico`, `!registos` | View detection history | Staff only |
| `!top` | `!ranking`, `!melhores` | Top offenders and most active staff | Staff only |
| `!commands` | `!help`, `!ajuda` | List all available commands | All |

---

## 🗄️ Database Schema

```
cheat_servers     — Monitored server IDs and names
whitelist         — Trusted users excluded from alerts
detection_logs    — History of detected users (auto + manual)
user_usage        — Public user check usage tracking
server_members    — Legacy cache table
```

---

## 📁 Project Structure

```
bull-spy/
├── commands/
│   ├── check.js          # Main lookup command
│   ├── whitelist.js      # Whitelist management
│   ├── listservers.js    # List monitored servers
│   ├── stats.js          # Detection history
│   ├── top.js            # Rankings
│   └── help.js           # Command list
├── events/
│   ├── messageCreate.js  # Command handler + auto-detection
│   ├── guildDelete.js    # Bot removal alert
│   └── ready.js          # Startup log
├── database/
│   └── supabase.js       # All DB operations
├── config/
│   └── index.js          # Environment config
├── supabase_schema.sql   # Database setup
└── index.js              # Entry point
```

---

## ⚠️ Disclaimer

This project uses `discord.js-selfbot-v13`, which operates as a **self-bot**. Self-bots violate Discord's Terms of Service. Use at your own risk and only in environments where you have explicit permission to do so.

---

## 👤 Author

**Guilherme Lima** · [github.com/LimaDev-01](https://github.com/LimaDev-01)
