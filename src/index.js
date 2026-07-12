require('dotenv').config();

const { Client, GatewayIntentBits, Partials, ActivityType, PresenceUpdateStatus } = require('discord.js');
const config = require('./config');
const EventHandler = require('./handlers/EventHandler');
const CommandHandler = require('./handlers/CommandHandler');
const GroqClient = require('./ai/GroqClient');
const ZikeLavalinkManager = require('./music/LavalinkManager');
const Permissions = require('./utils/Permissions');
const db = require('./utils/Database');

console.log('========================================');
console.log('  ZIKE BOT - Starting up...');
console.log('  Built by Arsh (escapingdum)');
console.log('========================================');
console.log('');

// Step 1: Verify environment variables
console.log('[1/5] Checking environment variables...');
const TOKEN = process.env.DISCORD_TOKEN;
if (!TOKEN) {
  console.error('❌ DISCORD_TOKEN is not set in .env file!');
  console.error('   Please copy .env.example to .env and fill in your token.');
  process.exit(1);
}
console.log('   ✅ DISCORD_TOKEN found');
console.log(`   ✅ OWNER_ID: ${process.env.OWNER_ID || '1498693593701945374 (default)'}`);
console.log(`   ✅ GROQ_API_KEY: ${process.env.GROQ_API_KEY ? 'found' : 'NOT SET (AI features disabled)'}`);
console.log(`   ✅ STAFF_ROLE_ID: ${process.env.STAFF_ROLE_ID || 'not set (configure in server)'}`);
console.log(`   ✅ AI_CHAT_CHANNEL_ID: ${process.env.AI_CHAT_CHANNEL_ID || 'not set'}`);

// Step 2: Create Discord client
console.log('[2/5] Creating Discord client...');
const client = new Client({
  intents: config.intents.map(intent => GatewayIntentBits[intent]),
  partials: [
    Partials.Channel,
    Partials.GuildMember,
    Partials.GuildScheduledEvent,
    Partials.Message,
    Partials.Reaction,
    Partials.ThreadMember,
    Partials.User,
  ],
  allowedMentions: {
    parse: ['users', 'roles'],
    repliedUser: true,
  },
});
console.log('   ✅ Discord client created');

// Step 3: Attach services
console.log('[3/5] Loading services...');
client.config = config;
client.db = db;
client.ai = new GroqClient();
client.lavalink = new ZikeLavalinkManager(client);
client.permissions = new Permissions(db);
client.commandHandler = new CommandHandler(client);
client.eventHandler = new EventHandler(client);
console.log('   ✅ All services loaded');

// Step 4: Forward raw voice packets to Lavalink (for music)
// discord.js v14 emits raw events on shards via 'shardCreate'
client.on('shardCreate', (shard) => {
  console.log(`   ✅ Shard ${shard.id} created`);
  shard.on('raw', (packet) => {
    if (['VOICE_STATE_UPDATE', 'VOICE_SERVER_UPDATE'].includes(packet.t)) {
      if (client.lavalink && client.lavalink.manager) {
        client.lavalink.manager.sendRawData(packet);
      }
    }
  });
});

// Global error handlers — these prevent the bot from crashing silently
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:');
  console.error('   Reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:');
  console.error('   Error:', error.message);
  console.error('   Stack:', error.stack);
  // Don't exit — try to keep running
});

process.on('SIGINT', () => {
  console.log('\n👋 Shutting down Zike...');
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Received SIGTERM, shutting down...');
  client.destroy();
  process.exit(0);
});

// Step 5: Load events, THEN login
console.log('[4/5] Loading event handlers...');
client.eventHandler.loadEvents().then(() => {
  console.log('[5/5] Logging in to Discord...');
  return client.login(TOKEN);
}).then(() => {
  console.log('   ✅ Login successful! Waiting for ready event...');
}).catch((error) => {
  console.error('❌ Failed to start bot:');
  console.error('   Error:', error.message);
  if (error.code === 'TokenInvalid') {
    console.error('   Your DISCORD_TOKEN is invalid. Check it at:');
    console.error('   https://discord.com/developers/applications');
  }
  process.exit(1);
});

module.exports = client;
