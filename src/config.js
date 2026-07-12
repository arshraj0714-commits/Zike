require('dotenv').config();

module.exports = {
  // Bot Identity
  name: process.env.BOT_NAME || 'Zike',
  owner: {
    id: process.env.OWNER_ID || '1498693593701945374',
    username: process.env.OWNER_USERNAME || 'escapingdum',
    name: process.env.OWNER_NAME || 'Arsh',
  },

  // Staff role (set this role ID in .env - anyone with this role can use all commands)
  staffRoleId: process.env.STAFF_ROLE_ID || null,

  // AI Configuration
  ai: {
    apiKey: process.env.GROQ_API_KEY,
    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    chatChannelId: process.env.AI_CHAT_CHANNEL_ID || null,
    whitelist: (process.env.AI_WHITELIST || '1498693593701945374').split(',').filter(Boolean),
    generalPersonality: process.env.AI_GENERAL_PERSONALITY || 'random',
    channelPersonality: process.env.AI_CHANNEL_PERSONALITY || 'focused',
  },

  // Colors for embeds (Beautiful palette)
  colors: {
    primary: 0x8B5CF6,    // Vibrant purple
    secondary: 0xEC4899,  // Hot pink
    success: 0x10B981,    // Emerald green
    danger: 0xEF4444,     // Red
    warning: 0xF59E0B,    // Amber
    info: 0x3B82F6,       // Blue
    gold: 0xFBBF24,       // Gold
    dark: 0x1F2937,       // Dark slate
    blurple: 0x5865F2,    // Discord blurple
  },

  // Emojis
  emojis: {
    success: '<:success:1084358758328705085>',
    error: '<:error:1084358756137545748>',
    warning: '<:warning:1084358754517385226>',
    info: '<:info:1084358753102315540>',
    loading: '<a:loading:1084358750982754314>',
    owner: '<:owner:1084358750982754315>',
    staff: '<:staff:1084358750982754316>',
    online: '<:online:1084358750982754317>',
    shield: '<:shield:1084358750982754318>',
    crown: '<:crown:1084358750982754319>',
    heart: '<:heart:1084358750982754320>',
    star: '<:star:1084358750982754321>',
    diamond: '<:diamond:1084358750982754322>',
  },

  // Status
  status: process.env.BOT_STATUS || 'online',
  activity: {
    type: process.env.BOT_ACTIVITY_TYPE || 'WATCHING',
    text: process.env.BOT_ACTIVITY_TEXT || 'over the server | @Zike help',
  },

  // Data directory
  dataDir: process.env.DATA_DIR || './data',

  // Intents needed
  intents: [
    'Guilds',
    'GuildMembers',
    'GuildMessages',
    'GuildMessageReactions',
    'GuildMessageTyping',
    'GuildPresences',
    'GuildVoiceStates',
    'GuildInvites',
    'GuildBans',
    'GuildEmojisAndStickers',
    'GuildIntegrations',
    'GuildWebhooks',
    'MessageContent',
    'DirectMessages',
    'DirectMessageReactions',
    'DirectMessageTyping',
  ],
};
