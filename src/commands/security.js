const Embeds = require('../utils/Embeds');
const Helpers = require('../utils/Helpers');
const { ChannelType, PermissionFlagsBits } = require('discord.js');

// ============================================
// SECURITY COMMANDS (40+ commands)
// ============================================

const securityCommands = [
  // ============================================
  // ANTI-NUKE SYSTEM
  // ============================================
  {
    name: 'antinuke',
    description: 'View anti-nuke status',
    category: 'security',
    permission: 'admin',
    async execute(client, message) {
      const enabled = client.db.get(`antinuke_enabled_${message.guild.id}`);
      const whitelist = client.db.get(`antinuke_whitelist_${message.guild.id}`) || [];
      const settings = {
        ban: client.db.get(`antinuke_ban_limit_${message.guild.id}`) || 3,
        channel: client.db.get(`antinuke_channel_limit_${message.guild.id}`) || 5,
        channelDelete: client.db.get(`antinuke_channel_delete_limit_${message.guild.id}`) || 3,
        role: client.db.get(`antinuke_role_limit_${message.guild.id}`) || 5,
        roleDelete: client.db.get(`antinuke_role_delete_limit_${message.guild.id}`) || 3,
        window: (client.db.get(`antinuke_window_${message.guild.id}`) || 60000) / 1000,
        joinThreshold: client.db.get(`antinuke_join_threshold_${message.guild.id}`) || 10,
        minAccountAge: client.db.get(`antinuke_min_account_age_${message.guild.id}`) || 0,
      };

      const embed = Embeds.base({ color: enabled ? 0x10B981 : 0x6B7280 })
        .setTitle(`🛡️ Anti-Nuke ${enabled ? '(ENABLED)' : '(DISABLED)'}`)
        .setDescription(`Anti-nuke protection ${enabled ? 'is **active**' : 'is **off**'} for this server.`)
        .addFields(
          { name: 'Ban Limit', value: `${settings.ban} per ${settings.window}s`, inline: true },
          { name: 'Channel Create', value: `${settings.channel} per ${settings.window}s`, inline: true },
          { name: 'Channel Delete', value: `${settings.channelDelete} per ${settings.window}s`, inline: true },
          { name: 'Role Create', value: `${settings.role} per ${settings.window}s`, inline: true },
          { name: 'Role Delete', value: `${settings.roleDelete} per ${settings.window}s`, inline: true },
          { name: 'Join Threshold', value: `${settings.joinThreshold} joins`, inline: true },
          { name: 'Min Account Age', value: settings.minAccountAge ? `${settings.minAccountAge} days` : 'Off', inline: true },
          { name: 'Whitelisted Users', value: whitelist.length ? whitelist.map(id => `<@${id}>`).join(', ') : 'None', inline: false },
        );
      return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'antinukeon',
    description: 'Enable anti-nuke protection',
    category: 'security',
    permission: 'admin',
    async execute(client, message) {
      client.db.set(`antinuke_enabled_${message.guild.id}`, true);
      return message.reply({ embeds: [Embeds.success('Anti-Nuke Enabled', '🛡️ Anti-nuke protection is now **ACTIVE**.')], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'antinukeoff',
    description: 'Disable anti-nuke protection',
    category: 'security',
    permission: 'admin',
    async execute(client, message) {
      client.db.set(`antinuke_enabled_${message.guild.id}`, false);
      return message.reply({ embeds: [Embeds.warning('Anti-Nuke Disabled', 'Anti-nuke protection is now **OFF**.')], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'antinukewhitelist',
    description: 'Whitelist a user from anti-nuke',
    category: 'security',
    permission: 'admin',
    usage: '@user',
    aliases: ['anwhitelist', 'whitelistuser'],
    async execute(client, message, args) {
      const user = await Helpers.resolveUser(client, args[0]);
      if (!user) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike antinukewhitelist @user`')], allowedMentions: { repliedUser: false } });
      const whitelist = client.db.get(`antinuke_whitelist_${message.guild.id}`) || [];
      if (whitelist.includes(user.id)) {
        const filtered = whitelist.filter(id => id !== user.id);
        client.db.set(`antinuke_whitelist_${message.guild.id}`, filtered);
        return message.reply({ embeds: [Embeds.success('Removed', `${user.tag} removed from whitelist.`)], allowedMentions: { repliedUser: false } });
      }
      whitelist.push(user.id);
      client.db.set(`antinuke_whitelist_${message.guild.id}`, whitelist);
      return message.reply({ embeds: [Embeds.success('Whitelisted', `${user.tag} is now whitelisted from anti-nuke.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'antinukelimits',
    description: 'Set anti-nuke limits',
    category: 'security',
    permission: 'admin',
    usage: '<type> <limit>',
    async execute(client, message, args) {
      const type = args[0]?.toLowerCase();
      const limit = parseInt(args[1]);
      const validTypes = ['ban', 'channel', 'channeldelete', 'role', 'roledelete', 'join', 'window'];
      if (!validTypes.includes(type) || isNaN(limit)) {
        return message.reply({ embeds: [Embeds.error('Usage', '`@Zike antinukelimits <ban|channel|role|join|window> <number>`')], allowedMentions: { repliedUser: false } });
      }
      const keyMap = {
        ban: 'antinuke_ban_limit',
        channel: 'antinuke_channel_limit',
        channeldelete: 'antinuke_channel_delete_limit',
        role: 'antinuke_role_limit',
        roledelete: 'antinuke_role_delete_limit',
        join: 'antinuke_join_threshold',
        window: 'antinuke_window',
      };
      const value = type === 'window' ? limit * 1000 : limit;
      client.db.set(`${keyMap[type]}_${message.guild.id}`, value);
      return message.reply({ embeds: [Embeds.success('Limit Set', `${type} limit set to ${limit}.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'antinukelog',
    description: 'Set anti-nuke log channel',
    category: 'security',
    permission: 'admin',
    usage: '#channel',
    async execute(client, message, args) {
      const channel = Helpers.resolveChannel(message.guild, args[0]);
      if (!channel) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike antinukelog #channel`')], allowedMentions: { repliedUser: false } });
      client.db.set(`antinuke_log_channel_${message.guild.id}`, channel.id);
      client.db.set(`antinuke_alert_channel_${message.guild.id}`, channel.id);
      return message.reply({ embeds: [Embeds.success('Log Set', `Anti-nuke logs will be sent to ${channel}.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'minaccountage',
    description: 'Set minimum account age for joining (days)',
    category: 'security',
    permission: 'admin',
    usage: '<days>',
    async execute(client, message, args) {
      const days = parseInt(args[0]);
      if (isNaN(days)) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike minaccountage <days>`')], allowedMentions: { repliedUser: false } });
      client.db.set(`antinuke_min_account_age_${message.guild.id}`, days);
      return message.reply({ embeds: [Embeds.success('Set', `Minimum account age set to ${days} days.`)], allowedMentions: { repliedUser: false } });
    },
  },

  // ============================================
  // LOCKDOWN
  // ============================================
  {
    name: 'lockdown',
    description: 'Lock down the entire server',
    category: 'security',
    permission: 'admin',
    aliases: ['serverlock', 'panic'],
    async execute(client, message) {
      const channels = message.guild.channels.cache.filter(c =>
        c.type === ChannelType.GuildText || c.type === ChannelType.GuildVoice
      );
      let locked = 0;
      const status = await message.reply({ embeds: [Embeds.loading('Lockdown', 'Locking all channels...')] });
      for (const [, channel] of channels) {
        try {
          await channel.permissionOverwrites.edit(message.guild.id, {
            SendMessages: false,
            Connect: false,
          });
          locked++;
        } catch {}
      }
      client.db.set(`lockdown_${message.guild.id}`, true);
      return status.edit({ embeds: [Embeds.error('🔒 LOCKDOWN ACTIVE', `${locked} channels locked. Server is in lockdown mode.`)] });
    },
  },
  {
    name: 'unlockdown',
    description: 'Remove server lockdown',
    category: 'security',
    permission: 'admin',
    async execute(client, message) {
      const channels = message.guild.channels.cache.filter(c =>
        c.type === ChannelType.GuildText || c.type === ChannelType.GuildVoice
      );
      let unlocked = 0;
      const status = await message.reply({ embeds: [Embeds.loading('Unlocking', 'Restoring channels...')] });
      for (const [, channel] of channels) {
        try {
          await channel.permissionOverwrites.edit(message.guild.id, {
            SendMessages: null,
            Connect: null,
          });
          unlocked++;
        } catch {}
      }
      client.db.set(`lockdown_${message.guild.id}`, false);
      return status.edit({ embeds: [Embeds.success('🔓 Lockdown Removed', `${unlocked} channels restored.`)] });
    },
  },
  {
    name: 'quarantine',
    description: 'Quarantine a user (remove all roles, add quarantine role)',
    category: 'security',
    permission: 'moderator',
    usage: '@user [reason]',
    async execute(client, message, args) {
      const target = await Helpers.resolveMember(message.guild, args[0]);
      if (!target) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike quarantine @user`')], allowedMentions: { repliedUser: false } });

      // Create quarantine role if doesn't exist
      let quarantineRole = message.guild.roles.cache.find(r => r.name === 'Quarantined');
      if (!quarantineRole) {
        try {
          quarantineRole = await message.guild.roles.create({
            name: 'Quarantined',
            color: 0x808080,
            permissions: [],
            reason: 'Quarantine role creation',
          });
          // Deny all channels for quarantine role
          for (const [, channel] of message.guild.channels.cache) {
            await channel.permissionOverwrites.edit(quarantineRole.id, {
              ViewChannel: false,
              SendMessages: false,
            }).catch(() => {});
          }
        } catch (e) {
          return message.reply({ embeds: [Embeds.error('Error', `Failed to create quarantine role: ${e.message}`)], allowedMentions: { repliedUser: false } });
        }
      }

      // Save old roles
      const oldRoles = target.roles.cache.filter(r => r.id !== message.guild.id).map(r => r.id);
      client.db.set(`quarantine_roles_${message.guild.id}_${target.id}`, oldRoles);

      // Remove all roles and add quarantine
      await target.roles.set([quarantineRole.id], `Quarantined by ${message.author.tag}`);

      return message.reply({ embeds: [Embeds.warning('Quarantined', `${target.user.tag} has been quarantined. Use \`@Zike unquarantine\` to restore.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'unquarantine',
    description: 'Restore a quarantined user',
    category: 'security',
    permission: 'moderator',
    usage: '@user',
    async execute(client, message, args) {
      const target = await Helpers.resolveMember(message.guild, args[0]);
      if (!target) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike unquarantine @user`')], allowedMentions: { repliedUser: false } });
      const oldRoles = client.db.get(`quarantine_roles_${message.guild.id}_${target.id}`) || [];
      const quarantineRole = message.guild.roles.cache.find(r => r.name === 'Quarantined');
      if (quarantineRole) await target.roles.remove(quarantineRole.id).catch(() => {});
      if (oldRoles.length > 0) await target.roles.add(oldRoles).catch(() => {});
      client.db.delete(`quarantine_roles_${message.guild.id}_${target.id}`);
      return message.reply({ embeds: [Embeds.success('Restored', `${target.user.tag} has been unquarantined.`)], allowedMentions: { repliedUser: false } });
    },
  },

  // ============================================
  // ANTI-RAID
  // ============================================
  {
    name: 'antiraid',
    description: 'Toggle anti-raid mode',
    category: 'security',
    permission: 'admin',
    async execute(client, message) {
      const enabled = client.db.get(`antiraid_${message.guild.id}`);
      client.db.set(`antiraid_${message.guild.id}`, !enabled);
      return message.reply({ embeds: [Embeds.success('Anti-Raid', `Anti-raid mode is now **${!enabled ? 'ENABLED' : 'DISABLED'}**.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'raidmode',
    description: 'Toggle raid mode (kicks new joiners)',
    category: 'security',
    permission: 'admin',
    async execute(client, message) {
      const enabled = client.db.get(`raidmode_${message.guild.id}`);
      client.db.set(`raidmode_${message.guild.id}`, !enabled);
      return message.reply({ embeds: [Embeds.warning('Raid Mode', `Raid mode is now **${!enabled ? 'ACTIVE' : 'OFF'}**. New members will be ${!enabled ? 'auto-kicked' : 'allowed to join'}.`)], allowedMentions: { repliedUser: false } });
    },
  },

  // ============================================
  // SECURITY CHECKS
  // ============================================
  {
    name: 'securitycheck',
    description: 'Run a security audit on the server',
    category: 'security',
    permission: 'admin',
    aliases: ['securityaudit', 'audit'],
    async execute(client, message) {
      const g = message.guild;
      const issues = [];

      // Check verification level
      if (g.verificationLevel === 'None' || g.verificationLevel === 0) {
        issues.push('⚠️ Verification level is None - anyone can join');
      }

      // Check permissions for @everyone
      const everyoneRole = g.roles.everyone;
      if (everyoneRole.permissions.has(PermissionFlagsBits.Administrator)) {
        issues.push('🚨 @everyone has Administrator permission!');
      }
      if (everyoneRole.permissions.has(PermissionFlagsBits.ManageChannels)) {
        issues.push('⚠️ @everyone can manage channels');
      }
      if (everyoneRole.permissions.has(PermissionFlagsBits.ManageRoles)) {
        issues.push('⚠️ @everyone can manage roles');
      }
      if (everyoneRole.permissions.has(PermissionFlagsBits.BanMembers)) {
        issues.push('🚨 @everyone can ban members!');
      }
      if (everyoneRole.permissions.has(PermissionFlagsBits.MentionEveryone)) {
        issues.push('⚠️ @everyone can mention @everyone');
      }

      // Check dangerous role permissions
      const dangerousPerms = ['Administrator', 'BanMembers', 'KickMembers', 'ManageGuild', 'ManageWebhooks'];
      for (const [roleId, role] of g.roles.cache) {
        if (role.tags?.botId) continue;
        for (const perm of dangerousPerms) {
          if (role.permissions.has(PermissionFlagsBits[perm]) && role.members.size > 5) {
            issues.push(`⚠️ Role "${role.name}" has ${perm} and is assigned to ${role.members.size} members`);
          }
        }
      }

      // Check for webhook safety
      const webhooks = await g.fetchWebhooks().catch(() => ({ size: 0 }));
      if (webhooks.size > 10) {
        issues.push(`ℹ️ ${webhooks.size} webhooks found - review for safety`);
      }

      // Check if anti-nuke is enabled
      if (!client.db.get(`antinuke_enabled_${g.id}`)) {
        issues.push('⚠️ Anti-nuke is NOT enabled');
      }

      const embed = issues.length === 0
        ? Embeds.success('Security Check Passed', '✅ No major security issues found!')
        : Embeds.warning('Security Check Results', `Found ${issues.length} potential issue(s):`).addFields({ name: 'Issues', value: issues.join('\n') });

      embed.addFields(
        { name: 'Server Stats', value: `Members: ${g.memberCount}\nRoles: ${g.roles.cache.size}\nChannels: ${g.channels.cache.size}\nVerification: ${g.verificationLevel}`, inline: false }
      );

      return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'serverstats',
    description: 'View detailed server statistics',
    category: 'security',
    permission: 'everyone',
    async execute(client, message) {
      const g = message.guild;
      const members = await g.members.fetch();
      const humans = members.filter(m => !m.user.bot).size;
      const bots = members.filter(m => m.user.bot).size;
      const online = members.filter(m => m.presence?.status === 'online').size;
      const channels = g.channels.cache;
      const textChannels = channels.filter(c => c.type === ChannelType.GuildText).size;
      const voiceChannels = channels.filter(c => c.type === ChannelType.GuildVoice).size;
      const categories = channels.filter(c => c.type === ChannelType.GuildCategory).size;

      const embed = Embeds.info('Server Statistics', `Stats for **${g.name}**`)
        .setThumbnail(g.iconURL({ size: 256, extension: 'png' }))
        .addFields(
          { name: '👥 Members', value: `Total: ${g.memberCount}\nHumans: ${humans}\nBots: ${bots}\nOnline: ${online}`, inline: true },
          { name: '📺 Channels', value: `Text: ${textChannels}\nVoice: ${voiceChannels}\nCategories: ${categories}\nTotal: ${channels.size}`, inline: true },
          { name: '🎭 Roles', value: `${g.roles.cache.size} roles`, inline: true },
          { name: '🚀 Boosts', value: `Level ${g.premiumTier}\n${g.premiumSubscriptionCount} boosts`, inline: true },
          { name: '📅 Created', value: Helpers.discordTimestamp(g.createdAt), inline: true },
          { name: '🔐 Verification', value: g.verificationLevel, inline: true },
        );
      return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    },
  },

  // ============================================
  // PERMISSION MANAGEMENT
  // ============================================
  {
    name: 'roleperms',
    description: 'View permissions of a role',
    category: 'security',
    permission: 'admin',
    usage: '@role',
    async execute(client, message, args) {
      const role = Helpers.resolveRole(message.guild, args[0]) || message.guild.roles.everyone;
      const perms = role.permissions.toArray();
      const embed = Embeds.info('Role Permissions', `Permissions for ${role.name}`)
        .addFields({ name: 'Permissions', value: perms.length ? perms.join(', ') : 'None' });
      return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'channelperms',
    description: 'View permissions of a channel',
    category: 'security',
    permission: 'admin',
    usage: '[#channel]',
    async execute(client, message, args) {
      const channel = Helpers.resolveChannel(message.guild, args[0]) || message.channel;
      const overwrites = channel.permissionOverwrites.cache;
      const list = [];
      for (const [id, overwrite] of overwrites) {
        const target = id === message.guild.id ? '@everyone' :
          message.guild.roles.cache.has(id) ? `<@&${id}>` : `<@${id}>`;
        const allowed = overwrite.allow.toArray();
        const denied = overwrite.deny.toArray();
        list.push(`**${target}**\n✅ ${allowed.join(', ') || 'None'}\n❌ ${denied.join(', ') || 'None'}`);
      }
      return message.reply({ embeds: [Embeds.info('Channel Permissions', `Permissions for ${channel.name}`).addFields({ name: '\u200B', value: list.join('\n\n') || 'No overwrites' })], allowedMentions: { repliedUser: false } });
    },
  },

  // ============================================
  // AUTOMOD
  // ============================================
  {
    name: 'automod',
    description: 'View automod status',
    category: 'security',
    permission: 'admin',
    async execute(client, message) {
      const settings = {
        words: client.db.get(`automod_words_${message.guild.id}`) || [],
        links: client.db.get(`automod_links_${message.guild.id}`),
        invites: client.db.get(`automod_invites_${message.guild.id}`),
        mentions: client.db.get(`automod_mentions_${message.guild.id}`) || 0,
        spam: client.db.get(`automod_spam_${message.guild.id}`) || 0,
      };
      const embed = Embeds.base({ color: 0x8B5CF6 })
        .setTitle('🤖 AutoMod Settings')
        .addFields(
          { name: 'Bad Words', value: settings.words.length ? settings.words.join(', ') : 'None', inline: false },
          { name: 'Block Links', value: settings.links ? '✅' : '❌', inline: true },
          { name: 'Block Invites', value: settings.invites ? '✅' : '❌', inline: true },
          { name: 'Max Mentions', value: settings.mentions || 'Off', inline: true },
          { name: 'Spam Threshold', value: settings.spam || 'Off', inline: true },
        );
      return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'automodwords',
    description: 'Add/remove bad words to automod',
    category: 'security',
    permission: 'admin',
    usage: '<add|remove|list> [word]',
    async execute(client, message, args) {
      const action = args[0]?.toLowerCase();
      const word = args[1]?.toLowerCase();
      const words = client.db.get(`automod_words_${message.guild.id}`) || [];
      if (action === 'add' && word) {
        if (!words.includes(word)) words.push(word);
        client.db.set(`automod_words_${message.guild.id}`, words);
        return message.reply({ embeds: [Embeds.success('Added', `Word "${word}" added to bad words list.`)], allowedMentions: { repliedUser: false } });
      }
      if (action === 'remove' && word) {
        const filtered = words.filter(w => w !== word);
        client.db.set(`automod_words_${message.guild.id}`, filtered);
        return message.reply({ embeds: [Embeds.success('Removed', `Word "${word}" removed.`)], allowedMentions: { repliedUser: false } });
      }
      if (action === 'list') {
        return message.reply({ embeds: [Embeds.info('Bad Words', words.length ? words.join(', ') : 'No words set')], allowedMentions: { repliedUser: false } });
      }
      return message.reply({ embeds: [Embeds.error('Usage', '`@Zike automodwords <add|remove|list> [word]`')], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'automodlinks',
    description: 'Toggle link blocking',
    category: 'security',
    permission: 'admin',
    async execute(client, message) {
      const enabled = client.db.get(`automod_links_${message.guild.id}`);
      client.db.set(`automod_links_${message.guild.id}`, !enabled);
      return message.reply({ embeds: [Embeds.success('AutoMod', `Link blocking is now **${!enabled ? 'ON' : 'OFF'}**.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'automodinvites',
    description: 'Toggle invite blocking',
    category: 'security',
    permission: 'admin',
    async execute(client, message) {
      const enabled = client.db.get(`automod_invites_${message.guild.id}`);
      client.db.set(`automod_invites_${message.guild.id}`, !enabled);
      return message.reply({ embeds: [Embeds.success('AutoMod', `Invite blocking is now **${!enabled ? 'ON' : 'OFF'}**.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'automodmentions',
    description: 'Set max mentions per message',
    category: 'security',
    permission: 'admin',
    usage: '<count>',
    async execute(client, message, args) {
      const count = parseInt(args[0]);
      if (isNaN(count)) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike automodmentions <count>`')], allowedMentions: { repliedUser: false } });
      client.db.set(`automod_mentions_${message.guild.id}`, count);
      return message.reply({ embeds: [Embeds.success('Set', `Max mentions set to ${count}.`)], allowedMentions: { repliedUser: false } });
    },
  },

  // ============================================
  // WHITELIST / BLACKLIST
  // ============================================
  {
    name: 'whitelist',
    description: 'Whitelist a user from automod',
    category: 'security',
    permission: 'admin',
    usage: '@user',
    async execute(client, message, args) {
      const user = await Helpers.resolveUser(client, args[0]);
      if (!user) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike whitelist @user`')], allowedMentions: { repliedUser: false } });
      const list = client.db.get(`automod_whitelist_${message.guild.id}`) || [];
      if (!list.includes(user.id)) list.push(user.id);
      client.db.set(`automod_whitelist_${message.guild.id}`, list);
      return message.reply({ embeds: [Embeds.success('Whitelisted', `${user.tag} is now whitelisted from automod.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'unwhitelist',
    description: 'Remove user from automod whitelist',
    category: 'security',
    permission: 'admin',
    usage: '@user',
    async execute(client, message, args) {
      const user = await Helpers.resolveUser(client, args[0]);
      if (!user) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike unwhitelist @user`')], allowedMentions: { repliedUser: false } });
      const list = client.db.get(`automod_whitelist_${message.guild.id}`) || [];
      const filtered = list.filter(id => id !== user.id);
      client.db.set(`automod_whitelist_${message.guild.id}`, filtered);
      return message.reply({ embeds: [Embeds.success('Removed', `${user.tag} removed from whitelist.`)], allowedMentions: { repliedUser: false } });
    },
  },

  // ============================================
  // BACKUP
  // ============================================
  {
    name: 'backup',
    description: 'Create a server backup',
    category: 'security',
    permission: 'admin',
    async execute(client, message) {
      const g = message.guild;
      const backup = {
        id: Helpers.generateId(8),
        name: g.name,
        roles: g.roles.cache.map(r => ({
          name: r.name,
          color: r.hexColor,
          permissions: r.permissions.toArray(),
          position: r.position,
          hoist: r.hoist,
          mentionable: r.mentionable,
        })),
        channels: g.channels.cache.map(c => ({
          name: c.name,
          type: c.type,
          position: c.position,
          topic: c.topic || null,
          parentId: c.parentId,
        })),
        createdAt: Date.now(),
      };
      const backups = client.db.get(`backups_${g.id}`) || [];
      backups.push(backup);
      client.db.set(`backups_${g.id}`, backups);
      return message.reply({ embeds: [Embeds.success('Backup Created', `Backup ID: ${backup.id}\nSaved ${backup.roles.length} roles and ${backup.channels.length} channels.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'backups',
    description: 'List all server backups',
    category: 'security',
    permission: 'admin',
    async execute(client, message) {
      const backups = client.db.get(`backups_${message.guild.id}`) || [];
      if (backups.length === 0) return message.reply({ embeds: [Embeds.info('No Backups', 'No backups found.')], allowedMentions: { repliedUser: false } });
      const list = backups.map(b => `**${b.id}** — ${b.name} — ${Helpers.discordTimestamp(b.createdAt)} — ${b.roles.length} roles, ${b.channels.length} channels`).join('\n');
      return message.reply({ embeds: [Embeds.info('Backups', list)], allowedMentions: { repliedUser: false } });
    },
  },

  // ============================================
  // WEBHOOK PROTECTION
  // ============================================
  {
    name: 'webhooks',
    description: 'List all webhooks in the server',
    category: 'security',
    permission: 'admin',
    async execute(client, message) {
      const webhooks = await message.guild.fetchWebhooks().catch(() => ({ size: 0 }));
      if (webhooks.size === 0) return message.reply({ embeds: [Embeds.info('No Webhooks', 'No webhooks found.')], allowedMentions: { repliedUser: false } });
      const list = webhooks.map(w => `**${w.name}** — <#${w.channelId}> — Created by ${w.owner?.tag || 'Unknown'}`).join('\n');
      return message.reply({ embeds: [Embeds.info('Webhooks', `**${webhooks.size} webhooks:**`).addFields({ name: '\u200B', value: list })], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'deletewebhooks',
    description: 'Delete all webhooks (dangerous)',
    category: 'security',
    permission: 'admin',
    async execute(client, message) {
      const webhooks = await message.guild.fetchWebhooks();
      let count = 0;
      for (const [, webhook] of webhooks) {
        try { await webhook.delete(); count++; } catch {}
      }
      return message.reply({ embeds: [Embeds.warning('Webhooks Deleted', `Deleted ${count} webhooks.`)], allowedMentions: { repliedUser: false } });
    },
  },

  // ============================================
  // BOT MANAGEMENT
  // ============================================
  {
    name: 'botlist',
    description: 'List all bots in the server',
    category: 'security',
    permission: 'admin',
    async execute(client, message) {
      const members = await message.guild.members.fetch();
      const bots = members.filter(m => m.user.bot);
      if (bots.size === 0) return message.reply({ embeds: [Embeds.info('No Bots', 'No bots in this server.')], allowedMentions: { repliedUser: false } });
      const list = bots.map(b => `**${b.user.tag}** (${b.user.id}) — Added ${b.joinedAt ? Helpers.discordTimestamp(b.joinedAt) : 'Unknown'}`).join('\n');
      return message.reply({ embeds: [Embeds.info('Bot List', `**${bots.size} bots:**`).addFields({ name: '\u200B', value: Helpers.truncate(list, 1024) })], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'kickbots',
    description: 'Kick all bots except Zike',
    category: 'security',
    permission: 'admin',
    async execute(client, message) {
      const members = await message.guild.members.fetch();
      const bots = members.filter(m => m.user.bot && m.id !== client.user.id);
      let count = 0;
      for (const [, bot] of bots) {
        try { await bot.kick('Bot cleanup'); count++; } catch {}
      }
      return message.reply({ embeds: [Embeds.warning('Bots Kicked', `Kicked ${count} bots.`)], allowedMentions: { repliedUser: false } });
    },
  },

  // ============================================
  // INVITE MANAGEMENT
  // ============================================
  {
    name: 'serverinvites',
    description: 'List all server invites',
    category: 'security',
    permission: 'admin',
    async execute(client, message) {
      const invites = await message.guild.invites.fetch();
      if (invites.size === 0) return message.reply({ embeds: [Embeds.info('No Invites', 'No active invites.')], allowedMentions: { repliedUser: false } });
      const list = invites.map(i => `**${i.code}** — ${i.inviter?.tag || 'Unknown'} — ${i.uses}/${i.maxUses === 0 ? '∞' : i.maxUses} uses`).join('\n');
      return message.reply({ embeds: [Embeds.info('Server Invites', `**${invites.size} invites:**`).addFields({ name: '\u200B', value: Helpers.truncate(list, 1024) })], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'deleteinvites',
    description: 'Delete all server invites',
    category: 'security',
    permission: 'admin',
    async execute(client, message) {
      const invites = await message.guild.invites.fetch();
      let count = 0;
      for (const [, invite] of invites) {
        try { await invite.delete(); count++; } catch {}
      }
      return message.reply({ embeds: [Embeds.warning('Invites Deleted', `Deleted ${count} invites.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'createinvite',
    description: 'Create a server invite',
    category: 'security',
    permission: 'moderator',
    usage: '[#channel] [maxUses] [maxAge]',
    async execute(client, message, args) {
      const channel = Helpers.resolveChannel(message.guild, args[0]) || message.channel;
      const maxUses = parseInt(args[1]) || 0;
      const maxAge = parseInt(args[2]) || 0;
      const invite = await channel.createInvite({ maxUses, maxAge });
      return message.reply({ embeds: [Embeds.success('Invite Created', `https://discord.gg/${invite.code}`)], allowedMentions: { repliedUser: false } });
    },
  },

  // ============================================
  // MEMBER SCAN
  // ============================================
  {
    name: 'scanmembers',
    description: 'Scan for suspicious members (new accounts)',
    category: 'security',
    permission: 'admin',
    async execute(client, message) {
      const members = await message.guild.members.fetch();
      const suspicious = [];
      const now = Date.now();
      for (const [, member] of members) {
        const age = Helpers.accountAge(member.user);
        if (age < 7) suspicious.push(`${member.user.tag} (${age} days old)`);
      }
      if (suspicious.length === 0) return message.reply({ embeds: [Embeds.success('No Suspicious Members', 'No members with accounts less than 7 days old.')], allowedMentions: { repliedUser: false } });
      return message.reply({ embeds: [Embeds.warning('Suspicious Members', `Found ${suspicious.length} member(s) with new accounts:`).addFields({ name: 'Members', value: Helpers.truncate(suspicious.join('\n'), 1024) })], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'scanroles',
    description: 'Scan for roles with dangerous permissions',
    category: 'security',
    permission: 'admin',
    async execute(client, message) {
      const dangerous = ['Administrator', 'BanMembers', 'KickMembers', 'ManageGuild', 'ManageChannels', 'ManageRoles', 'ManageWebhooks'];
      const issues = [];
      for (const [, role] of message.guild.roles.cache) {
        if (role.tags?.botId) continue;
        for (const perm of dangerous) {
          if (role.permissions.has(PermissionFlagsBits[perm])) {
            issues.push(`**${role.name}** has ${perm} (${role.members.size} members)`);
          }
        }
      }
      if (issues.length === 0) return message.reply({ embeds: [Embeds.success('All Clear', 'No roles with dangerous permissions!')], allowedMentions: { repliedUser: false } });
      return message.reply({ embeds: [Embeds.warning('Role Audit', `Found ${issues.length} issue(s):`).addFields({ name: 'Issues', value: issues.join('\n') })], allowedMentions: { repliedUser: false } });
    },
  },

  // ============================================
  // MISC SECURITY
  // ============================================
  {
    name: 'verificationlevel',
    description: 'Set the server verification level',
    category: 'security',
    permission: 'admin',
    usage: '<None|Low|Medium|High|VeryHigh>',
    async execute(client, message, args) {
      const level = args[0];
      const valid = ['None', 'Low', 'Medium', 'High', 'VeryHigh'];
      if (!valid.includes(level)) return message.reply({ embeds: [Embeds.error('Usage', `Levels: ${valid.join(', ')}`)], allowedMentions: { repliedUser: false } });
      try {
        await message.guild.setVerificationLevel(level, `Set by ${message.author.tag}`);
        return message.reply({ embeds: [Embeds.success('Set', `Verification level set to ${level}.`)], allowedMentions: { repliedUser: false } });
      } catch (e) {
        return message.reply({ embeds: [Embeds.error('Error', e.message)], allowedMentions: { repliedUser: false } });
      }
    },
  },
  {
    name: 'explicitfilter',
    description: 'Set explicit content filter',
    category: 'security',
    permission: 'admin',
    usage: '<Disabled|MembersWithoutRoles|AllMembers>',
    async execute(client, message, args) {
      const level = args[0];
      const valid = ['Disabled', 'MembersWithoutRoles', 'AllMembers'];
      if (!valid.includes(level)) return message.reply({ embeds: [Embeds.error('Usage', `Levels: ${valid.join(', ')}`)], allowedMentions: { repliedUser: false } });
      try {
        await message.guild.setExplicitContentFilter(level, `Set by ${message.author.tag}`);
        return message.reply({ embeds: [Embeds.success('Set', `Explicit content filter set to ${level}.`)], allowedMentions: { repliedUser: false } });
      } catch (e) {
        return message.reply({ embeds: [Embeds.error('Error', e.message)], allowedMentions: { repliedUser: false } });
      }
    },
  },
];

module.exports = securityCommands;
