const Embeds = require('../utils/Embeds');
const Helpers = require('../utils/Helpers');

// ============================================
// LEVELING COMMANDS (20+ commands)
// ============================================

function getLevel(xp) {
  return Math.floor(Math.sqrt(xp / 100));
}

function getXpForLevel(level) {
  return Math.pow(level, 2) * 100;
}

function getProgress(xp) {
  const level = getLevel(xp);
  const currentLevelXp = getXpForLevel(level);
  const nextLevelXp = getXpForLevel(level + 1);
  const progress = xp - currentLevelXp;
  const total = nextLevelXp - currentLevelXp;
  return { level, progress, total, percent: Math.floor((progress / total) * 100) };
}

const levelingCommands = [
  {
    name: 'rank',
    description: 'View your rank card',
    category: 'leveling',
    permission: 'everyone',
    usage: '[@user]',
    aliases: ['level', 'xp', 'lvl'],
    async execute(client, message, args) {
      const target = message.mentions.users.first() || message.author;
      const xp = client.db.get(`xp_${message.guild.id}_${target.id}`) || 0;
      const { level, progress, total, percent } = getProgress(xp);

      const progressBar = '█'.repeat(Math.floor(percent / 5)) + '░'.repeat(20 - Math.floor(percent / 5));

      // Get rank position
      const keys = client.db.keys(`xp_${message.guild.id}_*`);
      const sorted = keys.map(k => ({ userId: k.replace(`xp_${message.guild.id}_`, ''), xp: client.db.get(k) || 0 }))
        .sort((a, b) => b.xp - a.xp);
      const rank = sorted.findIndex(d => d.userId === target.id) + 1;

      const embed = Embeds.primary(`Rank Card — ${target.username}`, '')
        .setThumbnail(target.displayAvatarURL({ size: 256, extension: 'png' }))
        .addFields(
          { name: '🏆 Rank', value: `#${rank || '?'}`, inline: true },
          { name: '⭐ Level', value: level.toString(), inline: true },
          { name: '✨ XP', value: `${xp} total`, inline: true },
          { name: '📊 Progress', value: `${progress}/${total} XP (${percent}%)`, inline: false },
          { name: 'Progress Bar', value: `\`${progressBar}\``, inline: false },
        );
      return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'xpleaderboard',
    description: 'View top users by XP',
    category: 'leveling',
    permission: 'everyone',
    aliases: ['xplb', 'toplevels', 'topxp'],
    async execute(client, message) {
      const keys = client.db.keys(`xp_${message.guild.id}_*`);
      const data = keys.map(k => {
        const userId = k.replace(`xp_${message.guild.id}_`, '');
        return { userId, xp: client.db.get(k) || 0 };
      }).sort((a, b) => b.xp - a.xp).slice(0, 10);
      if (data.length === 0) return message.reply({ embeds: [Embeds.info('No Data', 'No XP data yet.')], allowedMentions: { repliedUser: false } });
      const medals = ['🥇', '🥈', '🥉'];
      const list = data.map((d, i) => `${medals[i] || `**${i + 1}.**`} <@${d.userId}> — Level ${getLevel(d.xp)} (${d.xp} XP)`).join('\n');
      return message.reply({ embeds: [Embeds.primary('🏆 XP Leaderboard', list)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'levelingon',
    description: 'Enable leveling system',
    category: 'leveling',
    permission: 'admin',
    async execute(client, message) {
      client.db.set(`leveling_enabled_${message.guild.id}`, true);
      return message.reply({ embeds: [Embeds.success('Enabled', 'Leveling system is now active.')], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'levelingoff',
    description: 'Disable leveling system',
    category: 'leveling',
    permission: 'admin',
    async execute(client, message) {
      client.db.set(`leveling_enabled_${message.guild.id}`, false);
      return message.reply({ embeds: [Embeds.warning('Disabled', 'Leveling system is now disabled.')], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'levelchannel',
    description: 'Set the level-up announcement channel',
    category: 'leveling',
    permission: 'admin',
    usage: '#channel',
    async execute(client, message, args) {
      const channel = Helpers.resolveChannel(message.guild, args[0]);
      if (!channel) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike levelchannel #channel`')], allowedMentions: { repliedUser: false } });
      client.db.set(`level_channel_${message.guild.id}`, channel.id);
      return message.reply({ embeds: [Embeds.success('Set', `Level-up messages will go to ${channel}.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'levelrewards',
    description: 'Setup level rewards',
    category: 'leveling',
    permission: 'admin',
    usage: '<add|remove|list> [level] [@role]',
    async execute(client, message, args) {
      const action = args[0]?.toLowerCase();
      const rewards = client.db.get(`level_rewards_${message.guild.id}`) || {};
      if (action === 'add') {
        const level = parseInt(args[1]);
        const role = Helpers.resolveRole(message.guild, args[2]);
        if (!level || !role) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike levelrewards add <level> @role`')], allowedMentions: { repliedUser: false } });
        rewards[level] = role.id;
        client.db.set(`level_rewards_${message.guild.id}`, rewards);
        return message.reply({ embeds: [Embeds.success('Added', `At level ${level}, members get ${role}.`)], allowedMentions: { repliedUser: false } });
      }
      if (action === 'remove') {
        const level = parseInt(args[1]);
        delete rewards[level];
        client.db.set(`level_rewards_${message.guild.id}`, rewards);
        return message.reply({ embeds: [Embeds.success('Removed', `Reward at level ${level} removed.`)], allowedMentions: { repliedUser: false } });
      }
      if (action === 'list') {
        const list = Object.entries(rewards).map(([l, r]) => `Level ${l} → <@&${r}>`).join('\n');
        return message.reply({ embeds: [Embeds.info('Level Rewards', list || 'None')], allowedMentions: { repliedUser: false } });
      }
      return message.reply({ embeds: [Embeds.error('Usage', '`@Zike levelrewards <add|remove|list>`')], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'addxp',
    description: 'Add XP to a user',
    category: 'leveling',
    permission: 'admin',
    usage: '@user <amount>',
    async execute(client, message, args) {
      const target = message.mentions.users.first();
      const amount = parseInt(args[1]);
      if (!target || !amount) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike addxp @user <amount>`')], allowedMentions: { repliedUser: false } });
      const current = client.db.get(`xp_${message.guild.id}_${target.id}`) || 0;
      client.db.set(`xp_${message.guild.id}_${target.id}`, current + amount);
      return message.reply({ embeds: [Embeds.success('Added', `Added ${amount} XP to ${target.username}.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'removexp',
    description: 'Remove XP from a user',
    category: 'leveling',
    permission: 'admin',
    usage: '@user <amount>',
    async execute(client, message, args) {
      const target = message.mentions.users.first();
      const amount = parseInt(args[1]);
      if (!target || !amount) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike removexp @user <amount>`')], allowedMentions: { repliedUser: false } });
      const current = client.db.get(`xp_${message.guild.id}_${target.id}`) || 0;
      client.db.set(`xp_${message.guild.id}_${target.id}`, Math.max(0, current - amount));
      return message.reply({ embeds: [Embeds.success('Removed', `Removed ${amount} XP from ${target.username}.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'resetxp',
    description: 'Reset a user\'s XP',
    category: 'leveling',
    permission: 'admin',
    usage: '@user',
    async execute(client, message, args) {
      const target = message.mentions.users.first();
      if (!target) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike resetxp @user`')], allowedMentions: { repliedUser: false } });
      client.db.delete(`xp_${message.guild.id}_${target.id}`);
      return message.reply({ embeds: [Embeds.success('Reset', `XP reset for ${target.username}.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'setlevel',
    description: 'Set a user\'s level',
    category: 'leveling',
    permission: 'admin',
    usage: '@user <level>',
    async execute(client, message, args) {
      const target = message.mentions.users.first();
      const level = parseInt(args[1]);
      if (!target || !level) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike setlevel @user <level>`')], allowedMentions: { repliedUser: false } });
      client.db.set(`xp_${message.guild.id}_${target.id}`, getXpForLevel(level));
      return message.reply({ embeds: [Embeds.success('Set', `${target.username} is now level ${level}.`)], allowedMentions: { repliedUser: false } });
    },
  },
];

module.exports = levelingCommands;
