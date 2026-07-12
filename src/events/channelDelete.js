const Embeds = require('../utils/Embeds');
const Helpers = require('../utils/Helpers');

module.exports = {
  name: 'channelDelete',
  async execute(client, channel) {
    const guild = channel.guild;
    if (!guild) return;

    // Anti-nuke check
    const antinukeEnabled = client.db.get(`antinuke_enabled_${guild.id}`);
    if (antinukeEnabled) {
      try {
        const auditLogs = await guild.fetchAuditLogs({ type: 12, limit: 1 }); // CHANNEL_DELETE
        const entry = auditLogs.entries.first();
        if (!entry || Date.now() - entry.createdTimestamp > 5000) return;

        const executor = entry.executor;
        if (executor.id === client.user.id || executor.id === client.config.owner.id) return;

        const whitelist = client.db.get(`antinuke_whitelist_${guild.id}`) || [];
        if (whitelist.includes(executor.id)) return;

        const executorMember = await guild.members.fetch(executor.id).catch(() => null);
        if (executorMember && client.permissions.isStaff(executorMember)) return;

        const limit = client.db.get(`antinuke_channel_delete_limit_${guild.id}`) || 3;
        const window = client.db.get(`antinuke_window_${guild.id}`) || 60000;

        const actionKey = `antinuke_channel_delete_actions_${guild.id}_${executor.id}`;
        const actions = client.db.get(actionKey, []);
        const now = Date.now();
        const recent = actions.filter(t => now - t < window);
        recent.push(now);
        client.db.set(actionKey, recent);

        if (recent.length > limit) {
          try {
            await guild.members.ban(executor.id, { reason: 'Anti-Nuke: Mass channel deletion' });
          } catch {}

          const logChannel = client.db.get(`antinuke_log_channel_${guild.id}`);
          if (logChannel) {
            const ch = guild.channels.cache.get(logChannel);
            if (ch) {
              ch.send({
                embeds: [Embeds.error(
                  '🚨 ANTI-NUKE TRIGGERED',
                  `Mass channel deletion detected! ${executor.tag} has been banned.`
                ).addFields(
                  { name: 'Deleted Channel', value: channel.name, inline: true },
                  { name: 'Channels in window', value: `${recent.length}`, inline: true },
                )],
              }).catch(() => {});
            }
          }
        }
      } catch (e) {
        console.error('Anti-nuke channel delete error:', e.message);
      }
    }

    // Log channel delete
    const logChannelId = client.db.get(`serverlog_channel_${guild.id}`);
    if (logChannelId) {
      const ch = guild.channels.cache.get(logChannelId);
      if (ch) {
        ch.send({
          embeds: [Embeds.warning(
            'Channel Deleted',
            `Channel \`${channel.name}\` was deleted.`
          ).addFields(
            { name: 'Channel', value: `${channel.name} (${channel.id})`, inline: true },
            { name: 'Type', value: channel.type.toString(), inline: true },
          )],
        }).catch(() => {});
      }
    }
  },
};
