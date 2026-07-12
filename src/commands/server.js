const Embeds = require('../utils/Embeds');
const Helpers = require('../utils/Helpers');
const { ChannelType, PermissionFlagsBits } = require('discord.js');

// ============================================
// SERVER MANAGEMENT COMMANDS (40+ commands)
// ============================================

const serverCommands = [
  {
    name: 'servericon',
    description: 'View the server icon',
    category: 'server',
    permission: 'everyone',
    async execute(client, message) {
      const icon = message.guild.iconURL({ size: 1024, extension: 'png' });
      if (!icon) return message.reply({ embeds: [Embeds.error('No Icon', 'This server has no icon.')], allowedMentions: { repliedUser: false } });
      return message.reply({ embeds: [Embeds.primary('Server Icon', '').setImage(icon)] });
    },
  },
  {
    name: 'serverbanner',
    description: 'View the server banner',
    category: 'server',
    permission: 'everyone',
    async execute(client, message) {
      const banner = message.guild.bannerURL({ size: 1024, extension: 'png' });
      if (!banner) return message.reply({ embeds: [Embeds.error('No Banner', 'This server has no banner.')], allowedMentions: { repliedUser: false } });
      return message.reply({ embeds: [Embeds.primary('Server Banner', '').setImage(banner)] });
    },
  },
  {
    name: 'serveremojis',
    description: 'View all server emojis',
    category: 'server',
    permission: 'everyone',
    async execute(client, message) {
      const emojis = message.guild.emojis.cache;
      if (emojis.size === 0) return message.reply({ embeds: [Embeds.info('No Emojis', 'No emojis in this server.')], allowedMentions: { repliedUser: false } });
      const animated = emojis.filter(e => e.animated);
      const static_ = emojis.filter(e => !e.animated);
      return message.reply({ embeds: [Embeds.primary('Server Emojis', `**${emojis.size} emojis** (${animated.size} animated, ${static_.size} static)`)
        .addFields(
          { name: 'Animated', value: animated.size ? animated.map(e => e.toString()).join(' ') : 'None' },
          { name: 'Static', value: static_.size ? static_.map(e => e.toString()).join(' ') : 'None' },
        )], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'serverroles',
    description: 'View all server roles',
    category: 'server',
    permission: 'everyone',
    async execute(client, message) {
      const roles = message.guild.roles.cache.sort((a, b) => b.position - a.position);
      const list = roles.map(r => `${r} (${r.members.size})`).join('\n');
      return message.reply({ embeds: [Embeds.primary('Server Roles', `**${roles.size} roles**`).addFields({ name: '\u200B', value: Helpers.truncate(list, 1024) })], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'serverchannels',
    description: 'View all server channels',
    category: 'server',
    permission: 'everyone',
    async execute(client, message) {
      const channels = message.guild.channels.cache;
      const categories = channels.filter(c => c.type === ChannelType.GuildCategory);
      const text = channels.filter(c => c.type === ChannelType.GuildText);
      const voice = channels.filter(c => c.type === ChannelType.GuildVoice);
      return message.reply({ embeds: [Embeds.primary('Server Channels', `**${channels.size} channels**`)
        .addFields(
          { name: 'Categories', value: categories.size.toString(), inline: true },
          { name: 'Text', value: text.size.toString(), inline: true },
          { name: 'Voice', value: voice.size.toString(), inline: true },
        )], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'serverboosts',
    description: 'View server boost info',
    category: 'server',
    permission: 'everyone',
    async execute(client, message) {
      const g = message.guild;
      return message.reply({ embeds: [Embeds.primary('Server Boosts', `Boost information for ${g.name}`)
        .addFields(
          { name: 'Tier', value: `Level ${g.premiumTier}`, inline: true },
          { name: 'Boosts', value: g.premiumSubscriptionCount.toString(), inline: true },
          { name: 'Boosters', value: g.roles.cache.find(r => r.tags?.premiumSubscriberRole)?.members.size || '0', inline: true },
        )], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'createchannel',
    description: 'Create a new channel',
    category: 'server',
    permission: 'admin',
    usage: '<text|voice> <name>',
    async execute(client, message, args) {
      const type = args[0]?.toLowerCase();
      const name = args.slice(1).join('-');
      if (!['text', 'voice'].includes(type) || !name) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike createchannel <text|voice> <name>`')], allowedMentions: { repliedUser: false } });
      const channelType = type === 'text' ? ChannelType.GuildText : ChannelType.GuildVoice;
      const channel = await message.guild.channels.create({ name, type: channelType });
      return message.reply({ embeds: [Embeds.success('Created', `Created ${type} channel: ${channel}`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'deletechannel',
    description: 'Delete a channel',
    category: 'server',
    permission: 'admin',
    usage: '#channel',
    async execute(client, message, args) {
      const channel = Helpers.resolveChannel(message.guild, args[0]) || message.channel;
      await channel.delete();
      return message.reply({ embeds: [Embeds.success('Deleted', `Channel deleted.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'channeltopic',
    description: 'Set channel topic',
    category: 'server',
    permission: 'admin',
    usage: '<topic>',
    async execute(client, message, args) {
      const topic = args.join(' ');
      if (!topic) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike channeltopic <topic>`')], allowedMentions: { repliedUser: false } });
      await message.channel.setTopic(topic);
      return message.reply({ embeds: [Embeds.success('Set', 'Channel topic updated.')], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'channelname',
    description: 'Rename a channel',
    category: 'server',
    permission: 'admin',
    usage: '<new name> [#channel]',
    async execute(client, message, args) {
      const name = args[0];
      const channel = Helpers.resolveChannel(message.guild, args[1]) || message.channel;
      if (!name) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike channelname <new name>`')], allowedMentions: { repliedUser: false } });
      await channel.setName(name);
      return message.reply({ embeds: [Embeds.success('Renamed', `Channel renamed to ${name}.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'createcategory',
    description: 'Create a category',
    category: 'server',
    permission: 'admin',
    usage: '<name>',
    async execute(client, message, args) {
      const name = args.join(' ');
      if (!name) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike createcategory <name>`')], allowedMentions: { repliedUser: false } });
      const category = await message.guild.channels.create({ name, type: ChannelType.GuildCategory });
      return message.reply({ embeds: [Embeds.success('Created', `Category created: ${category}`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'deletecategory',
    description: 'Delete a category and its channels',
    category: 'server',
    permission: 'admin',
    usage: '#category',
    async execute(client, message, args) {
      const category = Helpers.resolveChannel(message.guild, args[0]);
      if (!category || category.type !== ChannelType.GuildCategory) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike deletecategory #category`')], allowedMentions: { repliedUser: false } });
      const children = category.children;
      for (const [, child] of children) await child.delete().catch(() => {});
      await category.delete();
      return message.reply({ embeds: [Embeds.success('Deleted', `Category and ${children.size} channels deleted.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'setservername',
    description: 'Change the server name',
    category: 'server',
    permission: 'admin',
    usage: '<new name>',
    async execute(client, message, args) {
      const name = args.join(' ');
      if (!name) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike setservername <name>`')], allowedMentions: { repliedUser: false } });
      await message.guild.setName(name);
      return message.reply({ embeds: [Embeds.success('Renamed', `Server renamed to ${name}.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'setservericon',
    description: 'Change the server icon',
    category: 'server',
    permission: 'admin',
    usage: '<image URL or attachment>',
    async execute(client, message, args) {
      const url = message.attachments.first()?.url || args[0];
      if (!url) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike setservericon <URL>` or attach an image')], allowedMentions: { repliedUser: false } });
      try {
        await message.guild.setIcon(url);
        return message.reply({ embeds: [Embeds.success('Set', 'Server icon updated.')], allowedMentions: { repliedUser: false } });
      } catch (e) {
        return message.reply({ embeds: [Embeds.error('Error', e.message)], allowedMentions: { repliedUser: false } });
      }
    },
  },
  {
    name: 'setserverbanner',
    description: 'Change the server banner',
    category: 'server',
    permission: 'admin',
    usage: '<image URL or attachment>',
    async execute(client, message, args) {
      const url = message.attachments.first()?.url || args[0];
      if (!url) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike setserverbanner <URL>`')], allowedMentions: { repliedUser: false } });
      try {
        await message.guild.setBanner(url);
        return message.reply({ embeds: [Embeds.success('Set', 'Server banner updated.')], allowedMentions: { repliedUser: false } });
      } catch (e) {
        return message.reply({ embeds: [Embeds.error('Error', e.message)], allowedMentions: { repliedUser: false } });
      }
    },
  },
  {
    name: 'setafk',
    description: 'Set the AFK channel and timeout',
    category: 'server',
    permission: 'admin',
    usage: '#channel <seconds>',
    async execute(client, message, args) {
      const channel = Helpers.resolveChannel(message.guild, args[0]);
      const timeout = parseInt(args[1]) || 60;
      if (!channel) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike setafk #channel <seconds>`')], allowedMentions: { repliedUser: false } });
      await message.guild.setAFKChannel(channel);
      await message.guild.setAFKTimeout(timeout);
      return message.reply({ embeds: [Embeds.success('Set', `AFK channel: ${channel}, timeout: ${timeout}s`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'setsystemchannel',
    description: 'Set the system channel',
    category: 'server',
    permission: 'admin',
    usage: '#channel',
    async execute(client, message, args) {
      const channel = Helpers.resolveChannel(message.guild, args[0]);
      if (!channel) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike setsystemchannel #channel`')], allowedMentions: { repliedUser: false } });
      await message.guild.setSystemChannel(channel);
      return message.reply({ embeds: [Embeds.success('Set', `System channel: ${channel}`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'autorole',
    description: 'Setup auto-role for new members',
    category: 'server',
    permission: 'admin',
    usage: '<add|remove|list> [@role]',
    async execute(client, message, args) {
      const action = args[0]?.toLowerCase();
      const roles = client.db.get(`autoroles_${message.guild.id}`) || [];
      if (action === 'add') {
        const role = Helpers.resolveRole(message.guild, args[1]);
        if (!role) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike autorole add @role`')], allowedMentions: { repliedUser: false } });
        if (!roles.includes(role.id)) roles.push(role.id);
        client.db.set(`autoroles_${message.guild.id}`, roles);
        return message.reply({ embeds: [Embeds.success('Added', `${role} is now an auto-role.`)], allowedMentions: { repliedUser: false } });
      }
      if (action === 'remove') {
        const role = Helpers.resolveRole(message.guild, args[1]);
        if (!role) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike autorole remove @role`')], allowedMentions: { repliedUser: false } });
        const filtered = roles.filter(r => r !== role.id);
        client.db.set(`autoroles_${message.guild.id}`, filtered);
        return message.reply({ embeds: [Embeds.success('Removed', `${role.name} removed from auto-roles.`)], allowedMentions: { repliedUser: false } });
      }
      if (action === 'list') {
        return message.reply({ embeds: [Embeds.info('Auto Roles', roles.length ? roles.map(r => `<@&${r}>`).join('\n') : 'None')], allowedMentions: { repliedUser: false } });
      }
      return message.reply({ embeds: [Embeds.error('Usage', '`@Zike autorole <add|remove|list> [@role]`')], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'selfrole',
    description: 'Setup self-assignable roles',
    category: 'server',
    permission: 'admin',
    usage: '<add|remove|list> [@role]',
    async execute(client, message, args) {
      const action = args[0]?.toLowerCase();
      const roles = client.db.get(`selfroles_${message.guild.id}`) || [];
      if (action === 'add') {
        const role = Helpers.resolveRole(message.guild, args[1]);
        if (!role) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike selfrole add @role`')], allowedMentions: { repliedUser: false } });
        if (!roles.includes(role.id)) roles.push(role.id);
        client.db.set(`selfroles_${message.guild.id}`, roles);
        return message.reply({ embeds: [Embeds.success('Added', `${role} is now self-assignable.`)], allowedMentions: { repliedUser: false } });
      }
      if (action === 'remove') {
        const role = Helpers.resolveRole(message.guild, args[1]);
        if (!role) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike selfrole remove @role`')], allowedMentions: { repliedUser: false } });
        const filtered = roles.filter(r => r !== role.id);
        client.db.set(`selfroles_${message.guild.id}`, filtered);
        return message.reply({ embeds: [Embeds.success('Removed', 'Role removed.')], allowedMentions: { repliedUser: false } });
      }
      if (action === 'list') {
        return message.reply({ embeds: [Embeds.info('Self Roles', roles.length ? roles.map(r => `<@&${r}>`).join('\n') : 'None')], allowedMentions: { repliedUser: false } });
      }
      if (action === 'get') {
        const role = Helpers.resolveRole(message.guild, args[1]);
        if (!role || !roles.includes(role.id)) return message.reply({ embeds: [Embeds.error('Not Available', 'That role is not self-assignable.')], allowedMentions: { repliedUser: false } });
        await message.member.roles.add(role);
        return message.reply({ embeds: [Embeds.success('Got Role', `You now have ${role}.`)], allowedMentions: { repliedUser: false } });
      }
      return message.reply({ embeds: [Embeds.error('Usage', '`@Zike selfrole <add|remove|list|get> [@role]`')], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'emojiadd',
    description: 'Add an emoji to the server',
    category: 'server',
    permission: 'admin',
    usage: '<name> <URL or attachment>',
    async execute(client, message, args) {
      const name = args[0];
      const url = message.attachments.first()?.url || args[1];
      if (!name || !url) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike emojiadd <name> <URL>`')], allowedMentions: { repliedUser: false } });
      try {
        const emoji = await message.guild.emojis.create({ attachment: url, name });
        return message.reply({ embeds: [Embeds.success('Added', `Emoji ${emoji} added!`)], allowedMentions: { repliedUser: false } });
      } catch (e) {
        return message.reply({ embeds: [Embeds.error('Error', e.message)], allowedMentions: { repliedUser: false } });
      }
    },
  },
  {
    name: 'emojidelete',
    description: 'Delete an emoji',
    category: 'server',
    permission: 'admin',
    usage: '<emoji>',
    async execute(client, message, args) {
      const emoji = message.guild.emojis.cache.find(e => e.name === args[0]?.replace(/[:<>]/g, '') || e.id === args[0]);
      if (!emoji) return message.reply({ embeds: [Embeds.error('Not Found', 'Emoji not found.')], allowedMentions: { repliedUser: false } });
      await emoji.delete();
      return message.reply({ embeds: [Embeds.success('Deleted', `Emoji ${emoji.name} deleted.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'emojilist',
    description: 'List all server emojis',
    category: 'server',
    permission: 'everyone',
    async execute(client, message) {
      const emojis = message.guild.emojis.cache;
      if (emojis.size === 0) return message.reply({ embeds: [Embeds.info('No Emojis', '')], allowedMentions: { repliedUser: false } });
      const list = emojis.map(e => `${e} — \`${e.name}\` (${e.id})`).join('\n');
      return message.reply({ embeds: [Embeds.info('Emojis', `**${emojis.size} emojis:**`).addFields({ name: '\u200B', value: Helpers.truncate(list, 1024) })], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'ping',
    description: 'Check the bot latency',
    category: 'server',
    permission: 'everyone',
    async execute(client, message) {
      const sent = await message.reply({ embeds: [Embeds.loading('Pinging...', 'Calculating latency.')] });
      const latency = sent.createdTimestamp - message.createdTimestamp;
      const apiLatency = Math.round(client.ws.ping);
      return sent.edit({ embeds: [Embeds.success('🏓 Pong!', `**Bot Latency:** ${latency}ms\n**API Latency:** ${apiLatency}ms`)] });
    },
  },
  {
    name: 'stats',
    description: 'View bot statistics',
    category: 'server',
    permission: 'everyone',
    async execute(client, message) {
      const uptime = client.uptime;
      const embed = Embeds.primary('📊 Bot Statistics', 'Zike statistics')
        .addFields(
          { name: '⏱️ Uptime', value: Helpers.formatDuration(uptime), inline: true },
          { name: '🏠 Servers', value: client.guilds.cache.size.toString(), inline: true },
          { name: '👥 Users', value: client.users.cache.size.toString(), inline: true },
          { name: '📡 Channels', value: client.channels.cache.size.toString(), inline: true },
          { name: '💾 Commands', value: client.commandHandler.commands.size.toString(), inline: true },
          { name: '🤖 API Latency', value: `${Math.round(client.ws.ping)}ms`, inline: true },
        );
      return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'about',
    description: 'About Zike bot',
    category: 'server',
    permission: 'everyone',
    async execute(client, message) {
      const embed = Embeds.base({ color: 0x8B5CF6 })
        .setTitle('✨ About Zike')
        .setDescription(
          `**Zike** is a crazy AI-powered all-in-one Discord bot built by **Arsh** (escapingdum).\n\n` +
          `🤖 **AI-Powered**: Uses Groq AI for intelligent conversations\n` +
          `🛡️ **Security**: Anti-nuke, anti-raid, lockdown, and more\n` +
          `🎫 **Tickets**: Full ticket system with transcripts\n` +
          `📨 **Invite Tracking**: Track invites and reward inviters\n` +
          `✅ **Verification**: Button or captcha verification\n` +
          `🎮 **Games**: 60+ games to play\n` +
          `💰 **Economy**: Coins, shop, gambling, and more\n` +
          `📊 **Leveling**: XP, levels, and rewards\n` +
          `🔨 **Moderation**: 60+ moderation commands\n` +
          `🎯 **400+ Commands**: All triggered by pinging me!\n\n` +
          `**Owner:** Arsh (escapingdum)\n` +
          `**Built with:** discord.js, Groq AI`
        )
        .setThumbnail(client.user.displayAvatarURL({ size: 256, extension: 'png' }))
        .setFooter({ text: 'Built by Arsh • @Zike help' });
      return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'uptime',
    description: 'View bot uptime',
    category: 'server',
    permission: 'everyone',
    async execute(client, message) {
      return message.reply({ embeds: [Embeds.primary('⏱️ Uptime', `Zike has been online for **${Helpers.formatDuration(client.uptime)}**`)], allowedMentions: { repliedUser: false } });
    },
  },
];

module.exports = serverCommands;
