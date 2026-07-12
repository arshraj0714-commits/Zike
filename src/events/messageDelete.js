// Snipe deleted messages
module.exports = {
  name: 'messageDelete',
  async execute(client, message) {
    if (!message.guild || message.author?.bot) return;
    if (!message.content && message.attachments.size === 0) return;

    client.db.set(`snipe_${message.channel.id}`, {
      content: message.content,
      author: message.author.tag,
      authorId: message.author.id,
      authorAvatar: message.author.displayAvatarURL({ size: 256, extension: 'png' }),
      timestamp: Date.now(),
      attachments: message.attachments.map(a => a.url),
    });

    // Also log to message log channel
    const logChannelId = client.db.get(`messagelog_channel_${message.guild.id}`);
    if (logChannelId) {
      const ch = message.guild.channels.cache.get(logChannelId);
      if (ch) {
        const Helpers = require('../utils/Helpers');
        const Embeds = require('../utils/Embeds');
        ch.send({
          embeds: [Embeds.warning('Message Deleted', `Message by ${message.author} was deleted in ${message.channel}`)
            .addFields(
              { name: 'Content', value: Helpers.truncate(message.content || '[No content]', 1024) || '[No content]' },
              { name: 'Channel', value: message.channel.toString(), inline: true },
              { name: 'Author', value: message.author.tag, inline: true },
            )],
        }).catch(() => {});
      }
    }
  },
};
