# 🐕 Zike — AI-Powered All-in-One Discord Bot

**Built by Arsh (escapingdum)**

Zike is a crazy AI-powered Discord bot that's fiercely loyal to its owner. It has **420+ commands** across 18 categories, with no slash commands — everything is triggered by pinging the bot!

## ✨ Features

### 🤖 AI Integration (Groq)
- **Random/Human-like chat** in general channels (for whitelisted users)
- **Focused AI chat** in the dedicated #ai-chat channel
- 24+ AI commands: ask, story, poem, code, translate, summarize, and more
- Contextual conversation memory

### 🔨 Moderation (65 commands)
- Ban, unban, softban, tempban, massban
- Kick, masskick
- Mute, unmute, voicemute, deafen
- Warn system with cases
- Purge (messages, user, bots, links, images, mentions, embeds)
- Lock/unlock channels and server
- Role management (add, remove, create, delete, info)
- And much more!

### 🛡️ Security (37 commands)
- **Anti-Nuke**: Detects and reverses mass bans, channel/role deletion
- **Anti-Raid**: Kicks new members during raid mode
- **Lockdown**: Lock entire server instantly
- **Quarantine**: Isolate suspicious members
- **AutoMod**: Bad words, links, invites, mentions filtering
- **Security Audit**: Scan for dangerous permissions
- Whitelist/blacklist system
- Server backups

### 🎫 Ticket System (14 commands)
- Button-based ticket creation
- Claim, close, add, remove, rename
- Transcript generation
- Custom panels
- Statistics

### 📨 Invite Tracker (13 commands)
- Track who invited whom
- Invite leaderboard
- Fake invite detection
- Invite rewards (auto-role at X invites)
- Add/remove/reset invites

### ✅ Verification System (12 commands)
- Button or captcha verification
- Custom verification messages
- Mass verify
- List unverified members

### 🎮 Games (31 commands)
- 8ball, coinflip, dice, slots
- Tic-tac-toe, hangman, connect 4, wordle
- Trivia, math game, typing test
- Higher/lower, scramble, anagram
- Would you rather, truth or dare, never have I ever
- Blackjack, gamble, lottery
- And more!

### 💰 Economy (21 commands)
- Balance, daily, weekly, monthly rewards
- Work, crime, rob
- Gamble, lottery, slots
- Deposit, withdraw, pay
- Shop, buy, inventory
- Leaderboards

### 📊 Leveling (11 commands)
- XP and levels from chatting
- Level-up announcements
- Level rewards (auto-role at level X)
- Leaderboards
- Admin controls

### 🎁 Rewards & Giveaways (8 commands)
- Start/end/reroll giveaways
- Mass rewards (coins or roles)
- Giveaway management

### ⚙️ Server Management (26 commands)
- Server info, icon, banner, emojis, roles, channels
- Create/delete channels and categories
- Set server name, icon, banner
- Auto-role setup
- Self-assignable roles
- Emoji management
- AFK settings

### 🎉 Fun (57 commands)
- Avatar, banner, ship, roast, compliment
- Emotes: hug, kiss, slap, pat, dance, etc.
- Rate commands: gay, simp, smart, hot, stank
- Text tools: reverse, mock, vaporwave, binary, morse
- And more!

### 🛠️ Utility (46 commands)
- Calculator, timestamp, weather
- User/server/channel info
- Search messages, snipe
- Random color, hex info
- Ping, stats, uptime
- And more!

### 👑 Owner Commands (21 commands)
- Set status, activity, name, avatar
- Broadcast to all servers
- Eval, reload, shutdown, restart
- Whitelist users for AI
- Database management
- Server management

### 👋 Welcome System (8 commands)
- Custom welcome/goodbye messages
- Test commands
- Channel configuration

### 📝 Logging (12 commands)
- Mod, server, member, message, voice, role, channel, invite, boost logs
- Audit log viewer

### 🎵 Music (24 commands) — Lavalink Powered
- **Uses PUBLIC FREE Lavalink nodes — no setup required!**
- Play, pause, resume, stop, skip
- Queue, now playing with progress bar
- Volume, seek, remove tracks
- Shuffle, repeat (track/queue), move tracks
- Skip to position, play previous
- Audio filters (nightcore, bassboost, vaporwave, 8d, etc.)
- Speed control
- Node status checker
- Lyrics (AI-generated)
- Supports YouTube, Spotify, and more!

**Music commands include:**
`play`, `pause`, `resume`, `stop`, `skip`, `queue`, `nowplaying`, `volume`, `lyrics`, `shuffle`, `repeat`, `join`, `leave`, `seek`, `remove`, `clearqueue`, `movetrack`, `skipto`, `history`, `playprevious`, `filters`, `clearfilters`, `speed`, `nodes`

#### About Public Lavalink Nodes
The bot comes pre-configured with 5 public free Lavalink nodes. These are community-provided and may occasionally be unavailable. The bot will automatically failover to the next available node.

To use your own Lavalink node or different public ones, set `LAVALINK_NODES` in `.env`:
```
LAVALINK_NODES=myNode|host|port|password|secure,backup|host2|port2|password2|secure2
```

Find more public nodes at:
- https://lavalink.darrennathanael.com/
- https://lavalink-list.benoi.fr/

## 🚀 Setup

### 1. Get Required Tokens
- **Discord Bot Token**: https://discord.com/developers/applications
- **Groq API Key**: https://console.groq.com/keys

### 2. Configure .env
Copy `.env.example` to `.env` and fill in:
```env
DISCORD_TOKEN=your_bot_token
GROQ_API_KEY=your_groq_key
OWNER_ID=1498693593701945374
STAFF_ROLE_ID=your_staff_role_id
AI_CHAT_CHANNEL_ID=your_ai_channel_id
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Locally
```bash
npm start
```

## 🚂 Deploy to Railway

1. Go to [Railway.app](https://railway.app)
2. Create new project from GitHub repo
3. Set environment variables (from .env.example)
4. Railway will automatically:
   - Install dependencies (`npm install`)
   - Start the bot (`npm start`)
5. The `railway.json` and `Procfile` are already configured!

### Required Environment Variables for Railway
- `DISCORD_TOKEN`
- `GROQ_API_KEY`

---

## 🐳 Deploy with Docker

The bot comes with a complete Docker setup — `Dockerfile`, `docker-compose.yml`, and `.dockerignore` are all included.

### Quick Start with Docker Compose (Recommended)

```bash
# 1. Copy .env.example to .env and fill in your tokens
cp .env.example .env
# Edit .env with your tokens

# 2. Build and start the bot
docker-compose up -d

# 3. View logs
docker-compose logs -f

# 4. Stop the bot
docker-compose down
```

### Manual Docker Build

```bash
# 1. Build the image
docker build -t zike-bot .

# 2. Run the container
docker run -d \
  --name zike \
  --restart=always \
  --env-file .env \
  -v zike-data:/app/data \
  zike-bot

# 3. View logs
docker logs -f zike

# 4. Stop and remove
docker stop zike && docker rm zike
```

### Docker Features

- **Lightweight image** — Uses `node:20-slim` base
- **Persistent data** — Database stored in named volume `zike-data`
- **Auto-restart** — Container restarts automatically on crash
- **Resource limits** — Memory capped at 512MB, 1 CPU
- **Log rotation** — Max 10MB per log file, 3 files kept
- **Health check** — Container health monitored every 60s

### Deploy to Docker Hosting Platforms

The Dockerfile works on any container hosting platform:
- **[Railway](https://railway.app)** — Auto-detects Dockerfile
- **[Render](https://render.com)** — Choose "Docker" as environment
- **[Fly.io](https://fly.io)** — `fly launch` then `fly deploy`
- **[DigitalOcean App Platform](https://www.digitalocean.com/products/app-platform)**
- **[Google Cloud Run](https://cloud.google.com/run)**
- **[AWS ECS/Fargate](https://aws.amazon.com/ecs/)**
- **Any VPS** with Docker installed

### Environment Variables for Docker

Same as Railway — set all variables from `.env.example` either via `--env-file` or in your hosting platform's dashboard.

### Docker Volume for Data Persistence

The bot stores its database in `/app/data` inside the container. The `docker-compose.yml` creates a named volume `zike-data` to persist this data across container restarts.

**Backup data:**
```bash
docker run --rm -v zike-data:/data -v $(pwd):/backup alpine tar czf /backup/zike-data-backup.tar.gz -C /data .
```

**Restore data:**
```bash
docker run --rm -v zike-data:/data -v $(pwd):/backup alpine tar xzf /backup/zike-data-backup.tar.gz -C /data
```

### Required Environment Variables for Railway/Docker
- `DISCORD_TOKEN`
- `GROQ_API_KEY`
- `OWNER_ID`
- `STAFF_ROLE_ID`
- `AI_CHAT_CHANNEL_ID`
- `AI_WHITELIST` (comma-separated user IDs)

## 📖 How to Use

### Basic Usage
Just **ping the bot** with a command:
```
@Zike help                    # Show all commands
@Zike help moderation         # Show moderation commands
@Zike ban @user reason        # Ban a user
@Zike ping                    # Check latency
```

### AI Chat
- **In #ai-chat channel**: Just type normally — no ping needed!
- **In other channels**: Ping the bot with your message
- **Reply to bot**: Continue the conversation by replying

### Permission Levels
- 👑 **Owner** (you): Access to ALL commands
- 🛡️ **Staff** (set with `@Zike setstaffrole @role`): Most commands
- ⚡ **Admin**: Server admin commands
- 🔨 **Moderator**: Moderation commands
- 👤 **Everyone**: Basic commands (games, fun, etc.)

### Setup Staff Role
```
@Zike setstaffrole @StaffRole
```
Anyone with this role can use all staff commands.

### Setup AI Chat
1. Create a channel called `#ai-chat`
2. Set its ID in `.env` as `AI_CHAT_CHANNEL_ID`
3. The bot will respond to every message in that channel (focused AI mode)

### Setup Verification
```
@Zike verifysetup #verify-channel @VerifiedRole button
```

### Setup Tickets
```
@Zike ticketsetup #ticket-channel
```

### Setup Anti-Nuke
```
@Zike antinukeon
@Zike antinukelog #log-channel
@Zike antinukelimits ban 3
```

### Setup Welcome
```
@Zike welcome on #welcome
@Zike welcomemessage Welcome {user} to {server}! You are member #{count}.
```

## 🎨 Embed Design

All embeds use a beautiful, consistent design:
- **Primary**: Vibrant purple (#8B5CF6)
- **Success**: Emerald green (#10B981)
- **Error**: Red (#EF4444)
- **Warning**: Amber (#F59E0B)
- **Info**: Blue (#3B82F6)
- **Gold**: For premium/giveaways (#FBBF24)

## 📁 Project Structure

```
zike-bot/
├── .env.example          # Environment template
├── .gitignore
├── .dockerignore         # Docker build exclusions
├── Dockerfile            # Docker image definition
├── docker-compose.yml    # Docker Compose config
├── package.json
├── railway.json          # Railway deployment config
├── Procfile
├── README.md
├── src/
│   ├── index.js          # Main entry point
│   ├── config.js         # Bot configuration
│   ├── ai/
│   │   └── GroqClient.js # Groq AI integration
│   ├── music/
│   │   └── LavalinkManager.js # Public Lavalink nodes
│   ├── handlers/
│   │   ├── CommandHandler.js
│   │   └── EventHandler.js
│   ├── utils/
│   │   ├── Embeds.js     # Beautiful embed builder
│   │   ├── Permissions.js # Permission system
│   │   ├── Database.js   # JSON-based storage
│   │   └── Helpers.js    # Utility functions
│   ├── events/
│   │   ├── ready.js
│   │   ├── messageCreate.js    # Main message handler
│   │   ├── guildMemberAdd.js   # Welcome + invite tracking
│   │   ├── guildMemberRemove.js
│   │   ├── guildBanAdd.js      # Anti-nuke bans
│   │   ├── guildBanRemove.js
│   │   ├── channelCreate.js    # Anti-nuke channels
│   │   ├── channelDelete.js
│   │   ├── roleCreate.js       # Anti-nuke roles
│   │   ├── roleDelete.js
│   │   ├── messageDelete.js    # Snipe feature
│   │   └── interactionCreate.js # Buttons (tickets, verify, giveaways)
│   └── commands/
│       ├── help.js
│       ├── moderation.js     (65 commands)
│       ├── security.js       (37 commands)
│       ├── ticket.js         (14 commands)
│       ├── invite.js         (13 commands)
│       ├── verification.js   (12 commands)
│       ├── games.js          (31 commands)
│       ├── economy.js        (21 commands)
│       ├── leveling.js       (11 commands)
│       ├── rewards.js        (8 commands)
│       ├── server.js         (26 commands)
│       ├── ai.js             (24 commands)
│       ├── fun.js            (57 commands)
│       ├── utility.js        (46 commands)
│       ├── owner.js          (21 commands)
│       ├── welcome.js        (8 commands)
│       ├── logging.js        (12 commands)
│       ├── music.js          (24 commands)
│       ├── extra.js          (more commands)
│       └── more.js           (more commands)
└── data/                # Database files (auto-created)
```

## 🤖 Bot Intents

The bot requires ALL privileged intents:
- Message Content
- Server Members
- Presence
- Server Boosts

Enable these in the Discord Developer Portal under your bot's settings.

## 📜 License

MIT License — Built by Arsh (escapingdum)

## 💜 Credits

- **Owner & Creator**: Arsh (escapingdum) — Discord ID: 1498693593701945374
- **AI**: Groq (llama-3.3-70b-versatile)
- **Library**: discord.js v14

---

**Zike** — Your loyal AI companion. Built by Arsh.
