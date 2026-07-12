const Embeds = require('../utils/Embeds');
const Helpers = require('../utils/Helpers');

// ============================================
// WELCOME / GOODBYE COMMANDS (20+ commands)
// ============================================

const welcomeCommands = [
  {
    name: 'welcome',
    description: 'Setup welcome messages',
    category: 'welcome',
    permission: 'admin',
    usage: '<on|off> [#channel]',
    async execute(client, message, args) {
      const action = args[0]?.toLowerCase();
      if (action === 'on') {
        const channel = Helpers.resolveChannel(message.guild, args[1]) || message.channel;
        client.db.set(`welcome_enabled_${message.guild.id}`, true);
        client.db.set(`welcome_channel_${message.guild.id}`, channel.id);
        return message.reply({ embeds: [Embeds.success('Welcome On', `Welcome messages enabled in ${channel}.`)], allowedMentions: { repliedUser: false } });
      }
      if (action === 'off') {
        client.db.set(`welcome_enabled_${message.guild.id}`, false);
        return message.reply({ embeds: [Embeds.warning('Welcome Off', 'Welcome messages disabled.')], allowedMentions: { repliedUser: false } });
      }
      return message.reply({ embeds: [Embeds.error('Usage', '`@Zike welcome <on|off> [#channel]`')], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'welcomemessage',
    description: 'Set custom welcome message',
    category: 'welcome',
    permission: 'admin',
    usage: '<message> (use {user}, {server}, {count})',
    async execute(client, message, args) {
      const text = args.join(' ');
      if (!text) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike welcomemessage <text>`\nVariables: {user}, {username}, {server}, {count}')], allowedMentions: { repliedUser: false } });
      client.db.set(`welcome_message_${message.guild.id}`, text);
      return message.reply({ embeds: [Embeds.success('Set', 'Welcome message updated. Use `@Zike welcometest` to preview.')], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'welcomechannel',
    description: 'Set welcome channel',
    category: 'welcome',
    permission: 'admin',
    usage: '#channel',
    async execute(client, message, args) {
      const channel = Helpers.resolveChannel(message.guild, args[0]);
      if (!channel) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike welcomechannel #channel`')], allowedMentions: { repliedUser: false } });
      client.db.set(`welcome_channel_${message.guild.id}`, channel.id);
      return message.reply({ embeds: [Embeds.success('Set', `Welcome channel: ${channel}`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'welcometest',
    description: 'Test welcome message',
    category: 'welcome',
    permission: 'admin',
    async execute(client, message) {
      const welcomeMessage = client.db.get(`welcome_message_${message.guild.id}`) || 'Welcome {user} to {server}!';
      const msg = welcomeMessage
        .replace(/{user}/g, `<@${message.author.id}>`)
        .replace(/{username}/g, message.author.username)
        .replace(/{server}/g, message.guild.name)
        .replace(/{count}/g, message.guild.memberCount);
      const embed = Embeds.primary(`Welcome to ${message.guild.name}!`, msg)
        .setThumbnail(message.author.displayAvatarURL({ size: 256, extension: 'png' }))
        .addFields(
          { name: '👤 Member', value: message.author.tag, inline: true },
          { name: '📅 Joined', value: Helpers.discordTimestamp(new Date()), inline: true },
          { name: '📊 Member #', value: message.guild.memberCount.toString(), inline: true }
        );
      return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'goodbye',
    description: 'Setup goodbye messages',
    category: 'welcome',
    permission: 'admin',
    usage: '<on|off> [#channel]',
    async execute(client, message, args) {
      const action = args[0]?.toLowerCase();
      if (action === 'on') {
        const channel = Helpers.resolveChannel(message.guild, args[1]) || message.channel;
        client.db.set(`goodbye_enabled_${message.guild.id}`, true);
        client.db.set(`goodbye_channel_${message.guild.id}`, channel.id);
        return message.reply({ embeds: [Embeds.success('Goodbye On', `Goodbye messages enabled in ${channel}.`)], allowedMentions: { repliedUser: false } });
      }
      if (action === 'off') {
        client.db.set(`goodbye_enabled_${message.guild.id}`, false);
        return message.reply({ embeds: [Embeds.warning('Goodbye Off', 'Goodbye messages disabled.')], allowedMentions: { repliedUser: false } });
      }
      return message.reply({ embeds: [Embeds.error('Usage', '`@Zike goodbye <on|off> [#channel]`')], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'goodbyemessage',
    description: 'Set custom goodbye message',
    category: 'welcome',
    permission: 'admin',
    usage: '<message>',
    async execute(client, message, args) {
      const text = args.join(' ');
      if (!text) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike goodbyemessage <text>`')], allowedMentions: { repliedUser: false } });
      client.db.set(`goodbye_message_${message.guild.id}`, text);
      return message.reply({ embeds: [Embeds.success('Set', 'Goodbye message updated.')], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'goodbyechannel',
    description: 'Set goodbye channel',
    category: 'welcome',
    permission: 'admin',
    usage: '#channel',
    async execute(client, message, args) {
      const channel = Helpers.resolveChannel(message.guild, args[0]);
      if (!channel) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike goodbyechannel #channel`')], allowedMentions: { repliedUser: false } });
      client.db.set(`goodbye_channel_${message.guild.id}`, channel.id);
      return message.reply({ embeds: [Embeds.success('Set', `Goodbye channel: ${channel}`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'goodbyetest',
    description: 'Test goodbye message',
    category: 'welcome',
    permission: 'admin',
    async execute(client, message) {
      const goodbyeMessage = client.db.get(`goodbye_message_${message.guild.id}`) || 'Goodbye {username}!';
      const msg = goodbyeMessage
        .replace(/{user}/g, `<@${message.author.id}>`)
        .replace(/{username}/g, message.author.username)
        .replace(/{server}/g, message.guild.name)
        .replace(/{count}/g, message.guild.memberCount - 1);
      const embed = Embeds.base({ color: 0x6B7280 })
        .setTitle(`Goodbye ${message.author.username}!`)
        .setDescription(msg)
        .setThumbnail(message.author.displayAvatarURL({ size: 256, extension: 'png' }));
      return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    },
  },
];

module.exports = welcomeCommands;
