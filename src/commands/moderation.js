const Embeds = require('../utils/Embeds');
const Helpers = require('../utils/Helpers');
const { PermissionFlagsBits, ChannelType } = require('discord.js');

// ============================================
// MODERATION COMMANDS (60+ commands)
// ============================================

const moderationCommands = [
  // ============================================
  // BAN COMMANDS
  // ============================================
  {
    name: 'ban',
    description: 'Ban a user from the server',
    category: 'moderation',
    permission: 'moderator',
    usage: '@user [reason]',
    aliases: ['b', 'banish', 'exile'],
    examples: ['ban @user spamming', 'ban 123456789 raiding'],
    async execute(client, message, args) {
      if (!args[0]) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike ban @user [reason]`')], allowedMentions: { repliedUser: false } });

      const target = await Helpers.resolveMember(message.guild, args[0]);
      const reason = args.slice(1).join(' ') || 'No reason provided';

      if (!target) return message.reply({ embeds: [Embeds.error('Not Found', 'User not found.')], allowedMentions: { repliedUser: false } });
      if (target.id === message.author.id) return message.reply({ embeds: [Embeds.error('Error', 'You cannot ban yourself.')], allowedMentions: { repliedUser: false } });
      if (!target.bannable) return message.reply({ embeds: [Embeds.error('Error', 'I cannot ban this user. Check my permissions and role hierarchy.')], allowedMentions: { repliedUser: false } });

      try {
        await target.ban({ reason: `Banned by ${message.author.tag}: ${reason}` });
        // Save case
        saveModCase(client, message.guild.id, 'ban', target.user, message.author, reason);
        return message.reply({ embeds: [Embeds.success('User Banned', `${target.user.tag} has been banned.\n**Reason:** ${reason}`)], allowedMentions: { repliedUser: false } });
      } catch (e) {
        return message.reply({ embeds: [Embeds.error('Error', `Failed to ban: ${e.message}`)], allowedMentions: { repliedUser: false } });
      }
    },
  },
  {
    name: 'unban',
    description: 'Unban a user by ID',
    category: 'moderation',
    permission: 'moderator',
    usage: 'userId [reason]',
    aliases: ['ub', 'pardon'],
    async execute(client, message, args) {
      if (!args[0]) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike unban <userId> [reason]`')], allowedMentions: { repliedUser: false } });
      try {
        await message.guild.members.unban(args[0], `Unbanned by ${message.author.tag}: ${args.slice(1).join(' ') || 'No reason'}`);
        return message.reply({ embeds: [Embeds.success('User Unbanned', `User ${args[0]} has been unbanned.`)], allowedMentions: { repliedUser: false } });
      } catch (e) {
        return message.reply({ embeds: [Embeds.error('Error', `Failed to unban: ${e.message}`)], allowedMentions: { repliedUser: false } });
      }
    },
  },
  {
    name: 'softban',
    description: 'Ban and immediately unban to clear messages',
    category: 'moderation',
    permission: 'moderator',
    usage: '@user [reason]',
    async execute(client, message, args) {
      const target = await Helpers.resolveMember(message.guild, args[0]);
      if (!target) return message.reply({ embeds: [Embeds.error('Not Found', 'User not found.')], allowedMentions: { repliedUser: false } });
      const reason = args.slice(1).join(' ') || 'Softban';
      try {
        await target.ban({ reason, deleteMessageDays: 7 });
        await message.guild.members.unban(target.id);
        return message.reply({ embeds: [Embeds.success('Softbanned', `${target.user.tag} was softbanned. Messages cleared.`)], allowedMentions: { repliedUser: false } });
      } catch (e) {
        return message.reply({ embeds: [Embeds.error('Error', e.message)], allowedMentions: { repliedUser: false } });
      }
    },
  },
  {
    name: 'tempban',
    description: 'Temporarily ban a user',
    category: 'moderation',
    permission: 'moderator',
    usage: '@user <duration> [reason]',
    async execute(client, message, args) {
      const target = await Helpers.resolveMember(message.guild, args[0]);
      const duration = Helpers.parseDuration(args[1]);
      const reason = args.slice(2).join(' ') || 'Tempban';
      if (!target || !duration) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike tempban @user <1h/1d/1w> [reason]`')], allowedMentions: { repliedUser: false } });
      try {
        await target.ban({ reason: `Tempban by ${message.author.tag}: ${reason}` });
        client.db.set(`tempban_${message.guild.id}_${target.id}`, { expires: Date.now() + duration, reason });
        return message.reply({ embeds: [Embeds.success('Tempbanned', `${target.user.tag} banned for ${Helpers.formatDuration(duration)}.`)], allowedMentions: { repliedUser: false } });
      } catch (e) {
        return message.reply({ embeds: [Embeds.error('Error', e.message)], allowedMentions: { repliedUser: false } });
      }
    },
  },
  {
    name: 'massban',
    description: 'Ban multiple users at once',
    category: 'moderation',
    permission: 'admin',
    usage: '@user1 @user2 @user3 [reason]',
    async execute(client, message, args) {
      const targets = message.mentions.users;
      if (targets.size < 1) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike massban @user1 @user2 ...`')], allowedMentions: { repliedUser: false } });
      const reason = args.filter(a => !a.startsWith('<@')).join(' ') || 'Mass ban';
      let banned = 0, failed = 0;
      for (const user of targets.values()) {
        try { await message.guild.members.ban(user, { reason }); banned++; } catch { failed++; }
      }
      return message.reply({ embeds: [Embeds.success('Mass Ban Complete', `Banned: ${banned}\nFailed: ${failed}\nReason: ${reason}`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'banlist',
    description: 'View all banned users',
    category: 'moderation',
    permission: 'moderator',
    aliases: ['bans', 'banned'],
    async execute(client, message, args) {
      try {
        const bans = await message.guild.bans.fetch();
        if (bans.size === 0) return message.reply({ embeds: [Embeds.info('No Bans', 'No users are banned.')], allowedMentions: { repliedUser: false } });
        const list = bans.map(b => `**${b.user.tag}** (${b.user.id})\n${b.reason || 'No reason'}`).join('\n\n');
        const embed = Embeds.info('Ban List', `**${bans.size} users banned**`).addFields({ name: '\u200B', value: Helpers.truncate(list, 1024) });
        return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
      } catch (e) {
        return message.reply({ embeds: [Embeds.error('Error', e.message)], allowedMentions: { repliedUser: false } });
      }
    },
  },

  // ============================================
  // KICK COMMANDS
  // ============================================
  {
    name: 'kick',
    description: 'Kick a user from the server',
    category: 'moderation',
    permission: 'moderator',
    usage: '@user [reason]',
    aliases: ['k'],
    async execute(client, message, args) {
      const target = await Helpers.resolveMember(message.guild, args[0]);
      const reason = args.slice(1).join(' ') || 'No reason provided';
      if (!target) return message.reply({ embeds: [Embeds.error('Not Found', 'User not found.')], allowedMentions: { repliedUser: false } });
      if (!target.kickable) return message.reply({ embeds: [Embeds.error('Error', 'I cannot kick this user.')], allowedMentions: { repliedUser: false } });
      try {
        await target.kick(`Kicked by ${message.author.tag}: ${reason}`);
        saveModCase(client, message.guild.id, 'kick', target.user, message.author, reason);
        return message.reply({ embeds: [Embeds.success('User Kicked', `${target.user.tag} has been kicked.\n**Reason:** ${reason}`)], allowedMentions: { repliedUser: false } });
      } catch (e) {
        return message.reply({ embeds: [Embeds.error('Error', e.message)], allowedMentions: { repliedUser: false } });
      }
    },
  },
  {
    name: 'masskick',
    description: 'Kick multiple users',
    category: 'moderation',
    permission: 'admin',
    usage: '@user1 @user2 [reason]',
    async execute(client, message, args) {
      const targets = message.mentions.users;
      const reason = args.filter(a => !a.startsWith('<@')).join(' ') || 'Mass kick';
      let kicked = 0, failed = 0;
      for (const user of targets.values()) {
        try { await message.guild.members.kick(user, reason); kicked++; } catch { failed++; }
      }
      return message.reply({ embeds: [Embeds.success('Mass Kick', `Kicked: ${kicked}\nFailed: ${failed}`)], allowedMentions: { repliedUser: false } });
    },
  },

  // ============================================
  // MUTE / TIMEOUT COMMANDS
  // ============================================
  {
    name: 'mute',
    description: 'Timeout a user (mute them)',
    category: 'moderation',
    permission: 'moderator',
    usage: '@user <duration> [reason]',
    aliases: ['timeout', 'silence', 'shutup'],
    async execute(client, message, args) {
      const target = await Helpers.resolveMember(message.guild, args[0]);
      const duration = Helpers.parseDuration(args[1]);
      const reason = args.slice(2).join(' ') || 'No reason provided';
      if (!target || !duration) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike mute @user <1h/1d> [reason]`')], allowedMentions: { repliedUser: false } });
      if (duration > 2419200000) return message.reply({ embeds: [Embeds.error('Error', 'Max timeout duration is 28 days.')], allowedMentions: { repliedUser: false } });
      try {
        await target.timeout(duration, `Muted by ${message.author.tag}: ${reason}`);
        saveModCase(client, message.guild.id, 'mute', target.user, message.author, reason);
        return message.reply({ embeds: [Embeds.success('User Muted', `${target.user.tag} muted for ${Helpers.formatDuration(duration)}.\n**Reason:** ${reason}`)], allowedMentions: { repliedUser: false } });
      } catch (e) {
        return message.reply({ embeds: [Embeds.error('Error', e.message)], allowedMentions: { repliedUser: false } });
      }
    },
  },
  {
    name: 'unmute',
    description: 'Remove timeout from a user',
    category: 'moderation',
    permission: 'moderator',
    usage: '@user',
    aliases: ['untimeout', 'unsilence'],
    async execute(client, message, args) {
      const target = await Helpers.resolveMember(message.guild, args[0]);
      if (!target) return message.reply({ embeds: [Embeds.error('Not Found', 'User not found.')], allowedMentions: { repliedUser: false } });
      try {
        await target.timeout(null, `Unmuted by ${message.author.tag}`);
        return message.reply({ embeds: [Embeds.success('User Unmuted', `${target.user.tag} has been unmuted.`)], allowedMentions: { repliedUser: false } });
      } catch (e) {
        return message.reply({ embeds: [Embeds.error('Error', e.message)], allowedMentions: { repliedUser: false } });
      }
    },
  },
  {
    name: 'voicemute',
    description: 'Mute a user in voice channels',
    category: 'moderation',
    permission: 'moderator',
    usage: '@user [reason]',
    async execute(client, message, args) {
      const target = await Helpers.resolveMember(message.guild, args[0]);
      if (!target?.voice.channel) return message.reply({ embeds: [Embeds.error('Error', 'User is not in a voice channel.')], allowedMentions: { repliedUser: false } });
      await target.voice.setMute(true, args.slice(1).join(' ') || 'Voice muted');
      return message.reply({ embeds: [Embeds.success('Voice Muted', `${target.user.tag} is now voice muted.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'voiceunmute',
    description: 'Unmute a user in voice channels',
    category: 'moderation',
    permission: 'moderator',
    usage: '@user',
    async execute(client, message, args) {
      const target = await Helpers.resolveMember(message.guild, args[0]);
      if (!target) return message.reply({ embeds: [Embeds.error('Not Found', 'User not found.')], allowedMentions: { repliedUser: false } });
      await target.voice.setMute(false, 'Voice unmuted');
      return message.reply({ embeds: [Embeds.success('Voice Unmuted', `${target.user.tag} is no longer voice muted.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'deafen',
    description: 'Deafen a user in voice',
    category: 'moderation',
    permission: 'moderator',
    usage: '@user [reason]',
    async execute(client, message, args) {
      const target = await Helpers.resolveMember(message.guild, args[0]);
      if (!target?.voice.channel) return message.reply({ embeds: [Embeds.error('Error', 'User is not in voice.')], allowedMentions: { repliedUser: false } });
      await target.voice.setDeaf(true, args.slice(1).join(' ') || 'Deafened');
      return message.reply({ embeds: [Embeds.success('Deafened', `${target.user.tag} is now deafened.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'undeafen',
    description: 'Undeafen a user in voice',
    category: 'moderation',
    permission: 'moderator',
    usage: '@user',
    async execute(client, message, args) {
      const target = await Helpers.resolveMember(message.guild, args[0]);
      if (!target) return message.reply({ embeds: [Embeds.error('Not Found', 'User not found.')], allowedMentions: { repliedUser: false } });
      await target.voice.setDeaf(false, 'Undeafened');
      return message.reply({ embeds: [Embeds.success('Undeafened', `${target.user.tag} is no longer deafened.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'voicekick',
    description: 'Kick a user from voice channel',
    category: 'moderation',
    permission: 'moderator',
    usage: '@user [reason]',
    async execute(client, message, args) {
      const target = await Helpers.resolveMember(message.guild, args[0]);
      if (!target?.voice.channel) return message.reply({ embeds: [Embeds.error('Error', 'User is not in voice.')], allowedMentions: { repliedUser: false } });
      await target.voice.disconnect(args.slice(1).join(' ') || 'Voice kicked');
      return message.reply({ embeds: [Embeds.success('Voice Kicked', `${target.user.tag} was kicked from voice.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'move',
    description: 'Move a user to another voice channel',
    category: 'moderation',
    permission: 'moderator',
    usage: '@user #channel',
    async execute(client, message, args) {
      const target = await Helpers.resolveMember(message.guild, args[0]);
      const channel = Helpers.resolveChannel(message.guild, args[1]);
      if (!target?.voice.channel || !channel?.isVoiceBased?.()) return message.reply({ embeds: [Embeds.error('Error', 'User not in voice or invalid channel.')], allowedMentions: { repliedUser: false } });
      await target.voice.setChannel(channel);
      return message.reply({ embeds: [Embeds.success('Moved', `${target.user.tag} moved to ${channel.name}.`)], allowedMentions: { repliedUser: false } });
    },
  },

  // ============================================
  // WARN SYSTEM
  // ============================================
  {
    name: 'warn',
    description: 'Warn a user',
    category: 'moderation',
    permission: 'moderator',
    usage: '@user [reason]',
    async execute(client, message, args) {
      const target = await Helpers.resolveMember(message.guild, args[0]);
      const reason = args.slice(1).join(' ') || 'No reason provided';
      if (!target) return message.reply({ embeds: [Embeds.error('Not Found', 'User not found.')], allowedMentions: { repliedUser: false } });
      const warnId = Helpers.generateId(8);
      const warns = client.db.get(`warns_${message.guild.id}_${target.id}`) || [];
      warns.push({ id: warnId, reason, moderator: message.author.id, timestamp: Date.now() });
      client.db.set(`warns_${message.guild.id}_${target.id}`, warns);
      saveModCase(client, message.guild.id, 'warn', target.user, message.author, reason);
      return message.reply({ embeds: [Embeds.warning('User Warned', `${target.user.tag} has been warned.\n**Warn ID:** ${warnId}\n**Reason:** ${reason}\n**Total warns:** ${warns.length}`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'warnings',
    description: 'View warnings for a user',
    category: 'moderation',
    permission: 'moderator',
    usage: '@user',
    aliases: ['warns', 'warnlist'],
    async execute(client, message, args) {
      const target = await Helpers.resolveMember(message.guild, args[0]) || message.member;
      const warns = client.db.get(`warns_${message.guild.id}_${target.id}`) || [];
      if (warns.length === 0) return message.reply({ embeds: [Embeds.info('No Warnings', `${target.user.tag} has no warnings.`)], allowedMentions: { repliedUser: false } });
      const list = warns.map(w => `**ID:** ${w.id}\n**Reason:** ${w.reason}\n**By:** <@${w.moderator}>\n**When:** ${Helpers.discordTimestamp(w.timestamp)}`).join('\n\n');
      return message.reply({ embeds: [Embeds.warning('Warning List', `${target.user.tag} has **${warns.length}** warning(s).`).addFields({ name: '\u200B', value: Helpers.truncate(list, 1024) })], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'clearwarnings',
    description: 'Clear all warnings for a user',
    category: 'moderation',
    permission: 'moderator',
    usage: '@user',
    aliases: ['clearwarns', 'resetwarns'],
    async execute(client, message, args) {
      const target = await Helpers.resolveMember(message.guild, args[0]);
      if (!target) return message.reply({ embeds: [Embeds.error('Not Found', 'User not found.')], allowedMentions: { repliedUser: false } });
      client.db.set(`warns_${message.guild.id}_${target.id}`, []);
      return message.reply({ embeds: [Embeds.success('Warnings Cleared', `All warnings for ${target.user.tag} have been cleared.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'delwarn',
    description: 'Delete a specific warning by ID',
    category: 'moderation',
    permission: 'moderator',
    usage: '@user <warnId>',
    async execute(client, message, args) {
      const target = await Helpers.resolveMember(message.guild, args[0]);
      const warnId = args[1];
      if (!target || !warnId) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike delwarn @user <warnId>`')], allowedMentions: { repliedUser: false } });
      const warns = client.db.get(`warns_${message.guild.id}_${target.id}`) || [];
      const filtered = warns.filter(w => w.id !== warnId);
      client.db.set(`warns_${message.guild.id}_${target.id}`, filtered);
      return message.reply({ embeds: [Embeds.success('Warning Deleted', `Warning ${warnId} removed.`)], allowedMentions: { repliedUser: false } });
    },
  },

  // ============================================
  // PURGE / CLEAN COMMANDS
  // ============================================
  {
    name: 'purge',
    description: 'Delete multiple messages',
    category: 'moderation',
    permission: 'moderator',
    usage: '<count>',
    aliases: ['clear', 'clean', 'prune', 'delete'],
    async execute(client, message, args) {
      const count = parseInt(args[0]) || 0;
      if (count < 1 || count > 100) return message.reply({ embeds: [Embeds.error('Error', 'Count must be between 1-100.')], allowedMentions: { repliedUser: false } });
      try {
        const deleted = await message.channel.bulkDelete(count + 1, true);
        const msg = await message.channel.send({ embeds: [Embeds.success('Purged', `Deleted ${deleted.size - 1} messages.`)] });
        setTimeout(() => msg.delete().catch(() => {}), 5000);
      } catch (e) {
        message.reply({ embeds: [Embeds.error('Error', e.message)], allowedMentions: { repliedUser: false } });
      }
    },
  },
  {
    name: 'purgeuser',
    description: 'Delete messages from a specific user',
    category: 'moderation',
    permission: 'moderator',
    usage: '@user <count>',
    async execute(client, message, args) {
      const target = await Helpers.resolveMember(message.guild, args[0]);
      const count = parseInt(args[1]) || 100;
      if (!target) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike purgeuser @user <count>`')], allowedMentions: { repliedUser: false } });
      const messages = await message.channel.messages.fetch({ limit: 100 });
      const toDelete = messages.filter(m => m.author.id === target.id).first(count);
      try {
        await message.channel.bulkDelete(toDelete);
        const msg = await message.channel.send({ embeds: [Embeds.success('Purged', `Deleted ${toDelete.length} messages from ${target.user.tag}.`)] });
        setTimeout(() => msg.delete().catch(() => {}), 5000);
      } catch (e) {
        message.reply({ embeds: [Embeds.error('Error', e.message)], allowedMentions: { repliedUser: false } });
      }
    },
  },
  {
    name: 'purgebots',
    description: 'Delete bot messages',
    category: 'moderation',
    permission: 'moderator',
    async execute(client, message, args) {
      const count = parseInt(args[0]) || 100;
      const messages = await message.channel.messages.fetch({ limit: 100 });
      const toDelete = messages.filter(m => m.author.bot).first(count);
      await message.channel.bulkDelete(toDelete);
      const msg = await message.channel.send({ embeds: [Embeds.success('Purged', `Deleted ${toDelete.length} bot messages.`)] });
      setTimeout(() => msg.delete().catch(() => {}), 5000);
    },
  },
  {
    name: 'purgelinks',
    description: 'Delete messages containing links',
    category: 'moderation',
    permission: 'moderator',
    async execute(client, message, args) {
      const count = parseInt(args[0]) || 100;
      const messages = await message.channel.messages.fetch({ limit: 100 });
      const toDelete = messages.filter(m => /https?:\/\//.test(m.content)).first(count);
      await message.channel.bulkDelete(toDelete);
      const msg = await message.channel.send({ embeds: [Embeds.success('Purged', `Deleted ${toDelete.length} link messages.`)] });
      setTimeout(() => msg.delete().catch(() => {}), 5000);
    },
  },
  {
    name: 'purgeimages',
    description: 'Delete messages with images/attachments',
    category: 'moderation',
    permission: 'moderator',
    async execute(client, message, args) {
      const count = parseInt(args[0]) || 100;
      const messages = await message.channel.messages.fetch({ limit: 100 });
      const toDelete = messages.filter(m => m.attachments.size > 0 || m.embeds.length > 0).first(count);
      await message.channel.bulkDelete(toDelete);
      const msg = await message.channel.send({ embeds: [Embeds.success('Purged', `Deleted ${toDelete.length} image messages.`)] });
      setTimeout(() => msg.delete().catch(() => {}), 5000);
    },
  },
  {
    name: 'nuke',
    description: 'Nuke (clone & delete) the current channel',
    category: 'moderation',
    permission: 'admin',
    async execute(client, message) {
      const channel = message.channel;
      const position = channel.position;
      const newChannel = await channel.clone();
      await channel.delete();
      await newChannel.setPosition(position);
      await newChannel.send({ embeds: [Embeds.warning('💥 Channel Nuked', `Channel nuked by ${message.author}.`)] });
    },
  },

  // ============================================
  // LOCK / SLOWMODE
  // ============================================
  {
    name: 'lock',
    description: 'Lock a channel',
    category: 'moderation',
    permission: 'moderator',
    usage: '[#channel]',
    async execute(client, message, args) {
      const channel = Helpers.resolveChannel(message.guild, args[0]) || message.channel;
      await channel.permissionOverwrites.edit(message.guild.id, { SendMessages: false });
      return message.reply({ embeds: [Embeds.success('Channel Locked', `${channel} has been locked.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'unlock',
    description: 'Unlock a channel',
    category: 'moderation',
    permission: 'moderator',
    usage: '[#channel]',
    async execute(client, message, args) {
      const channel = Helpers.resolveChannel(message.guild, args[0]) || message.channel;
      await channel.permissionOverwrites.edit(message.guild.id, { SendMessages: null });
      return message.reply({ embeds: [Embeds.success('Channel Unlocked', `${channel} has been unlocked.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'lockall',
    description: 'Lock all text channels',
    category: 'moderation',
    permission: 'admin',
    async execute(client, message) {
      const channels = message.guild.channels.cache.filter(c => c.type === ChannelType.GuildText);
      let count = 0;
      for (const [, channel] of channels) {
        try { await channel.permissionOverwrites.edit(message.guild.id, { SendMessages: false }); count++; } catch {}
      }
      return message.reply({ embeds: [Embeds.success('All Channels Locked', `Locked ${count} text channels.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'unlockall',
    description: 'Unlock all text channels',
    category: 'moderation',
    permission: 'admin',
    async execute(client, message) {
      const channels = message.guild.channels.cache.filter(c => c.type === ChannelType.GuildText);
      let count = 0;
      for (const [, channel] of channels) {
        try { await channel.permissionOverwrites.edit(message.guild.id, { SendMessages: null }); count++; } catch {}
      }
      return message.reply({ embeds: [Embeds.success('All Channels Unlocked', `Unlocked ${count} text channels.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'slowmode',
    description: 'Set slowmode for a channel',
    category: 'moderation',
    permission: 'moderator',
    usage: '<seconds> [#channel]',
    aliases: ['slow'],
    async execute(client, message, args) {
      const seconds = parseInt(args[0]);
      const channel = Helpers.resolveChannel(message.guild, args[1]) || message.channel;
      if (isNaN(seconds) || seconds < 0 || seconds > 21600) return message.reply({ embeds: [Embeds.error('Error', 'Seconds must be 0-21600.')], allowedMentions: { repliedUser: false } });
      await channel.setRateLimitPerUser(seconds);
      return message.reply({ embeds: [Embeds.success('Slowmode Set', `${channel} slowmode set to ${seconds} seconds.`)], allowedMentions: { repliedUser: false } });
    },
  },

  // ============================================
  // ROLE / NICKNAME MANAGEMENT
  // ============================================
  {
    name: 'nickname',
    description: 'Change a user\'s nickname',
    category: 'moderation',
    permission: 'moderator',
    usage: '@user <new nick>',
    aliases: ['nick', 'setnick'],
    async execute(client, message, args) {
      const target = await Helpers.resolveMember(message.guild, args[0]);
      const nick = args.slice(1).join(' ');
      if (!target) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike nickname @user <new nick>`')], allowedMentions: { repliedUser: false } });
      try {
        await target.setNickname(nick || null);
        return message.reply({ embeds: [Embeds.success('Nickname Changed', `${target.user.tag}'s nickname is now "${nick || 'reset'}".`)], allowedMentions: { repliedUser: false } });
      } catch (e) {
        return message.reply({ embeds: [Embeds.error('Error', e.message)], allowedMentions: { repliedUser: false } });
      }
    },
  },
  {
    name: 'resetnick',
    description: 'Reset a user\'s nickname',
    category: 'moderation',
    permission: 'moderator',
    usage: '@user',
    async execute(client, message, args) {
      const target = await Helpers.resolveMember(message.guild, args[0]);
      if (!target) return message.reply({ embeds: [Embeds.error('Not Found', 'User not found.')], allowedMentions: { repliedUser: false } });
      await target.setNickname(null);
      return message.reply({ embeds: [Embeds.success('Nickname Reset', `${target.user.tag}'s nickname has been reset.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'roleadd',
    description: 'Add a role to a user',
    category: 'moderation',
    permission: 'moderator',
    usage: '@user @role',
    aliases: ['addrole'],
    async execute(client, message, args) {
      const target = await Helpers.resolveMember(message.guild, args[0]);
      const role = Helpers.resolveRole(message.guild, args[1]);
      if (!target || !role) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike roleadd @user @role`')], allowedMentions: { repliedUser: false } });
      try {
        await target.roles.add(role);
        return message.reply({ embeds: [Embeds.success('Role Added', `Added ${role} to ${target.user.tag}.`)], allowedMentions: { repliedUser: false } });
      } catch (e) {
        return message.reply({ embeds: [Embeds.error('Error', e.message)], allowedMentions: { repliedUser: false } });
      }
    },
  },
  {
    name: 'roleremove',
    description: 'Remove a role from a user',
    category: 'moderation',
    permission: 'moderator',
    usage: '@user @role',
    aliases: ['removerole', 'rmrole'],
    async execute(client, message, args) {
      const target = await Helpers.resolveMember(message.guild, args[0]);
      const role = Helpers.resolveRole(message.guild, args[1]);
      if (!target || !role) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike roleremove @user @role`')], allowedMentions: { repliedUser: false } });
      try {
        await target.roles.remove(role);
        return message.reply({ embeds: [Embeds.success('Role Removed', `Removed ${role} from ${target.user.tag}.`)], allowedMentions: { repliedUser: false } });
      } catch (e) {
        return message.reply({ embeds: [Embeds.error('Error', e.message)], allowedMentions: { repliedUser: false } });
      }
    },
  },
  {
    name: 'roleall',
    description: 'Add a role to all members',
    category: 'moderation',
    permission: 'admin',
    usage: '@role',
    async execute(client, message, args) {
      const role = Helpers.resolveRole(message.guild, args[0]);
      if (!role) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike roleall @role`')], allowedMentions: { repliedUser: false } });
      const members = await message.guild.members.fetch();
      let count = 0;
      const status = await message.reply({ embeds: [Embeds.loading('Adding Role', `Adding ${role.name} to all members...`)] });
      for (const [, member] of members) {
        try { await member.roles.add(role); count++; } catch {}
      }
      return status.edit({ embeds: [Embeds.success('Done', `Added ${role.name} to ${count} members.`)] });
    },
  },
  {
    name: 'rolecreate',
    description: 'Create a new role',
    category: 'moderation',
    permission: 'admin',
    usage: '<name> [color]',
    async execute(client, message, args) {
      const name = args[0];
      if (!name) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike rolecreate <name> [color]`')], allowedMentions: { repliedUser: false } });
      const color = args[1] || '#8B5CF6';
      try {
        const role = await message.guild.roles.create({ name, color, reason: `Created by ${message.author.tag}` });
        return message.reply({ embeds: [Embeds.success('Role Created', `Role ${role} (${role.name}) created.`)], allowedMentions: { repliedUser: false } });
      } catch (e) {
        return message.reply({ embeds: [Embeds.error('Error', e.message)], allowedMentions: { repliedUser: false } });
      }
    },
  },
  {
    name: 'roledelete',
    description: 'Delete a role',
    category: 'moderation',
    permission: 'admin',
    usage: '@role',
    async execute(client, message, args) {
      const role = Helpers.resolveRole(message.guild, args[0]);
      if (!role) return message.reply({ embeds: [Embeds.error('Not Found', 'Role not found.')], allowedMentions: { repliedUser: false } });
      try {
        await role.delete(`Deleted by ${message.author.tag}`);
        return message.reply({ embeds: [Embeds.success('Role Deleted', `Role ${role.name} deleted.`)], allowedMentions: { repliedUser: false } });
      } catch (e) {
        return message.reply({ embeds: [Embeds.error('Error', e.message)], allowedMentions: { repliedUser: false } });
      }
    },
  },
  {
    name: 'roleinfo',
    description: 'View info about a role',
    category: 'moderation',
    permission: 'everyone',
    usage: '@role',
    async execute(client, message, args) {
      const role = Helpers.resolveRole(message.guild, args[0]);
      if (!role) return message.reply({ embeds: [Embeds.error('Not Found', 'Role not found.')], allowedMentions: { repliedUser: false } });
      const embed = Embeds.info('Role Info', `Information for ${role}`)
        .addFields(
          { name: 'Name', value: role.name, inline: true },
          { name: 'ID', value: role.id, inline: true },
          { name: 'Color', value: role.hexColor, inline: true },
          { name: 'Members', value: role.members.size.toString(), inline: true },
          { name: 'Position', value: role.position.toString(), inline: true },
          { name: 'Mentionable', value: role.mentionable ? 'Yes' : 'No', inline: true },
          { name: 'Hoisted', value: role.hoist ? 'Yes' : 'No', inline: true },
          { name: 'Created', value: Helpers.discordTimestamp(role.createdAt), inline: true },
        );
      return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    },
  },

  // ============================================
  // MOD LOGS / CASES
  // ============================================
  {
    name: 'modcase',
    description: 'View a moderation case',
    category: 'moderation',
    permission: 'moderator',
    usage: '<caseId>',
    async execute(client, message, args) {
      const caseId = args[0];
      const cases = client.db.get(`cases_${message.guild.id}`) || [];
      const c = cases.find(x => x.id === caseId);
      if (!c) return message.reply({ embeds: [Embeds.error('Not Found', 'Case not found.')], allowedMentions: { repliedUser: false } });
      return message.reply({ embeds: [Embeds.info(`Case ${c.id}`, `**Type:** ${c.type}\n**User:** ${c.userTag} (${c.userId})\n**Moderator:** <@${c.moderator}>\n**Reason:** ${c.reason}\n**When:** ${Helpers.discordTimestamp(c.timestamp)}`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'modcases',
    description: 'View all moderation cases',
    category: 'moderation',
    permission: 'moderator',
    aliases: ['cases', 'caselist'],
    async execute(client, message, args) {
      const cases = client.db.get(`cases_${message.guild.id}`) || [];
      if (cases.length === 0) return message.reply({ embeds: [Embeds.info('No Cases', 'No moderation cases recorded.')], allowedMentions: { repliedUser: false } });
      const list = cases.slice(-10).map(c => `**${c.id}** — ${c.type} — ${c.userTag}`).join('\n');
      return message.reply({ embeds: [Embeds.info('Recent Cases', `Last ${Math.min(10, cases.length)} cases:`).addFields({ name: '\u200B', value: list })], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'modlog',
    description: 'Set the moderation log channel',
    category: 'moderation',
    permission: 'admin',
    usage: '#channel',
    async execute(client, message, args) {
      const channel = Helpers.resolveChannel(message.guild, args[0]);
      if (!channel) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike modlog #channel`')], allowedMentions: { repliedUser: false } });
      client.db.set(`modlog_channel_${message.guild.id}`, channel.id);
      return message.reply({ embeds: [Embeds.success('Modlog Set', `Moderation logs will be sent to ${channel}.`)], allowedMentions: { repliedUser: false } });
    },
  },

  // ============================================
  // ADDITIONAL MODERATION
  // ============================================
  {
    name: 'userinfo',
    description: 'View info about a user',
    category: 'moderation',
    permission: 'everyone',
    usage: '[@user]',
    aliases: ['whois', 'uinfo'],
    async execute(client, message, args) {
      const target = await Helpers.resolveMember(message.guild, args[0]) || message.member;
      const user = target.user;
      const embed = Embeds.info(`User Info: ${user.tag}`, '')
        .setThumbnail(user.displayAvatarURL({ size: 256, extension: 'png' }))
        .addFields(
          { name: 'Username', value: user.tag, inline: true },
          { name: 'ID', value: user.id, inline: true },
          { name: 'Bot', value: user.bot ? 'Yes' : 'No', inline: true },
          { name: 'Account Created', value: Helpers.discordTimestamp(user.createdAt), inline: true },
          { name: 'Joined Server', value: target.joinedAt ? Helpers.discordTimestamp(target.joinedAt) : 'Unknown', inline: true },
          { name: 'Roles', value: target.roles.cache.size > 0 ? target.roles.cache.map(r => r.toString()).join(', ') : 'None', inline: false },
        );
      if (user.banner) embed.setImage(user.bannerURL({ size: 1024 }));
      return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'serverinfo',
    description: 'View info about the server',
    category: 'moderation',
    permission: 'everyone',
    aliases: ['sinfo', 'guildinfo'],
    async execute(client, message) {
      const g = message.guild;
      await g.fetch();
      const embed = Embeds.info(`Server Info: ${g.name}`, '')
        .setThumbnail(g.iconURL({ size: 256, extension: 'png' }))
        .addFields(
          { name: 'Server Name', value: g.name, inline: true },
          { name: 'Server ID', value: g.id, inline: true },
          { name: 'Owner', value: `<@${g.ownerId}>`, inline: true },
          { name: 'Members', value: g.memberCount.toString(), inline: true },
          { name: 'Channels', value: g.channels.cache.size.toString(), inline: true },
          { name: 'Roles', value: g.roles.cache.size.toString(), inline: true },
          { name: 'Created', value: Helpers.discordTimestamp(g.createdAt), inline: true },
          { name: 'Boost Level', value: `Level ${g.premiumTier} (${g.premiumSubscriptionCount} boosts)`, inline: true },
          { name: 'Verification', value: g.verificationLevel, inline: true },
        );
      if (g.banner) embed.setImage(g.bannerURL({ size: 1024 }));
      return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'snipe',
    description: 'View last deleted message',
    category: 'moderation',
    permission: 'everyone',
    async execute(client, message) {
      const sniped = client.db.get(`snipe_${message.channel.id}`);
      if (!sniped) return message.reply({ embeds: [Embeds.info('Nothing to Snipe', 'No recently deleted messages.')], allowedMentions: { repliedUser: false } });
      const embed = Embeds.info('Sniped Message', sniped.content || '[No text content]')
        .setAuthor({ name: sniped.author, iconURL: sniped.authorAvatar })
        .setFooter({ text: `Deleted ${Helpers.discordTimestamp(sniped.timestamp)}` });
      return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'announce',
    description: 'Send an announcement to a channel',
    category: 'moderation',
    permission: 'admin',
    usage: '#channel <message>',
    async execute(client, message, args) {
      const channel = Helpers.resolveChannel(message.guild, args[0]);
      const text = args.slice(1).join(' ');
      if (!channel || !text) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike announce #channel <message>`')], allowedMentions: { repliedUser: false } });
      const embed = Embeds.primary('📢 Announcement', text).setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() });
      await channel.send({ embeds: [embed] });
      return message.reply({ embeds: [Embeds.success('Announced', `Announcement sent to ${channel}.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'say',
    description: 'Make the bot say something',
    category: 'moderation',
    permission: 'moderator',
    usage: '<message>',
    async execute(client, message, args) {
      const text = args.join(' ');
      if (!text) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike say <message>`')], allowedMentions: { repliedUser: false } });
      await message.delete().catch(() => {});
      return message.channel.send({ content: text });
    },
  },
  {
    name: 'embed',
    description: 'Send an embed message',
    category: 'moderation',
    permission: 'moderator',
    usage: '<title> | <description>',
    async execute(client, message, args) {
      const text = args.join(' ');
      const [title, desc] = text.split('|').map(s => s.trim());
      if (!title || !desc) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike embed <title> | <description>`')], allowedMentions: { repliedUser: false } });
      await message.delete().catch(() => {});
      return message.channel.send({ embeds: [Embeds.primary(title, desc)] });
    },
  },
  {
    name: 'poll',
    description: 'Create a poll',
    category: 'moderation',
    permission: 'moderator',
    usage: '<question>',
    async execute(client, message, args) {
      const question = args.join(' ');
      if (!question) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike poll <question>`')], allowedMentions: { repliedUser: false } });
      const embed = Embeds.primary('📊 Poll', question).setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() });
      const pollMsg = await message.channel.send({ embeds: [embed] });
      await pollMsg.react('👍');
      await pollMsg.react('👎');
      await pollMsg.react('🤷');
      return message.delete().catch(() => {});
    },
  },
  {
    name: 'reminder',
    description: 'Set a reminder',
    category: 'moderation',
    permission: 'everyone',
    usage: '<duration> <message>',
    aliases: ['remind', 'remindme'],
    async execute(client, message, args) {
      const duration = Helpers.parseDuration(args[0]);
      const text = args.slice(1).join(' ');
      if (!duration || !text) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike reminder <1h/30m> <message>`')], allowedMentions: { repliedUser: false } });
      await message.reply({ embeds: [Embeds.success('Reminder Set', `I'll remind you in ${Helpers.formatDuration(duration)}: ${text}`)], allowedMentions: { repliedUser: false } });
      setTimeout(async () => {
        try {
          await message.reply({ content: `<@${message.author.id}> ⏰ **Reminder:** ${text}`, allowedMentions: { users: [message.author.id] } });
        } catch {}
      }, duration);
    },
  },
  {
    name: 'auditlog',
    description: 'View recent audit logs',
    category: 'moderation',
    permission: 'admin',
    usage: '[limit]',
    async execute(client, message, args) {
      const limit = Math.min(parseInt(args[0]) || 10, 25);
      try {
        const logs = await message.guild.fetchAuditLogs({ limit });
        const entries = logs.entries.map(e => `**${e.action}** — ${e.executor?.tag || 'Unknown'} — ${Helpers.discordTimestamp(e.createdTimestamp)}`).join('\n');
        return message.reply({ embeds: [Embeds.info('Audit Log', 'Recent server actions:').addFields({ name: '\u200B', value: Helpers.truncate(entries, 1024) })], allowedMentions: { repliedUser: false } });
      } catch (e) {
        return message.reply({ embeds: [Embeds.error('Error', e.message)], allowedMentions: { repliedUser: false } });
      }
    },
  },
  {
    name: 'setstaffrole',
    description: 'Set the staff role for the server',
    category: 'moderation',
    permission: 'admin',
    usage: '@role',
    async execute(client, message, args) {
      const role = Helpers.resolveRole(message.guild, args[0]);
      if (!role) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike setstaffrole @role`')], allowedMentions: { repliedUser: false } });
      client.permissions.setStaffRole(message.guild.id, role.id);
      return message.reply({ embeds: [Embeds.success('Staff Role Set', `${role} is now a staff role. Members with this role can use staff commands.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'removestaffrole',
    description: 'Remove a staff role',
    category: 'moderation',
    permission: 'admin',
    usage: '@role',
    async execute(client, message, args) {
      const role = Helpers.resolveRole(message.guild, args[0]);
      if (!role) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike removestaffrole @role`')], allowedMentions: { repliedUser: false } });
      client.permissions.removeStaffRole(message.guild.id, role.id);
      return message.reply({ embeds: [Embeds.success('Removed', `${role.name} is no longer a staff role.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'staffroles',
    description: 'List all staff roles',
    category: 'moderation',
    permission: 'admin',
    async execute(client, message) {
      const roles = client.permissions.getStaffRoles(message.guild.id);
      if (roles.length === 0) return message.reply({ embeds: [Embeds.info('No Staff Roles', 'No staff roles configured. Use `@Zike setstaffrole @role` to add one.')], allowedMentions: { repliedUser: false } });
      return message.reply({ embeds: [Embeds.info('Staff Roles', roles.map(r => `<@&${r}>`).join('\n'))], allowedMentions: { repliedUser: false } });
    },
  },
];

/**
 * Save a moderation case to database
 */
function saveModCase(client, guildId, type, user, moderator, reason) {
  const cases = client.db.get(`cases_${guildId}`) || [];
  const caseId = `#${(cases.length + 1).toString().padStart(4, '0')}`;
  cases.push({
    id: caseId,
    type,
    userId: user.id,
    userTag: user.tag,
    moderator: moderator.id,
    reason,
    timestamp: Date.now(),
  });
  client.db.set(`cases_${guildId}`, cases);
}

module.exports = moderationCommands;
