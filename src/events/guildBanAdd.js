const Embeds = require('../utils/Embeds');
const Helpers = require('../utils/Helpers');

// Anti-nuke handler for guild ban add
module.exports = {
  name: 'guildBanAdd',
  async execute(client, ban) {
    const guild = ban.guild;

    // ============================================
    // Anti-Nuke: Check if ban was unauthorized
    // ============================================
    const antinukeEnabled = client.db.get(`antinuke_enabled_${guild.id}`);
    if (antinukeEnabled) {
      try {
        // Get audit log
        const auditLogs = await guild.fetchAuditLogs({ type: 22, limit: 1 }); // MEMBER_BAN_ADD
        const entry = auditLogs.entries.first();
        if (!entry) return;

        const executor = entry.executor;
        // Skip if executor is bot or owner
        if (executor.id === client.user.id || executor.id === client.config.owner.id) return;

        // Check if executor is whitelisted
        const whitelist = client.db.get(`antinuke_whitelist_${guild.id}`) || [];
        if (whitelist.includes(executor.id)) return;

        // Check staff permission
        const executorMember = await guild.members.fetch(executor.id).catch(() => null);
        if (executorMember && client.permissions.isStaff(executorMember)) return;

        // Unauthorized ban!
        const limit = client.db.get(`antinuke_ban_limit_${guild.id}`) || 3;
        const window = client.db.get(`antinuke_window_${guild.id}`) || 60000; // 1 min

        const actionKey = `antinuke_actions_${guild.id}_${executor.id}`;
        const actions = client.db.get(actionKey, []);
        const now = Date.now();
        const recent = actions.filter(t => now - t < window);
        recent.push(now);
        client.db.set(actionKey, recent);

        if (recent.length > limit) {
          // Take action: ban the executor
          try {
            await guild.members.ban(executor.id, { reason: 'Anti-Nuke: Unauthorized mass banning' });
          } catch {}

          // Log it
          const logChannel = client.db.get(`antinuke_log_channel_${guild.id}`);
          if (logChannel) {
            const ch = guild.channels.cache.get(logChannel);
            if (ch) {
              ch.send({
                embeds: [Embeds.error(
                  '🚨 ANTI-NUKE TRIGGERED',
                  `Mass ban detected! Action taken against ${executor.tag}.`
                ).addFields(
                  { name: 'Executor', value: `${executor.tag} (${executor.id})`, inline: true },
                  { name: 'Action', value: 'Banned', inline: true },
                  { name: 'Bans in window', value: `${recent.length}`, inline: true },
                )],
              }).catch(() => {});
            }
          }

          // Unban the victim
          try {
            await guild.members.unban(ban.user.id, 'Anti-Nuke: Reversing unauthorized ban');
          } catch {}
        } else {
          // Just log the warning
          const logChannel = client.db.get(`antinuke_log_channel_${guild.id}`);
          if (logChannel) {
            const ch = guild.channels.cache.get(logChannel);
            if (ch) {
              ch.send({
                embeds: [Embeds.warning(
                  'Anti-Nuke Warning',
                  `${executor.tag} banned ${ban.user.tag} (${recent.length}/${limit} in window)`
                )],
              }).catch(() => {});
            }
          }
        }
      } catch (e) {
        console.error('Anti-nuke ban error:', e.message);
      }
    }

    // Log the ban
    const logChannelId = client.db.get(`modlog_channel_${guild.id}`);
    if (logChannelId) {
      const ch = guild.channels.cache.get(logChannelId);
      if (ch) {
        ch.send({
          embeds: [Embeds.error(
            'Member Banned',
            `${ban.user.tag} was banned from the server.`
          ).addFields(
            { name: 'User', value: `${ban.user.tag} (${ban.user.id})`, inline: true },
            { name: 'Reason', value: ban.reason || 'No reason provided', inline: false },
          ).setThumbnail(ban.user.displayAvatarURL({ size: 256, extension: 'png' }))],
        }).catch(() => {});
      }
    }
  },
};
