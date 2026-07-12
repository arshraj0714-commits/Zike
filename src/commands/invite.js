const Embeds = require('../utils/Embeds');
const Helpers = require('../utils/Helpers');

// ============================================
// INVITE TRACKER COMMANDS (15+ commands)
// ============================================

const inviteCommands = [
  {
    name: 'invites',
    description: 'View invite count for a user',
    category: 'invite',
    permission: 'everyone',
    usage: '[@user]',
    aliases: ['inv', 'invcount'],
    async execute(client, message, args) {
      const target = await Helpers.resolveMember(message.guild, args[0]) || message.member;
      const count = client.db.get(`invites_count_${message.guild.id}_${target.id}`) || 0;
      const total = client.db.get(`invites_total_${message.guild.id}_${target.id}`) || 0;
      const left = total - count;
      const embed = Embeds.primary('📨 Invite Count', `${target.user.tag} has invited ${count} members.`)
        .setThumbnail(target.user.displayAvatarURL({ size: 256, extension: 'png' }))
        .addFields(
          { name: '✅ Real', value: count.toString(), inline: true },
          { name: '❌ Left', value: left.toString(), inline: true },
          { name: '📊 Total', value: total.toString(), inline: true },
        );
      return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'inviteleaderboard',
    description: 'View top inviters',
    category: 'invite',
    permission: 'everyone',
    aliases: ['invlb', 'topinviters'],
    async execute(client, message) {
      const keys = client.db.keys(`invites_count_${message.guild.id}_*`);
      const data = keys.map(k => {
        const userId = k.replace(`invites_count_${message.guild.id}_`, '');
        return { userId, count: client.db.get(k) || 0 };
      }).sort((a, b) => b.count - a.count).slice(0, 10);

      if (data.length === 0) return message.reply({ embeds: [Embeds.info('No Data', 'No invite data yet.')], allowedMentions: { repliedUser: false } });

      const medals = ['🥇', '🥈', '🥉'];
      const list = data.map((d, i) => {
        const medal = medals[i] || `**${i + 1}.**`;
        return `${medal} <@${d.userId}> — **${d.count} invites**`;
      }).join('\n');

      return message.reply({ embeds: [Embeds.primary('🏆 Invite Leaderboard', `Top inviters in ${message.guild.name}`).addFields({ name: '\u200B', value: list })], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'invitesetup',
    description: 'Setup invite tracking',
    category: 'invite',
    permission: 'admin',
    usage: '#channel',
    async execute(client, message, args) {
      const channel = Helpers.resolveChannel(message.guild, args[0]);
      if (!channel) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike invitesetup #channel`')], allowedMentions: { repliedUser: false } });
      client.db.set(`invitelog_channel_${message.guild.id}`, channel.id);
      client.db.set(`invite_tracking_${message.guild.id}`, true);

      // Cache current invites
      try {
        const invites = await message.guild.invites.fetch();
        const stored = {};
        for (const [code, invite] of invites) {
          stored[code] = { uses: invite.uses, inviter: invite.inviter?.id };
        }
        client.db.set(`invites_${message.guild.id}`, stored);
      } catch {}

      return message.reply({ embeds: [Embeds.success('Invite Tracking Enabled', `Logs will be sent to ${channel}.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'inviterewards',
    description: 'Setup invite rewards',
    category: 'invite',
    permission: 'admin',
    usage: '<add|remove|list> [invites] [@role]',
    async execute(client, message, args) {
      const action = args[0]?.toLowerCase();
      const rewards = client.db.get(`invite_rewards_${message.guild.id}`) || {};

      if (action === 'add') {
        const count = parseInt(args[1]);
        const role = Helpers.resolveRole(message.guild, args[2]);
        if (!count || !role) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike inviterewards add <count> @role`')], allowedMentions: { repliedUser: false } });
        rewards[count] = role.id;
        client.db.set(`invite_rewards_${message.guild.id}`, rewards);
        return message.reply({ embeds: [Embeds.success('Reward Added', `At ${count} invites, members will get ${role}.`)], allowedMentions: { repliedUser: false } });
      }
      if (action === 'remove') {
        const count = parseInt(args[1]);
        if (!count) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike inviterewards remove <count>`')], allowedMentions: { repliedUser: false } });
        delete rewards[count];
        client.db.set(`invite_rewards_${message.guild.id}`, rewards);
        return message.reply({ embeds: [Embeds.success('Removed', `Reward at ${count} invites removed.`)], allowedMentions: { repliedUser: false } });
      }
      if (action === 'list') {
        const list = Object.entries(rewards).map(([count, roleId]) => `**${count} invites** → <@&${roleId}>`).join('\n');
        return message.reply({ embeds: [Embeds.info('Invite Rewards', list || 'No rewards set')], allowedMentions: { repliedUser: false } });
      }
      return message.reply({ embeds: [Embeds.error('Usage', '`@Zike inviterewards <add|remove|list>`')], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'invitereset',
    description: 'Reset a user\'s invite count',
    category: 'invite',
    permission: 'admin',
    usage: '@user',
    async execute(client, message, args) {
      const target = await Helpers.resolveMember(message.guild, args[0]);
      if (!target) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike invitereset @user`')], allowedMentions: { repliedUser: false } });
      client.db.delete(`invites_count_${message.guild.id}_${target.id}`);
      client.db.delete(`invites_total_${message.guild.id}_${target.id}`);
      return message.reply({ embeds: [Embeds.success('Reset', `Invite count reset for ${target.user.tag}.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'inviteremove',
    description: 'Remove invites from a user',
    category: 'invite',
    permission: 'admin',
    usage: '@user <count>',
    async execute(client, message, args) {
      const target = await Helpers.resolveMember(message.guild, args[0]);
      const count = parseInt(args[1]);
      if (!target || !count) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike inviteremove @user <count>`')], allowedMentions: { repliedUser: false } });
      const current = client.db.get(`invites_count_${message.guild.id}_${target.id}`) || 0;
      client.db.set(`invites_count_${message.guild.id}_${target.id}`, Math.max(0, current - count));
      return message.reply({ embeds: [Embeds.success('Removed', `Removed ${count} invites from ${target.user.tag}.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'inviteadd',
    description: 'Add invites to a user',
    category: 'invite',
    permission: 'admin',
    usage: '@user <count>',
    async execute(client, message, args) {
      const target = await Helpers.resolveMember(message.guild, args[0]);
      const count = parseInt(args[1]);
      if (!target || !count) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike inviteadd @user <count>`')], allowedMentions: { repliedUser: false } });
      const current = client.db.get(`invites_count_${message.guild.id}_${target.id}`) || 0;
      client.db.set(`invites_count_${message.guild.id}_${target.id}`, current + count);
      return message.reply({ embeds: [Embeds.success('Added', `Added ${count} invites to ${target.user.tag}.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'invitedby',
    description: 'View who invited a user',
    category: 'invite',
    permission: 'everyone',
    usage: '@user',
    async execute(client, message, args) {
      const target = await Helpers.resolveMember(message.guild, args[0]) || message.member;
      const data = client.db.get(`invited_by_${message.guild.id}_${target.id}`);
      if (!data) return message.reply({ embeds: [Embeds.info('Not Found', `We don't have invite data for ${target.user.tag}.`)], allowedMentions: { repliedUser: false } });
      const embed = Embeds.info('Invited By', `${target.user.tag} was invited by:`)
        .addFields(
          { name: 'Inviter', value: `<@${data.inviterId}>`, inline: true },
          { name: 'Invite Code', value: `\`${data.code}\``, inline: true },
          { name: 'When', value: Helpers.discordTimestamp(data.timestamp), inline: true },
        );
      return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'fakeinvites',
    description: 'View users with most fake invites (left members)',
    category: 'invite',
    permission: 'staff',
    async execute(client, message) {
      const keys = client.db.keys(`invites_total_${message.guild.id}_*`);
      const data = keys.map(k => {
        const userId = k.replace(`invites_total_${message.guild.id}_`, '');
        const total = client.db.get(k) || 0;
        const real = client.db.get(`invites_count_${message.guild.id}_${userId}`) || 0;
        return { userId, fake: total - real, total, real };
      }).filter(d => d.fake > 0).sort((a, b) => b.fake - a.fake).slice(0, 10);

      if (data.length === 0) return message.reply({ embeds: [Embeds.info('No Fake Invites', 'No fake invites detected.')], allowedMentions: { repliedUser: false } });

      const list = data.map((d, i) => `**${i + 1}.** <@${d.userId}> — ${d.fake} fake (of ${d.total} total)`).join('\n');
      return message.reply({ embeds: [Embeds.warning('Fake Invites', 'Users with most fake invites:').addFields({ name: '\u200B', value: list })], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'inviteinfo',
    description: 'View info about a specific invite code',
    category: 'invite',
    permission: 'staff',
    usage: '<code>',
    async execute(client, message, args) {
      const code = args[0];
      if (!code) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike inviteinfo <code>`')], allowedMentions: { repliedUser: false } });
      try {
        const invite = await client.fetchInvite(code).catch(() => null);
        if (!invite) return message.reply({ embeds: [Embeds.error('Not Found', 'Invalid invite code.')], allowedMentions: { repliedUser: false } });
        const embed = Embeds.info('Invite Info', `Info for invite \`${code}\``)
          .addFields(
            { name: 'Server', value: invite.guild?.name || 'Unknown', inline: true },
            { name: 'Channel', value: invite.channel?.name || 'Unknown', inline: true },
            { name: 'Inviter', value: invite.inviter?.tag || 'Unknown', inline: true },
            { name: 'Uses', value: `${invite.uses || 0}/${invite.maxUses || '∞'}`, inline: true },
            { name: 'Expires', value: invite.maxAge ? Helpers.formatDuration(invite.maxAge * 1000) : 'Never', inline: true },
            { name: 'Temporary', value: invite.temporary ? 'Yes' : 'No', inline: true },
          );
        return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
      } catch (e) {
        return message.reply({ embeds: [Embeds.error('Error', e.message)], allowedMentions: { repliedUser: false } });
      }
    },
  },
  {
    name: 'invitestats',
    description: 'View overall invite statistics',
    category: 'invite',
    permission: 'staff',
    async execute(client, message) {
      const keys = client.db.keys(`invites_count_${message.guild.id}_*`);
      let totalReal = 0, totalAll = 0, topInviter = null, topCount = 0;
      for (const k of keys) {
        const count = client.db.get(k) || 0;
        totalReal += count;
        if (count > topCount) {
          topCount = count;
          topInviter = k.replace(`invites_count_${message.guild.id}_`, '');
        }
      }
      const totalKeys = client.db.keys(`invites_total_${message.guild.id}_*`);
      for (const k of totalKeys) totalAll += (client.db.get(k) || 0);

      const embed = Embeds.info('Invite Statistics', `Stats for ${message.guild.name}`)
        .addFields(
          { name: 'Total Real Invites', value: totalReal.toString(), inline: true },
          { name: 'Total All Invites', value: totalAll.toString(), inline: true },
          { name: 'Fake Invites', value: (totalAll - totalReal).toString(), inline: true },
          { name: 'Top Inviter', value: topInviter ? `<@${topInviter}>` : 'None', inline: true },
          { name: 'Top Count', value: topCount.toString(), inline: true },
          { name: 'Active Inviters', value: keys.length.toString(), inline: true },
        );
      return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'createinvite',
    description: 'Create a permanent server invite',
    category: 'invite',
    permission: 'moderator',
    usage: '[#channel]',
    async execute(client, message, args) {
      const channel = Helpers.resolveChannel(message.guild, args[0]) || message.channel;
      const invite = await channel.createInvite({ maxAge: 0, maxUses: 0, unique: true });
      return message.reply({ embeds: [Embeds.success('Invite Created', `Permanent invite: https://discord.gg/${invite.code}`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'invitepurge',
    description: 'Delete all invites from a user',
    category: 'invite',
    permission: 'admin',
    usage: '@user',
    async execute(client, message, args) {
      const target = await Helpers.resolveMember(message.guild, args[0]);
      if (!target) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike invitepurge @user`')], allowedMentions: { repliedUser: false } });
      try {
        const invites = await message.guild.invites.fetch();
        let count = 0;
        for (const [, invite] of invites) {
          if (invite.inviter?.id === target.id) {
            await invite.delete();
            count++;
          }
        }
        return message.reply({ embeds: [Embeds.warning('Purged', `Deleted ${count} invites from ${target.user.tag}.`)], allowedMentions: { repliedUser: false } });
      } catch (e) {
        return message.reply({ embeds: [Embeds.error('Error', e.message)], allowedMentions: { repliedUser: false } });
      }
    },
  },
];

module.exports = inviteCommands;
