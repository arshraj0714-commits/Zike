const Embeds = require('../utils/Embeds');
const Helpers = require('../utils/Helpers');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } = require('discord.js');

// ============================================
// VERIFICATION SYSTEM COMMANDS (15+ commands)
// ============================================

const verificationCommands = [
  {
    name: 'verifysetup',
    description: 'Setup the verification system',
    category: 'verification',
    permission: 'admin',
    usage: '#channel @role [button|captcha]',
    aliases: ['setupverify'],
    async execute(client, message, args) {
      const channel = Helpers.resolveChannel(message.guild, args[0]);
      const role = Helpers.resolveRole(message.guild, args[1]);
      const type = args[2]?.toLowerCase() || 'button';

      if (!channel || !role) {
        return message.reply({ embeds: [Embeds.error('Usage', '`@Zike verifysetup #channel @role [button|captcha]`')], allowedMentions: { repliedUser: false } });
      }

      client.db.set(`verify_enabled_${message.guild.id}`, true);
      client.db.set(`verify_role_${message.guild.id}`, role.id);
      client.db.set(`verify_channel_${message.guild.id}`, channel.id);
      client.db.set(`verify_type_${message.guild.id}`, type);

      const embed = Embeds.base({ color: 0x10B981 })
        .setTitle('✅ Verification Required')
        .setDescription(
          'Welcome to the server! To gain full access, please verify yourself.\n\n' +
          '**Click the button below to verify.**\n\n' +
          'If you have any issues, please contact a staff member.'
        )
        .setThumbnail(message.guild.iconURL({ size: 256, extension: 'png' }))
        .setFooter({ text: `${message.guild.name} • Verification` });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('verify_button')
          .setLabel('Verify')
          .setStyle(ButtonStyle.Success)
          .setEmoji('✅')
      );

      await channel.send({ embeds: [embed], components: [row] });

      return message.reply({ embeds: [Embeds.success('Verification Setup', `Verification system is now active in ${channel}.\nRole: ${role}\nType: ${type}`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'verify',
    description: 'Verify yourself manually',
    category: 'verification',
    permission: 'everyone',
    async execute(client, message) {
      const verifyEnabled = client.db.get(`verify_enabled_${message.guild.id}`);
      const verifyRole = client.db.get(`verify_role_${message.guild.id}`);

      if (!verifyEnabled || !verifyRole) {
        return message.reply({ embeds: [Embeds.error('Not Setup', 'Verification is not configured.')], allowedMentions: { repliedUser: false } });
      }

      const role = message.guild.roles.cache.get(verifyRole);
      if (!role) return message.reply({ embeds: [Embeds.error('Error', 'Verification role not found.')], allowedMentions: { repliedUser: false } });

      if (message.member.roles.cache.has(verifyRole)) {
        return message.reply({ embeds: [Embeds.info('Already Verified', 'You are already verified!')], allowedMentions: { repliedUser: false } });
      }

      try {
        await message.member.roles.add(role);
        return message.reply({ embeds: [Embeds.success('Verified!', 'You have been verified successfully!')], allowedMentions: { repliedUser: false } });
      } catch (e) {
        return message.reply({ embeds: [Embeds.error('Error', `Failed to verify: ${e.message}`)], allowedMentions: { repliedUser: false } });
      }
    },
  },
  {
    name: 'verifyrole',
    description: 'Set the verification role',
    category: 'verification',
    permission: 'admin',
    usage: '@role',
    async execute(client, message, args) {
      const role = Helpers.resolveRole(message.guild, args[0]);
      if (!role) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike verifyrole @role`')], allowedMentions: { repliedUser: false } });
      client.db.set(`verify_role_${message.guild.id}`, role.id);
      return message.reply({ embeds: [Embeds.success('Set', `Verification role set to ${role}.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'verifychannel',
    description: 'Set the verification channel',
    category: 'verification',
    permission: 'admin',
    usage: '#channel',
    async execute(client, message, args) {
      const channel = Helpers.resolveChannel(message.guild, args[0]);
      if (!channel) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike verifychannel #channel`')], allowedMentions: { repliedUser: false } });
      client.db.set(`verify_channel_${message.guild.id}`, channel.id);
      return message.reply({ embeds: [Embeds.success('Set', `Verification channel set to ${channel}.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'verifytype',
    description: 'Set verification type (button or captcha)',
    category: 'verification',
    permission: 'admin',
    usage: '<button|captcha>',
    async execute(client, message, args) {
      const type = args[0]?.toLowerCase();
      if (!['button', 'captcha'].includes(type)) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike verifytype <button|captcha>`')], allowedMentions: { repliedUser: false } });
      client.db.set(`verify_type_${message.guild.id}`, type);
      return message.reply({ embeds: [Embeds.success('Set', `Verification type set to ${type}.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'verifyon',
    description: 'Enable verification system',
    category: 'verification',
    permission: 'admin',
    async execute(client, message) {
      client.db.set(`verify_enabled_${message.guild.id}`, true);
      return message.reply({ embeds: [Embeds.success('Enabled', 'Verification system is now active.')], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'verifyoff',
    description: 'Disable verification system',
    category: 'verification',
    permission: 'admin',
    async execute(client, message) {
      client.db.set(`verify_enabled_${message.guild.id}`, false);
      return message.reply({ embeds: [Embeds.warning('Disabled', 'Verification system is now disabled.')], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'verifymessage',
    description: 'Set custom verification message',
    category: 'verification',
    permission: 'admin',
    usage: '<message>',
    async execute(client, message, args) {
      const text = args.join(' ');
      if (!text) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike verifymessage <message>`')], allowedMentions: { repliedUser: false } });
      client.db.set(`verify_message_${message.guild.id}`, text);
      return message.reply({ embeds: [Embeds.success('Set', 'Verification message updated.')], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'verifyunverified',
    description: 'List members without verification role',
    category: 'verification',
    permission: 'staff',
    async execute(client, message) {
      const verifyRoleId = client.db.get(`verify_role_${message.guild.id}`);
      if (!verifyRoleId) return message.reply({ embeds: [Embeds.error('Not Setup', 'Verification not configured.')], allowedMentions: { repliedUser: false } });
      const members = await message.guild.members.fetch();
      const unverified = members.filter(m => !m.user.bot && !m.roles.cache.has(verifyRoleId));
      if (unverified.size === 0) return message.reply({ embeds: [Embeds.success('All Verified', 'All members are verified!')], allowedMentions: { repliedUser: false } });
      const list = unverified.map(m => `${m.user.tag} (${m.id})`).join('\n');
      return message.reply({ embeds: [Embeds.warning('Unverified Members', `**${unverified.size} unverified:**`).addFields({ name: '\u200B', value: Helpers.truncate(list, 1024) })], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'verifyall',
    description: 'Verify all unverified members',
    category: 'verification',
    permission: 'admin',
    async execute(client, message) {
      const verifyRoleId = client.db.get(`verify_role_${message.guild.id}`);
      if (!verifyRoleId) return message.reply({ embeds: [Embeds.error('Not Setup', 'Verification not configured.')], allowedMentions: { repliedUser: false } });
      const members = await message.guild.members.fetch();
      const unverified = members.filter(m => !m.user.bot && !m.roles.cache.has(verifyRoleId));
      let count = 0;
      for (const [, member] of unverified) {
        try { await member.roles.add(verifyRoleId); count++; } catch {}
      }
      return message.reply({ embeds: [Embeds.success('Verified All', `Verified ${count} members.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'verifyremove',
    description: 'Remove verification from a user',
    category: 'verification',
    permission: 'admin',
    usage: '@user',
    async execute(client, message, args) {
      const target = await Helpers.resolveMember(message.guild, args[0]);
      const verifyRoleId = client.db.get(`verify_role_${message.guild.id}`);
      if (!target || !verifyRoleId) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike verifyremove @user`')], allowedMentions: { repliedUser: false } });
      await target.roles.remove(verifyRoleId).catch(() => {});
      return message.reply({ embeds: [Embeds.warning('Removed', `Verification removed from ${target.user.tag}.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'verifypanel',
    description: 'Create a custom verification panel',
    category: 'verification',
    permission: 'admin',
    usage: '<title> | <description>',
    async execute(client, message, args) {
      const text = args.join(' ');
      const [title, desc] = text.split('|').map(s => s.trim());
      if (!title || !desc) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike verifypanel <title> | <description>`')], allowedMentions: { repliedUser: false } });

      const embed = Embeds.base({ color: 0x10B981 })
        .setTitle(`✅ ${title}`)
        .setDescription(desc)
        .setThumbnail(message.guild.iconURL({ size: 256, extension: 'png' }));

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('verify_button').setLabel('Verify').setStyle(ButtonStyle.Success).setEmoji('✅')
      );

      await message.channel.send({ embeds: [embed], components: [row] });
      return message.delete().catch(() => {});
    },
  },
];

module.exports = verificationCommands;
