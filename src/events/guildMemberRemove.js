const Embeds = require('../utils/Embeds');
const Helpers = require('../utils/Helpers');

module.exports = {
  name: 'guildMemberRemove',
  async execute(client, member) {
    const guild = member.guild;

    // Goodbye message
    const goodbyeEnabled = client.db.get(`goodbye_enabled_${guild.id}`);
    if (goodbyeEnabled) {
      const goodbyeChannelId = client.db.get(`goodbye_channel_${guild.id}`);
      const goodbyeMessage = client.db.get(`goodbye_message_${guild.id}`) ||
        'Goodbye {username}! We will miss you.';
      const channel = goodbyeChannelId ? guild.channels.cache.get(goodbyeChannelId) : guild.systemChannel;

      if (channel) {
        const msg = goodbyeMessage
          .replace(/{user}/g, `<@${member.id}>`)
          .replace(/{username}/g, member.user.username)
          .replace(/{server}/g, guild.name)
          .replace(/{count}/g, guild.memberCount);

        const embed = Embeds.base({ color: 0x6B7280 })
          .setTitle(`Goodbye ${member.user.username}!`)
          .setDescription(msg)
          .setThumbnail(member.user.displayAvatarURL({ size: 256, extension: 'png' }))
          .addFields(
            { name: '👤 Member', value: member.user.tag, inline: true },
            { name: '📊 Members Left', value: `${guild.memberCount}`, inline: true }
          );

        channel.send({ embeds: [embed] }).catch(() => {});
      }
    }

    // Decrement invite count for the inviter (only if it was a real leave)
    const invitedBy = client.db.get(`invited_by_${guild.id}_${member.id}`);
    if (invitedBy) {
      const countKey = `invites_count_${guild.id}_${invitedBy.inviterId}`;
      const current = client.db.get(countKey, 0);
      if (current > 0) {
        client.db.set(countKey, current - 1);
      }
    }

    // Log leave
    const logChannelId = client.db.get(`memberlog_channel_${guild.id}`);
    if (logChannelId) {
      const ch = guild.channels.cache.get(logChannelId);
      if (ch) {
        const roles = member.roles.cache
          .filter(r => r.id !== guild.id)
          .map(r => r.name)
          .join(', ') || 'None';

        ch.send({
          embeds: [Embeds.base({ color: 0xF59E0B })
            .setTitle('Member Left')
            .setThumbnail(member.user.displayAvatarURL({ size: 256, extension: 'png' }))
            .addFields(
              { name: 'Member', value: `${member.user.tag} (${member.id})`, inline: true },
              { name: 'Joined', value: member.joinedAt ? Helpers.discordTimestamp(member.joinedAt) : 'Unknown', inline: true },
              { name: 'Roles', value: Helpers.truncate(roles, 1024) || 'None', inline: false }
            )],
        }).catch(() => {});
      }
    }
  },
};
