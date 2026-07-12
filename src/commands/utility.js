const Embeds = require('../utils/Embeds');
const Helpers = require('../utils/Helpers');

// ============================================
// UTILITY COMMANDS (40+ commands)
// ============================================

const utilityCommands = [
  {
    name: 'calc',
    description: 'Calculator',
    category: 'utility',
    permission: 'everyone',
    usage: '<expression>',
    aliases: ['calculate', 'math'],
    async execute(client, message, args) {
      const expr = args.join(' ');
      if (!expr) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike calc <expression>`')], allowedMentions: { repliedUser: false } });
      try {
        // Safe eval - only allow numbers and operators
        if (!/^[0-9+\-*/().\s]+$/.test(expr)) return message.reply({ embeds: [Embeds.error('Error', 'Invalid expression.')], allowedMentions: { repliedUser: false } });
        const result = eval(expr);
        return message.reply({ embeds: [Embeds.primary('🧮 Calculator', `\`${expr}\` = **${result}**`)], allowedMentions: { repliedUser: false } });
      } catch (e) {
        return message.reply({ embeds: [Embeds.error('Error', 'Invalid expression.')], allowedMentions: { repliedUser: false } });
      }
    },
  },
  {
    name: 'time',
    description: 'Show current time',
    category: 'utility',
    permission: 'everyone',
    async execute(client, message) {
      const now = new Date();
      return message.reply({ embeds: [Embeds.primary('🕐 Time', `**UTC:** ${now.toUTCString()}\n**Local:** ${now.toLocaleString()}\n**Timestamp:** <t:${Math.floor(now.getTime() / 1000)}:F>`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'timestamp',
    description: 'Get Discord timestamp',
    category: 'utility',
    permission: 'everyone',
    usage: '<date> [style]',
    async execute(client, message, args) {
      const date = new Date(args[0]);
      if (isNaN(date)) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike timestamp <date>`')], allowedMentions: { repliedUser: false } });
      const ts = Math.floor(date.getTime() / 1000);
      return message.reply({ embeds: [Embeds.primary('📅 Timestamps', `\`<t:${ts}:R>\` → <t:${ts}:R>\n\`<t:${ts}:F>\` → <t:${ts}:F>\n\`<t:${ts}:D>\` → <t:${ts}:D>\n\`<t:${ts}:T>\` → <t:${ts}:T>`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'userid',
    description: 'Get a user\'s ID',
    category: 'utility',
    permission: 'everyone',
    usage: '[@user]',
    async execute(client, message, args) {
      const target = message.mentions.users.first() || message.author;
      return message.reply({ embeds: [Embeds.primary('User ID', `${target.username}'s ID: \`${target.id}\``)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'channelid',
    description: 'Get current channel ID',
    category: 'utility',
    permission: 'everyone',
    async execute(client, message) {
      return message.reply({ embeds: [Embeds.primary('Channel ID', `This channel's ID: \`${message.channel.id}\``)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'serverid',
    description: 'Get server ID',
    category: 'utility',
    permission: 'everyone',
    async execute(client, message) {
      return message.reply({ embeds: [Embeds.primary('Server ID', `This server's ID: \`${message.guild.id}\``)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'roleid',
    description: 'Get a role\'s ID',
    category: 'utility',
    permission: 'everyone',
    usage: '@role',
    async execute(client, message, args) {
      const role = Helpers.resolveRole(message.guild, args[0]);
      if (!role) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike roleid @role`')], allowedMentions: { repliedUser: false } });
      return message.reply({ embeds: [Embeds.primary('Role ID', `${role.name}'s ID: \`${role.id}\``)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'firstmessage',
    description: 'Get the first message in the channel',
    category: 'utility',
    permission: 'everyone',
    async execute(client, message) {
      const messages = await message.channel.messages.fetch({ after: '0', limit: 1 });
      const first = messages.first();
      if (!first) return message.reply({ embeds: [Embeds.error('Error', 'No messages found.')], allowedMentions: { repliedUser: false } });
      return message.reply({ embeds: [Embeds.primary('First Message', `Author: ${first.author}\nContent: ${Helpers.truncate(first.content, 200)}\n[Jump](${first.url})`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'search',
    description: 'Search messages in channel',
    category: 'utility',
    permission: 'moderator',
    usage: '<query>',
    async execute(client, message, args) {
      const query = args.join(' ');
      if (!query) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike search <query>`')], allowedMentions: { repliedUser: false } });
      const messages = await message.channel.messages.fetch({ limit: 100 });
      const found = messages.filter(m => m.content.toLowerCase().includes(query.toLowerCase())).first(5);
      if (found.length === 0) return message.reply({ embeds: [Embeds.info('No Results', 'No messages found.')], allowedMentions: { repliedUser: false } });
      const list = found.map(m => `**${m.author.tag}**: ${Helpers.truncate(m.content, 100)}`).join('\n\n');
      return message.reply({ embeds: [Embeds.info('Search Results', list)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'members',
    description: 'List members in the server',
    category: 'utility',
    permission: 'everyone',
    async execute(client, message) {
      const members = await message.guild.members.fetch();
      const online = members.filter(m => m.presence?.status === 'online');
      const bots = members.filter(m => m.user.bot);
      return message.reply({ embeds: [Embeds.primary('Members', `Total: ${members.size}\nOnline: ${online.size}\nHumans: ${members.size - bots.size}\nBots: ${bots.size}`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'oldestmember',
    description: 'Find the oldest Discord account in the server',
    category: 'utility',
    permission: 'everyone',
    async execute(client, message) {
      const members = await message.guild.members.fetch();
      const sorted = members.filter(m => !m.user.bot).sort((a, b) => a.user.createdAt - b.user.createdAt);
      const oldest = sorted.first();
      return message.reply({ embeds: [Embeds.primary('👴 Oldest Member', `${oldest.user.tag}\nCreated: ${Helpers.discordTimestamp(oldest.user.createdAt)}`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'newestmember',
    description: 'Find the newest member',
    category: 'utility',
    permission: 'everyone',
    async execute(client, message) {
      const members = await message.guild.members.fetch();
      const sorted = members.filter(m => !m.user.bot).sort((a, b) => b.joinedAt - a.joinedAt);
      const newest = sorted.first();
      return message.reply({ embeds: [Embeds.primary('🆕 Newest Member', `${newest.user.tag}\nJoined: ${Helpers.discordTimestamp(newest.joinedAt)}`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'rolelist',
    description: 'List members with a role',
    category: 'utility',
    permission: 'everyone',
    usage: '@role',
    async execute(client, message, args) {
      const role = Helpers.resolveRole(message.guild, args[0]);
      if (!role) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike rolelist @role`')], allowedMentions: { repliedUser: false } });
      const members = role.members.map(m => m.user.tag).join('\n') || 'None';
      return message.reply({ embeds: [Embeds.primary('Role Members', `**${role.name}** (${role.members.size} members)`).addFields({ name: '\u200B', value: Helpers.truncate(members, 1024) })], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'topic',
    description: 'Get current channel topic',
    category: 'utility',
    permission: 'everyone',
    async execute(client, message) {
      return message.reply({ embeds: [Embeds.primary('Channel Topic', message.channel.topic || 'No topic set.')], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'servercount',
    description: 'Count of servers the bot is in',
    category: 'utility',
    permission: 'everyone',
    async execute(client, message) {
      return message.reply({ embeds: [Embeds.primary('Server Count', `Zike is in **${client.guilds.cache.size}** servers!`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'invitebot',
    description: 'Get bot invite link',
    category: 'utility',
    permission: 'everyone',
    async execute(client, message) {
      const link = `https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot`;
      return message.reply({ embeds: [Embeds.primary('Invite Zike', `Click to invite Zike to your server:\n${link}`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'support',
    description: 'Get support info',
    category: 'utility',
    permission: 'everyone',
    async execute(client, message) {
      return message.reply({ embeds: [Embeds.primary('Support', 'Need help with Zike?\n\n• Use `@Zike help` to see all commands\n• Use `@Zike help <category>` to browse\n• Contact Arsh (escapingdum) for assistance')], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'feedback',
    description: 'Send feedback to the bot owner',
    category: 'utility',
    permission: 'everyone',
    usage: '<message>',
    async execute(client, message, args) {
      const text = args.join(' ');
      if (!text) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike feedback <message>`')], allowedMentions: { repliedUser: false } });
      try {
        const owner = await client.users.fetch(client.config.owner.id);
        await owner.send({ embeds: [Embeds.info('Feedback Received', `From: ${message.author.tag} (${message.author.id})\nServer: ${message.guild.name}\n\n${text}`)] });
        return message.reply({ embeds: [Embeds.success('Sent', 'Your feedback has been sent to Arsh!')], allowedMentions: { repliedUser: false } });
      } catch (e) {
        return message.reply({ embeds: [Embeds.error('Error', 'Could not send feedback.')], allowedMentions: { repliedUser: false } });
      }
    },
  },
  {
    name: 'bugreport',
    description: 'Report a bug',
    category: 'utility',
    permission: 'everyone',
    usage: '<bug description>',
    async execute(client, message, args) {
      const text = args.join(' ');
      if (!text) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike bugreport <description>`')], allowedMentions: { repliedUser: false } });
      try {
        const owner = await client.users.fetch(client.config.owner.id);
        await owner.send({ embeds: [Embeds.warning('🐛 Bug Report', `From: ${message.author.tag}\nServer: ${message.guild.name}\n\n${text}`)] });
        return message.reply({ embeds: [Embeds.success('Reported', 'Bug report sent to Arsh!')], allowedMentions: { repliedUser: false } });
      } catch (e) {
        return message.reply({ embeds: [Embeds.error('Error', 'Could not send report.')], allowedMentions: { repliedUser: false } });
      }
    },
  },
  {
    name: 'suggest',
    description: 'Suggest a feature',
    category: 'utility',
    permission: 'everyone',
    usage: '<suggestion>',
    async execute(client, message, args) {
      const text = args.join(' ');
      if (!text) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike suggest <idea>`')], allowedMentions: { repliedUser: false } });
      try {
        const owner = await client.users.fetch(client.config.owner.id);
        await owner.send({ embeds: [Embeds.info('💡 Suggestion', `From: ${message.author.tag}\nServer: ${message.guild.name}\n\n${text}`)] });
        return message.reply({ embeds: [Embeds.success('Sent', 'Suggestion sent to Arsh!')], allowedMentions: { repliedUser: false } });
      } catch (e) {
        return message.reply({ embeds: [Embeds.error('Error', 'Could not send suggestion.')], allowedMentions: { repliedUser: false } });
      }
    },
  },
  {
    name: 'weather',
    description: 'Get weather info (simulated)',
    category: 'utility',
    permission: 'everyone',
    usage: '<city>',
    async execute(client, message, args) {
      const city = args.join(' ');
      if (!city) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike weather <city>`')], allowedMentions: { repliedUser: false } });
      const temp = Math.floor(Math.random() * 30) + 5;
      const conditions = ['☀️ Sunny', '⛅ Partly Cloudy', '☁️ Cloudy', '🌧️ Rainy', '⛈️ Stormy', '❄️ Snowy'];
      return message.reply({ embeds: [Embeds.primary('🌤️ Weather', `Weather for **${city}**:\n\nTemperature: ${temp}°C\nCondition: ${Helpers.random(conditions)}\nHumidity: ${Math.floor(Math.random() * 100)}%\n\n*Note: This is a demo command.*`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'translate',
    description: 'Translate text',
    category: 'utility',
    permission: 'everyone',
    usage: '<language> <text>',
    async execute(client, message, args) {
      const lang = args[0];
      const text = args.slice(1).join(' ');
      if (!lang || !text) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike translate <language> <text>`')], allowedMentions: { repliedUser: false } });
      await message.channel.sendTyping();
      const response = await client.ai.quick(`Translate to ${lang}: ${text}`, 'You are Zike. Translate accurately.');
      return message.reply({ embeds: [Embeds.primary('🌐 Translation', response || 'Translation failed.')], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'define',
    description: 'Get word definition (AI)',
    category: 'utility',
    permission: 'everyone',
    usage: '<word>',
    async execute(client, message, args) {
      const word = args.join(' ');
      if (!word) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike define <word>`')], allowedMentions: { repliedUser: false } });
      await message.channel.sendTyping();
      const response = await client.ai.quick(`Define: ${word}`, 'You are Zike. Define words clearly with examples.');
      return message.reply({ embeds: [Embeds.primary('📖 Definition', response || 'No definition.')], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'randomcolor',
    description: 'Get a random color',
    category: 'utility',
    permission: 'everyone',
    async execute(client, message) {
      const color = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
      return message.reply({ embeds: [Embeds.primary('🎨 Random Color', `Hex: \`${color}\`\nRGB: \`${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}\``).setColor(color)] });
    },
  },
  {
    name: 'hex',
    description: 'Get info about a hex color',
    category: 'utility',
    permission: 'everyone',
    usage: '<hex>',
    async execute(client, message, args) {
      let hex = args[0]?.replace('#', '');
      if (!hex || !/^[0-9a-fA-F]{6}$/.test(hex)) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike hex <#RRGGBB>`')], allowedMentions: { repliedUser: false } });
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return message.reply({ embeds: [Embeds.primary('🎨 Color Info', `Hex: \`#${hex}\`\nRGB: \`rgb(${r}, ${g}, ${b})\`\nDecimal: \`${parseInt(hex, 16)}\``).setColor(`#${hex}`)] });
    },
  },
  {
    name: 'emojiinfo',
    description: 'Get info about an emoji',
    category: 'utility',
    permission: 'everyone',
    usage: '<emoji>',
    async execute(client, message, args) {
      const emoji = args[0];
      if (!emoji) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike emojiinfo <emoji>`')], allowedMentions: { repliedUser: false } });
      const match = emoji.match(/<a?:(\w+):(\d+)>/);
      if (!match) return message.reply({ embeds: [Embeds.error('Error', 'Please provide a custom emoji.')], allowedMentions: { repliedUser: false } });
      const [, name, id] = match;
      const animated = emoji.startsWith('<a:');
      return message.reply({ embeds: [Embeds.primary('Emoji Info', `Name: ${name}\nID: ${id}\nAnimated: ${animated ? 'Yes' : 'No'}\nURL: https://cdn.discordapp.com/emojis/${id}.${animated ? 'gif' : 'png'}`)] });
    },
  },
  {
    name: 'listemojis',
    description: 'List all server emojis as text',
    category: 'utility',
    permission: 'everyone',
    async execute(client, message) {
      const emojis = message.guild.emojis.cache;
      if (emojis.size === 0) return message.reply({ embeds: [Embeds.info('No Emojis', '')], allowedMentions: { repliedUser: false } });
      return message.reply({ content: emojis.map(e => `${e} \`${e.name}\``).join('\n'), allowedMentions: { repliedUser: false } });
    },
  },
];

module.exports = utilityCommands;
