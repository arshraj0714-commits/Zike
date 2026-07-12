const Embeds = require('../utils/Embeds');
const Helpers = require('../utils/Helpers');
const config = require('../config');

// ============================================
// OWNER-ONLY COMMANDS (30+ commands)
// ============================================

const ownerCommands = [
  {
    name: 'setstatus',
    description: 'Set bot status',
    category: 'owner',
    permission: 'owner',
    usage: '<online|idle|dnd|invisible>',
    async execute(client, message, args) {
      const status = args[0]?.toLowerCase();
      if (!['online', 'idle', 'dnd', 'invisible'].includes(status)) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike setstatus <online|idle|dnd|invisible>`')], allowedMentions: { repliedUser: false } });
      const { PresenceUpdateStatus } = require('discord.js');
      client.user.setStatus(PresenceUpdateStatus[status]);
      return message.reply({ embeds: [Embeds.success('Status Set', `Status is now ${status}.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'setactivity',
    description: 'Set bot activity',
    category: 'owner',
    permission: 'owner',
    usage: '<type> <text>',
    async execute(client, message, args) {
      const type = args[0]?.toUpperCase();
      const text = args.slice(1).join(' ');
      const validTypes = ['PLAYING', 'WATCHING', 'LISTENING', 'STREAMING', 'COMPETING'];
      if (!validTypes.includes(type) || !text) return message.reply({ embeds: [Embeds.error('Usage', `\`@Zike setactivity <${validTypes.join('|')}> <text>\``)], allowedMentions: { repliedUser: false } });
      const { ActivityType } = require('discord.js');
      client.user.setActivity(text, { type: ActivityType[type] });
      return message.reply({ embeds: [Embeds.success('Activity Set', `Activity: ${type} ${text}`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'setname',
    description: 'Change bot username',
    category: 'owner',
    permission: 'owner',
    usage: '<new name>',
    async execute(client, message, args) {
      const name = args.join(' ');
      if (!name) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike setname <new name>`')], allowedMentions: { repliedUser: false } });
      try {
        await client.user.setUsername(name);
        return message.reply({ embeds: [Embeds.success('Name Changed', `Bot username is now ${name}.`)], allowedMentions: { repliedUser: false } });
      } catch (e) {
        return message.reply({ embeds: [Embeds.error('Error', e.message)], allowedMentions: { repliedUser: false } });
      }
    },
  },
  {
    name: 'setavatar',
    description: 'Change bot avatar',
    category: 'owner',
    permission: 'owner',
    usage: '<URL or attachment>',
    async execute(client, message, args) {
      const url = message.attachments.first()?.url || args[0];
      if (!url) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike setavatar <URL>`')], allowedMentions: { repliedUser: false } });
      try {
        await client.user.setAvatar(url);
        return message.reply({ embeds: [Embeds.success('Avatar Changed', 'Bot avatar updated.')], allowedMentions: { repliedUser: false } });
      } catch (e) {
        return message.reply({ embeds: [Embeds.error('Error', e.message)], allowedMentions: { repliedUser: false } });
      }
    },
  },
  {
    name: 'leave',
    description: 'Make the bot leave a server',
    category: 'owner',
    permission: 'owner',
    usage: '<server ID>',
    async execute(client, message, args) {
      const guildId = args[0];
      if (!guildId) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike leave <server ID>`')], allowedMentions: { repliedUser: false } });
      const guild = client.guilds.cache.get(guildId);
      if (!guild) return message.reply({ embeds: [Embeds.error('Not Found', 'Bot is not in that server.')], allowedMentions: { repliedUser: false } });
      await guild.leave();
      return message.reply({ embeds: [Embeds.success('Left', `Left ${guild.name}.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'servers',
    description: 'List all servers the bot is in',
    category: 'owner',
    permission: 'owner',
    async execute(client, message) {
      const guilds = client.guilds.cache.map(g => `**${g.name}** (${g.id}) — ${g.memberCount} members`).join('\n');
      const chunks = Helpers.chunkText(guilds, 1024);
      const embeds = chunks.map(chunk => Embeds.owner('Bot Servers', chunk));
      return message.reply({ embeds, allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'broadcast',
    description: 'Send a message to all servers',
    category: 'owner',
    permission: 'owner',
    usage: '<message>',
    async execute(client, message, args) {
      const text = args.join(' ');
      if (!text) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike broadcast <message>`')], allowedMentions: { repliedUser: false } });
      let sent = 0, failed = 0;
      const status = await message.reply({ embeds: [Embeds.loading('Broadcasting', 'Sending to all servers...')] });
      for (const [, guild] of client.guilds.cache) {
        const channel = guild.systemChannel || guild.channels.cache.find(c => c.type === 0 && c.permissionsFor(guild.members.me)?.has('SendMessages'));
        if (channel) {
          try {
            await channel.send({ embeds: [Embeds.primary('📢 Broadcast', text).setFooter({ text: `From Arsh (owner)` })] });
            sent++;
          } catch { failed++; }
        } else { failed++; }
      }
      return status.edit({ embeds: [Embeds.success('Broadcast Complete', `Sent to ${sent} servers. Failed: ${failed}`)] });
    },
  },
  {
    name: 'eval',
    description: 'Evaluate JavaScript code',
    category: 'owner',
    permission: 'owner',
    usage: '<code>',
    async execute(client, message, args) {
      const code = args.join(' ');
      if (!code) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike eval <code>`')], allowedMentions: { repliedUser: false } });
      try {
        let result = eval(code);
        if (typeof result !== 'string') result = require('util').inspect(result, { depth: 0 });
        return message.reply({ embeds: [Embeds.success('Eval Result', `\`\`\`js\n${Helpers.truncate(result, 1000)}\n\`\`\``)], allowedMentions: { repliedUser: false } });
      } catch (e) {
        return message.reply({ embeds: [Embeds.error('Eval Error', `\`\`\`\n${e.message}\n\`\`\``)], allowedMentions: { repliedUser: false } });
      }
    },
  },
  {
    name: 'reload',
    description: 'Reload all commands',
    category: 'owner',
    permission: 'owner',
    async execute(client, message) {
      await client.commandHandler.loadCommands();
      return message.reply({ embeds: [Embeds.success('Reloaded', `Reloaded ${client.commandHandler.commands.size} commands.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'shutdown',
    description: 'Shut down the bot',
    category: 'owner',
    permission: 'owner',
    async execute(client, message) {
      await message.reply({ embeds: [Embeds.warning('Shutting Down', 'Bot is shutting down...')] });
      setTimeout(() => {
        client.destroy();
        process.exit(0);
      }, 2000);
    },
  },
  {
    name: 'restart',
    description: 'Restart the bot',
    category: 'owner',
    permission: 'owner',
    async execute(client, message) {
      await message.reply({ embeds: [Embeds.warning('Restarting', 'Bot is restarting...')] });
      setTimeout(() => process.exit(0), 2000);
    },
  },
  {
    name: 'whitelist',
    description: 'Whitelist a user for AI chat',
    category: 'owner',
    permission: 'owner',
    usage: '@user',
    async execute(client, message, args) {
      const user = await Helpers.resolveUser(client, args[0]);
      if (!user) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike whitelist @user`')], allowedMentions: { repliedUser: false } });
      if (!config.ai.whitelist.includes(user.id)) config.ai.whitelist.push(user.id);
      return message.reply({ embeds: [Embeds.success('Whitelisted', `${user.tag} can now use AI chat.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'unwhitelist',
    description: 'Remove AI whitelist',
    category: 'owner',
    permission: 'owner',
    usage: '@user',
    async execute(client, message, args) {
      const user = await Helpers.resolveUser(client, args[0]);
      if (!user) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike unwhitelist @user`')], allowedMentions: { repliedUser: false } });
      const idx = config.ai.whitelist.indexOf(user.id);
      if (idx > -1) config.ai.whitelist.splice(idx, 1);
      return message.reply({ embeds: [Embeds.success('Removed', `${user.tag} removed from AI whitelist.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'setaichannel',
    description: 'Set the AI chat channel',
    category: 'owner',
    permission: 'owner',
    usage: '#channel',
    async execute(client, message, args) {
      const channel = Helpers.resolveChannel(message.guild, args[0]);
      if (!channel) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike setaichannel #channel`')], allowedMentions: { repliedUser: false } });
      config.ai.chatChannelId = channel.id;
      return message.reply({ embeds: [Embeds.success('Set', `AI chat channel is now ${channel}.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'guildinfo',
    description: 'View detailed guild info',
    category: 'owner',
    permission: 'owner',
    usage: '<guild ID>',
    async execute(client, message, args) {
      const guild = client.guilds.cache.get(args[0]) || message.guild;
      if (!guild) return message.reply({ embeds: [Embeds.error('Not Found', 'Guild not found.')], allowedMentions: { repliedUser: false } });
      return message.reply({ embeds: [Embeds.owner('Guild Info', `Name: ${guild.name}\nID: ${guild.id}\nOwner: <@${guild.ownerId}>\nMembers: ${guild.memberCount}\nChannels: ${guild.channels.cache.size}\nRoles: ${guild.roles.cache.size}\nCreated: ${Helpers.discordTimestamp(guild.createdAt)}`)] });
    },
  },
  {
    name: 'joinserver',
    description: 'Get bot invite to specific server',
    category: 'owner',
    permission: 'owner',
    async execute(client, message) {
      const link = `https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot`;
      return message.reply({ embeds: [Embeds.owner('Bot Invite', link)] });
    },
  },
  {
    name: 'cleanup',
    description: 'Clean up database (remove old data)',
    category: 'owner',
    permission: 'owner',
    async execute(client, message) {
      const before = client.db.cache.size;
      const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000; // 30 days ago
      let deleted = 0;
      for (const [key, value] of client.db.cache.entries()) {
        if (value && typeof value === 'object' && value.timestamp && value.timestamp < cutoff) {
          client.db.delete(key);
          deleted++;
        }
      }
      return message.reply({ embeds: [Embeds.success('Cleanup', `Removed ${deleted} old entries. Cache: ${before} → ${client.db.cache.size}`)] });
    },
  },
  {
    name: 'dbstats',
    description: 'View database statistics',
    category: 'owner',
    permission: 'owner',
    async execute(client, message) {
      const total = client.db.cache.size;
      const categories = {};
      for (const key of client.db.cache.keys()) {
        const prefix = key.split('_')[0];
        categories[prefix] = (categories[prefix] || 0) + 1;
      }
      const topCategories = Object.entries(categories).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, v]) => `${k}: ${v}`).join('\n');
      return message.reply({ embeds: [Embeds.owner('Database Stats', `Total entries: ${total}`).addFields({ name: 'Top Categories', value: topCategories })] });
    },
  },
  {
    name: 'getdb',
    description: 'Get a database value',
    category: 'owner',
    permission: 'owner',
    usage: '<key>',
    async execute(client, message, args) {
      const key = args.join('_');
      if (!key) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike getdb <key>`')], allowedMentions: { repliedUser: false } });
      const value = client.db.get(key);
      return message.reply({ embeds: [Embeds.owner('DB Value', `Key: \`${key}\`\nValue: \`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\``)] });
    },
  },
  {
    name: 'setdb',
    description: 'Set a database value',
    category: 'owner',
    permission: 'owner',
    usage: '<key> <value>',
    async execute(client, message, args) {
      const key = args[0];
      const value = args.slice(1).join(' ');
      if (!key || !value) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike setdb <key> <value>`')], allowedMentions: { repliedUser: false } });
      let parsed = value;
      try { parsed = JSON.parse(value); } catch {}
      client.db.set(key, parsed);
      return message.reply({ embeds: [Embeds.success('Set', `Key \`${key}\` updated.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'deletedb',
    description: 'Delete a database key',
    category: 'owner',
    permission: 'owner',
    usage: '<key>',
    async execute(client, message, args) {
      const key = args.join('_');
      if (!key) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike deletedb <key>`')], allowedMentions: { repliedUser: false } });
      client.db.delete(key);
      return message.reply({ embeds: [Embeds.success('Deleted', `Key \`${key}\` deleted.`)], allowedMentions: { repliedUser: false } });
    },
  },
];

module.exports = ownerCommands;
