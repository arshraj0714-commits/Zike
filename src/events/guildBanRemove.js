const Embeds = require('../utils/Embeds');

module.exports = {
  name: 'guildBanRemove',
  async execute(client, ban) {
    const guild = ban.guild;

    const logChannelId = client.db.get(`modlog_channel_${guild.id}`);
    if (logChannelId) {
      const ch = guild.channels.cache.get(logChannelId);
      if (ch) {
        ch.send({
          embeds: [Embeds.success(
            'Member Unbanned',
            `${ban.user.tag} was unbanned from the server.`
          ).addFields(
            { name: 'User', value: `${ban.user.tag} (${ban.user.id})`, inline: true },
          ).setThumbnail(ban.user.displayAvatarURL({ size: 256, extension: 'png' }))],
        }).catch(() => {});
      }
    }
  },
};
