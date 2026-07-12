const Embeds = require('../utils/Embeds');
const Helpers = require('../utils/Helpers');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// ============================================
// REWARDS / GIVEAWAYS COMMANDS (20+ commands)
// ============================================

const rewardsCommands = [
  {
    name: 'giveaway',
    description: 'Start a giveaway',
    category: 'rewards',
    permission: 'staff',
    usage: '<duration> <winners> <prize>',
    aliases: ['gstart', 'startgiveaway'],
    async execute(client, message, args) {
      const duration = Helpers.parseDuration(args[0]);
      const winners = parseInt(args[1]);
      const prize = args.slice(2).join(' ');
      if (!duration || !winners || !prize) {
        return message.reply({ embeds: [Embeds.error('Usage', '`@Zike giveaway <1h/1d> <winners> <prize>`')], allowedMentions: { repliedUser: false } });
      }

      const giveawayId = Helpers.generateId(8);
      const endTime = Date.now() + duration;

      const embed = Embeds.base({ color: 0xFBBF24 })
        .setTitle('🎉 GIVEAWAY!')
        .setDescription(`**Prize:** ${prize}\n**Winners:** ${winners}\n**Ends:** ${Helpers.discordTimestamp(endTime, 'R')}\n**Hosted by:** ${message.author}`)
        .setFooter({ text: `Giveaway ID: ${giveawayId} • Click to enter!` })
        .setTimestamp(endTime);

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`giveaway_join_${giveawayId}`).setLabel('Join').setStyle(ButtonStyle.Primary).setEmoji('🎉')
      );

      const giveawayMsg = await message.channel.send({ embeds: [embed], components: [row] });
      client.db.set(`giveaway_${message.guild.id}_${giveawayId}`, {
        id: giveawayId,
        messageId: giveawayMsg.id,
        channelId: message.channel.id,
        prize, winners, endTime,
        participants: [],
        ended: false,
        hostId: message.author.id,
      });

      // Schedule end
      setTimeout(async () => {
        const giveaway = client.db.get(`giveaway_${message.guild.id}_${giveawayId}`);
        if (!giveaway || giveaway.ended) return;
        endGiveaway(client, message.guild.id, giveawayId);
      }, duration);

      return message.reply({ embeds: [Embeds.success('Giveaway Started', `Giveaway started! ID: ${giveawayId}`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'gend',
    description: 'End a giveaway early',
    category: 'rewards',
    permission: 'staff',
    usage: '<giveawayId>',
    async execute(client, message, args) {
      const id = args[0];
      const giveaway = client.db.get(`giveaway_${message.guild.id}_${id}`);
      if (!giveaway) return message.reply({ embeds: [Embeds.error('Not Found', 'Giveaway not found.')], allowedMentions: { repliedUser: false } });
      await endGiveaway(client, message.guild.id, id);
      return message.reply({ embeds: [Embeds.success('Ended', 'Giveaway ended.')], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'greroll',
    description: 'Reroll a giveaway winner',
    category: 'rewards',
    permission: 'staff',
    usage: '<giveawayId>',
    async execute(client, message, args) {
      const id = args[0];
      const giveaway = client.db.get(`giveaway_${message.guild.id}_${id}`);
      if (!giveaway || !giveaway.participants?.length) return message.reply({ embeds: [Embeds.error('Error', 'Giveaway not found or no participants.')], allowedMentions: { repliedUser: false } });
      const winner = Helpers.random(giveaway.participants);
      return message.reply({ embeds: [Embeds.success('🎉 New Winner', `New winner: <@${winner}>`)], allowedMentions: { users: [winner] } });
    },
  },
  {
    name: 'glist',
    description: 'List active giveaways',
    category: 'rewards',
    permission: 'staff',
    async execute(client, message) {
      const keys = client.db.keys(`giveaway_${message.guild.id}_*`);
      const active = [];
      for (const k of keys) {
        const g = client.db.get(k);
        if (g && !g.ended) active.push(g);
      }
      if (active.length === 0) return message.reply({ embeds: [Embeds.info('No Giveaways', 'No active giveaways.')], allowedMentions: { repliedUser: false } });
      const list = active.map(g => `**${g.id}** — ${g.prize} — ${g.participants?.length || 0} entries — ends ${Helpers.discordTimestamp(g.endTime, 'R')}`).join('\n');
      return message.reply({ embeds: [Embeds.primary('Active Giveaways', list)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'gdelete',
    description: 'Delete a giveaway',
    category: 'rewards',
    permission: 'admin',
    usage: '<giveawayId>',
    async execute(client, message, args) {
      const id = args[0];
      if (!id) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike gdelete <id>`')], allowedMentions: { repliedUser: false } });
      client.db.delete(`giveaway_${message.guild.id}_${id}`);
      return message.reply({ embeds: [Embeds.success('Deleted', 'Giveaway deleted.')], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'reward',
    description: 'Reward a user with coins',
    category: 'rewards',
    permission: 'admin',
    usage: '@user <amount>',
    async execute(client, message, args) {
      const target = message.mentions.users.first();
      const amount = parseInt(args[1]);
      if (!target || !amount) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike reward @user <amount>`')], allowedMentions: { repliedUser: false } });
      const bal = client.db.get(`balance_${message.guild.id}_${target.id}`) || 0;
      client.db.set(`balance_${message.guild.id}_${target.id}`, bal + amount);
      return message.reply({ embeds: [Embeds.success('Rewarded', `${target.username} received ${amount} coins!`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'massreward',
    description: 'Reward all members',
    category: 'rewards',
    permission: 'admin',
    usage: '<amount>',
    async execute(client, message, args) {
      const amount = parseInt(args[0]);
      if (!amount) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike massreward <amount>`')], allowedMentions: { repliedUser: false } });
      const members = await message.guild.members.fetch();
      let count = 0;
      for (const [, member] of members) {
        if (member.user.bot) continue;
        const bal = client.db.get(`balance_${message.guild.id}_${member.id}`) || 0;
        client.db.set(`balance_${message.guild.id}_${member.id}`, bal + amount);
        count++;
      }
      return message.reply({ embeds: [Embeds.success('Mass Reward', `Rewarded ${count} members with ${amount} coins each!`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'rolereward',
    description: 'Reward all members with a role',
    category: 'rewards',
    permission: 'admin',
    usage: '@role',
    async execute(client, message, args) {
      const role = Helpers.resolveRole(message.guild, args[0]);
      if (!role) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike rolereward @role`')], allowedMentions: { repliedUser: false } });
      const members = await message.guild.members.fetch();
      let count = 0;
      for (const [, member] of members) {
        if (!member.roles.cache.has(role.id)) {
          try { await member.roles.add(role); count++; } catch {}
        }
      }
      return message.reply({ embeds: [Embeds.success('Done', `Added ${role} to ${count} members.`)], allowedMentions: { repliedUser: false } });
    },
  },
];

async function endGiveaway(client, guildId, giveawayId) {
  const giveaway = client.db.get(`giveaway_${guildId}_${giveawayId}`);
  if (!giveaway || giveaway.ended) return;
  giveaway.ended = true;
  client.db.set(`giveaway_${guildId}_${giveawayId}`, giveaway);

  const guild = client.guilds.cache.get(guildId);
  if (!guild) return;
  const channel = guild.channels.cache.get(giveaway.channelId);
  if (!channel) return;

  if (!giveaway.participants || giveaway.participants.length === 0) {
    return channel.send({ embeds: [Embeds.warning('Giveaway Ended', `Giveaway for **${giveaway.prize}** ended with no participants.`)] });
  }

  const winners = [];
  const pool = [...giveaway.participants];
  for (let i = 0; i < giveaway.winners && pool.length > 0; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    winners.push(pool.splice(idx, 1)[0]);
  }

  const winnerMentions = winners.map(w => `<@${w}>`).join(', ');
  return channel.send({
    content: winnerMentions,
    embeds: [Embeds.success('🎉 Giveaway Ended!', `**Prize:** ${giveaway.prize}\n**Winners:** ${winnerMentions}\n**Participants:** ${giveaway.participants.length}\n**Hosted by:** <@${giveaway.hostId}>`)],
  });
}

module.exports = rewardsCommands;
