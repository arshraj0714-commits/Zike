const Embeds = require('../utils/Embeds');
const Helpers = require('../utils/Helpers');

module.exports = {
  name: 'roleCreate',
  async execute(client, role) {
    const guild = role.guild;

    // Anti-nuke check
    const antinukeEnabled = client.db.get(`antinuke_enabled_${guild.id}`);
    if (antinukeEnabled) {
      try {
        const auditLogs = await guild.fetchAuditLogs({ type: 30, limit: 1 }); // ROLE_CREATE
        const entry = auditLogs.entries.first();
        if (!entry || Date.now() - entry.createdTimestamp > 5000) return;

        const executor = entry.executor;
        if (executor.id === client.user.id || executor.id === client.config.owner.id) return;

        const whitelist = client.db.get(`antinuke_whitelist_${guild.id}`) || [];
        if (whitelist.includes(executor.id)) return;

        const executorMember = await guild.members.fetch(executor.id).catch(() => null);
        if (executorMember && client.permissions.isStaff(executorMember)) return;

        const limit = client.db.get(`antinuke_role_limit_${guild.id}`) || 5;
        const window = client.db.get(`antinuke_window_${guild.id}`) || 60000;

        const actionKey = `antinuke_role_actions_${guild.id}_${executor.id}`;
        const actions = client.db.get(actionKey, []);
        const now = Date.now();
        const recent = actions.filter(t => now - t < window);
        recent.push(now);
        client.db.set(actionKey, recent);

        if (recent.length > limit) {
          try {
            await role.delete('Anti-Nuke: Unauthorized role creation');
            await guild.members.ban(executor.id, { reason: 'Anti-Nuke: Mass role creation' });
          } catch {}

          const logChannel = client.db.get(`antinuke_log_channel_${guild.id}`);
          if (logChannel) {
            const ch = guild.channels.cache.get(logChannel);
            if (ch) {
              ch.send({
                embeds: [Embeds.error(
                  '🚨 ANTI-NUKE TRIGGERED',
                  `Mass role creation detected! ${executor.tag} has been banned.`
                )],
              }).catch(() => {});
            }
          }
        }
      } catch (e) {
        console.error('Anti-nuke role create error:', e.message);
      }
    }

    // Log role create
    const logChannelId = client.db.get(`serverlog_channel_${guild.id}`);
    if (logChannelId) {
      const ch = guild.channels.cache.get(logChannelId);
      if (ch) {
        ch.send({
          embeds: [Embeds.info(
            'Role Created',
            `New role created: ${role.name}`
          ).addFields(
            { name: 'Role', value: `${role.name} (${role.id})`, inline: true },
            { name: 'Color', value: role.hexColor, inline: true },
            { name: 'Position', value: role.position.toString(), inline: true },
          )],
        }).catch(() => {});
      }
    }
  },
};
