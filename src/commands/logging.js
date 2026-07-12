const Embeds = require('../utils/Embeds');
const Helpers = require('../utils/Helpers');

// ============================================
// LOGGING COMMANDS (20+ commands)
// ============================================

const loggingCommands = [
  {
    name: 'modlog',
    description: 'Set moderation log channel',
    category: 'logging',
    permission: 'admin',
    usage: '#channel',
    async execute(client, message, args) {
      const channel = Helpers.resolveChannel(message.guild, args[0]);
      if (!channel) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike modlog #channel`')], allowedMentions: { repliedUser: false } });
      client.db.set(`modlog_channel_${message.guild.id}`, channel.id);
      return message.reply({ embeds: [Embeds.success('Set', `Moderation logs → ${channel}`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'serverlog',
    description: 'Set server log channel',
    category: 'logging',
    permission: 'admin',
    usage: '#channel',
    async execute(client, message, args) {
      const channel = Helpers.resolveChannel(message.guild, args[0]);
      if (!channel) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike serverlog #channel`')], allowedMentions: { repliedUser: false } });
      client.db.set(`serverlog_channel_${message.guild.id}`, channel.id);
      return message.reply({ embeds: [Embeds.success('Set', `Server logs → ${channel}`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'memberlog',
    description: 'Set member log channel',
    category: 'logging',
    permission: 'admin',
    usage: '#channel',
    async execute(client, message, args) {
      const channel = Helpers.resolveChannel(message.guild, args[0]);
      if (!channel) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike memberlog #channel`')], allowedMentions: { repliedUser: false } });
      client.db.set(`memberlog_channel_${message.guild.id}`, channel.id);
      return message.reply({ embeds: [Embeds.success('Set', `Member logs → ${channel}`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'messagelog',
    description: 'Set message log channel',
    category: 'logging',
    permission: 'admin',
    usage: '#channel',
    async execute(client, message, args) {
      const channel = Helpers.resolveChannel(message.guild, args[0]);
      if (!channel) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike messagelog #channel`')], allowedMentions: { repliedUser: false } });
      client.db.set(`messagelog_channel_${message.guild.id}`, channel.id);
      return message.reply({ embeds: [Embeds.success('Set', `Message logs → ${channel}`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'voicelog',
    description: 'Set voice log channel',
    category: 'logging',
    permission: 'admin',
    usage: '#channel',
    async execute(client, message, args) {
      const channel = Helpers.resolveChannel(message.guild, args[0]);
      if (!channel) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike voicelog #channel`')], allowedMentions: { repliedUser: false } });
      client.db.set(`voicelog_channel_${message.guild.id}`, channel.id);
      return message.reply({ embeds: [Embeds.success('Set', `Voice logs → ${channel}`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'rolelog',
    description: 'Set role log channel',
    category: 'logging',
    permission: 'admin',
    usage: '#channel',
    async execute(client, message, args) {
      const channel = Helpers.resolveChannel(message.guild, args[0]);
      if (!channel) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike rolelog #channel`')], allowedMentions: { repliedUser: false } });
      client.db.set(`rolelog_channel_${message.guild.id}`, channel.id);
      return message.reply({ embeds: [Embeds.success('Set', `Role logs → ${channel}`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'channellog',
    description: 'Set channel log channel',
    category: 'logging',
    permission: 'admin',
    usage: '#channel',
    async execute(client, message, args) {
      const channel = Helpers.resolveChannel(message.guild, args[0]);
      if (!channel) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike channellog #channel`')], allowedMentions: { repliedUser: false } });
      client.db.set(`channellog_channel_${message.guild.id}`, channel.id);
      return message.reply({ embeds: [Embeds.success('Set', `Channel logs → ${channel}`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'invitelog',
    description: 'Set invite log channel',
    category: 'logging',
    permission: 'admin',
    usage: '#channel',
    async execute(client, message, args) {
      const channel = Helpers.resolveChannel(message.guild, args[0]);
      if (!channel) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike invitelog #channel`')], allowedMentions: { repliedUser: false } });
      client.db.set(`invitelog_channel_${message.guild.id}`, channel.id);
      return message.reply({ embeds: [Embeds.success('Set', `Invite logs → ${channel}`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'boostlog',
    description: 'Set boost log channel',
    category: 'logging',
    permission: 'admin',
    usage: '#channel',
    async execute(client, message, args) {
      const channel = Helpers.resolveChannel(message.guild, args[0]);
      if (!channel) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike boostlog #channel`')], allowedMentions: { repliedUser: false } });
      client.db.set(`boostlog_channel_${message.guild.id}`, channel.id);
      return message.reply({ embeds: [Embeds.success('Set', `Boost logs → ${channel}`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'logstatus',
    description: 'View logging status',
    category: 'logging',
    permission: 'admin',
    async execute(client, message) {
      const logs = {
        'Moderation': client.db.get(`modlog_channel_${message.guild.id}`),
        'Server': client.db.get(`serverlog_channel_${message.guild.id}`),
        'Member': client.db.get(`memberlog_channel_${message.guild.id}`),
        'Message': client.db.get(`messagelog_channel_${message.guild.id}`),
        'Voice': client.db.get(`voicelog_channel_${message.guild.id}`),
        'Role': client.db.get(`rolelog_channel_${message.guild.id}`),
        'Channel': client.db.get(`channellog_channel_${message.guild.id}`),
        'Invite': client.db.get(`invitelog_channel_${message.guild.id}`),
        'Boost': client.db.get(`boostlog_channel_${message.guild.id}`),
        'Anti-Nuke': client.db.get(`antinuke_log_channel_${message.guild.id}`),
        'Ticket': client.db.get(`ticketlog_channel_${message.guild.id}`),
      };
      const list = Object.entries(logs).map(([name, id]) => `${id ? '✅' : '❌'} **${name}**: ${id ? `<#${id}>` : 'Not set'}`).join('\n');
      return message.reply({ embeds: [Embeds.info('Logging Status', list)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'logsoff',
    description: 'Disable all logging',
    category: 'logging',
    permission: 'admin',
    async execute(client, message) {
      const keys = ['modlog', 'serverlog', 'memberlog', 'messagelog', 'voicelog', 'rolelog', 'channellog', 'invitelog', 'boostlog'];
      for (const k of keys) client.db.delete(`${k}_channel_${message.guild.id}`);
      return message.reply({ embeds: [Embeds.warning('Logs Disabled', 'All logging channels have been cleared.')], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'audit',
    description: 'View audit log',
    category: 'logging',
    permission: 'admin',
    usage: '[limit]',
    async execute(client, message, args) {
      const limit = Math.min(parseInt(args[0]) || 10, 25);
      try {
        const logs = await message.guild.fetchAuditLogs({ limit });
        const list = logs.entries.first(limit).map(e => `**${e.action}** — ${e.executor?.tag || 'Unknown'} — ${Helpers.discordTimestamp(e.createdTimestamp)}`).join('\n');
        return message.reply({ embeds: [Embeds.info('Audit Log', list)], allowedMentions: { repliedUser: false } });
      } catch (e) {
        return message.reply({ embeds: [Embeds.error('Error', e.message)], allowedMentions: { repliedUser: false } });
      }
    },
  },
];

module.exports = loggingCommands;
