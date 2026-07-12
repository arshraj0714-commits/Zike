const Embeds = require('../utils/Embeds');
const Helpers = require('../utils/Helpers');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } = require('discord.js');

// ============================================
// TICKET SYSTEM COMMANDS (20+ commands)
// ============================================

const ticketCommands = [
  {
    name: 'ticketsetup',
    description: 'Setup the ticket system',
    category: 'ticket',
    permission: 'admin',
    usage: '[#channel] [category]',
    aliases: ['setupticket', 'ticketsetup'],
    async execute(client, message, args) {
      const channel = Helpers.resolveChannel(message.guild, args[0]) || message.channel;
      const category = args[1] ? Helpers.resolveChannel(message.guild, args[1]) : null;

      if (category) {
        client.db.set(`ticket_category_${message.guild.id}`, category.id);
      }

      const embed = Embeds.base({ color: 0x8B5CF6 })
        .setTitle('🎫 Support Tickets')
        .setDescription(
          'Need help? Create a ticket and our staff team will assist you!\n\n' +
          '**How to create a ticket:**\n' +
          '1. Click the button below 🎫\n' +
          '2. Describe your issue\n' +
          '3. Wait for staff to respond\n\n' +
          '**Rules:**\n' +
          '• Don\'t create tickets for fun\n' +
          '• Be respectful to staff\n' +
          '• Provide clear details about your issue'
        )
        .setThumbnail(message.guild.iconURL({ size: 256, extension: 'png' }))
        .setFooter({ text: `${message.guild.name} • Ticket System` });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`ticket_create_${category ? category.id : 'default'}`)
          .setLabel('Create Ticket')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('🎫'),
      );

      await channel.send({ embeds: [embed], components: [row] });
      client.db.set(`ticket_panel_${message.guild.id}`, channel.id);

      return message.reply({ embeds: [Embeds.success('Ticket Setup Complete', `Ticket panel created in ${channel}.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'ticket',
    description: 'Create a ticket manually',
    category: 'ticket',
    permission: 'everyone',
    aliases: ['newticket', 'openticket'],
    async execute(client, message) {
      const existingTickets = client.db.get(`tickets_${message.guild.id}`) || [];
      const existing = existingTickets.find(t => t.userId === message.author.id && t.status === 'open');
      if (existing) {
        return message.reply({ embeds: [Embeds.warning('Ticket Already Open', `You already have a ticket: <#${existing.channelId}>`)], allowedMentions: { repliedUser: false } });
      }

      const categoryId = client.db.get(`ticket_category_${message.guild.id}`);
      const category = categoryId ? message.guild.channels.cache.get(categoryId) : null;
      const ticketId = Helpers.generateId(6);

      try {
        const ticketChannel = await message.guild.channels.create({
          name: `ticket-${message.author.username}-${ticketId}`,
          type: ChannelType.GuildText,
          parent: category?.id || undefined,
          permissionOverwrites: [
            { id: message.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
            {
              id: message.author.id,
              allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.AttachFiles],
            },
            { id: client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ReadMessageHistory] },
          ],
        });

        const staffRoles = client.permissions.getStaffRoles(message.guild.id);
        for (const roleId of staffRoles) {
          await ticketChannel.permissionOverwrites.edit(roleId, { ViewChannel: true, SendMessages: true, ReadMessageHistory: true }).catch(() => {});
        }

        const ticket = { id: ticketId, channelId: ticketChannel.id, userId: message.author.id, username: message.author.username, status: 'open', createdAt: Date.now(), claimedBy: null };
        existingTickets.push(ticket);
        client.db.set(`tickets_${message.guild.id}`, existingTickets);

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId(`ticket_close_${ticketId}`).setLabel('Close').setStyle(ButtonStyle.Danger).setEmoji('🔒'),
          new ButtonBuilder().setCustomId(`ticket_claim_${ticketId}`).setLabel('Claim').setStyle(ButtonStyle.Primary).setEmoji('✋'),
        );

        await ticketChannel.send({
          content: `<@${message.author.id}> ${staffRoles.map(r => `<@&${r}>`).join(' ')}`,
          embeds: [Embeds.primary(`Ticket #${ticketId}`, `Hello ${message.author}! Please describe your issue.`)],
          components: [row],
        });

        return message.reply({ embeds: [Embeds.success('Ticket Created', `Your ticket: ${ticketChannel}`)], allowedMentions: { repliedUser: false } });
      } catch (e) {
        return message.reply({ embeds: [Embeds.error('Error', e.message)], allowedMentions: { repliedUser: false } });
      }
    },
  },
  {
    name: 'ticketclose',
    description: 'Close the current ticket',
    category: 'ticket',
    permission: 'everyone',
    aliases: ['closeticket'],
    async execute(client, message) {
      const tickets = client.db.get(`tickets_${message.guild.id}`) || [];
      const ticket = tickets.find(t => t.channelId === message.channel.id);
      if (!ticket) return message.reply({ embeds: [Embeds.error('Not a Ticket', 'This command can only be used in a ticket channel.')], allowedMentions: { repliedUser: false } });

      const isOwner = message.author.id === ticket.userId;
      const isStaff = client.permissions.isStaff(message.member);
      if (!isOwner && !isStaff) return message.reply({ embeds: [Embeds.error('Access Denied', 'Only the ticket owner or staff can close this.')], allowedMentions: { repliedUser: false } });

      ticket.status = 'closed';
      ticket.closedBy = message.author.id;
      client.db.set(`tickets_${message.guild.id}`, tickets);

      await message.reply({ embeds: [Embeds.warning('Closing', 'Ticket will be deleted in 5 seconds...')] });
      setTimeout(() => message.channel.delete().catch(() => {}), 5000);
    },
  },
  {
    name: 'ticketadd',
    description: 'Add a user to the current ticket',
    category: 'ticket',
    permission: 'staff',
    usage: '@user',
    async execute(client, message, args) {
      const target = await Helpers.resolveMember(message.guild, args[0]);
      if (!target) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike ticketadd @user`')], allowedMentions: { repliedUser: false } });
      await message.channel.permissionOverwrites.edit(target.id, { ViewChannel: true, SendMessages: true, ReadMessageHistory: true });
      return message.reply({ embeds: [Embeds.success('Added', `${target.user.tag} has been added to this ticket.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'ticketremove',
    description: 'Remove a user from the current ticket',
    category: 'ticket',
    permission: 'staff',
    usage: '@user',
    async execute(client, message, args) {
      const target = await Helpers.resolveMember(message.guild, args[0]);
      if (!target) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike ticketremove @user`')], allowedMentions: { repliedUser: false } });
      await message.channel.permissionOverwrites.edit(target.id, { ViewChannel: false });
      return message.reply({ embeds: [Embeds.success('Removed', `${target.user.tag} has been removed from this ticket.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'ticketrename',
    description: 'Rename the current ticket',
    category: 'ticket',
    permission: 'staff',
    usage: '<new name>',
    async execute(client, message, args) {
      const name = args.join('-').toLowerCase();
      if (!name) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike ticketrename <new name>`')], allowedMentions: { repliedUser: false } });
      await message.channel.setName(name);
      return message.reply({ embeds: [Embeds.success('Renamed', `Ticket renamed to ${name}.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'ticketclaim',
    description: 'Claim the current ticket',
    category: 'ticket',
    permission: 'staff',
    async execute(client, message) {
      const tickets = client.db.get(`tickets_${message.guild.id}`) || [];
      const ticket = tickets.find(t => t.channelId === message.channel.id);
      if (!ticket) return message.reply({ embeds: [Embeds.error('Not a Ticket', 'Use this in a ticket channel.')], allowedMentions: { repliedUser: false } });
      if (ticket.claimedBy) return message.reply({ embeds: [Embeds.warning('Already Claimed', `Claimed by <@${ticket.claimedBy}>.`)], allowedMentions: { repliedUser: false } });
      ticket.claimedBy = message.author.id;
      client.db.set(`tickets_${message.guild.id}`, tickets);
      return message.reply({ embeds: [Embeds.success('Claimed', `Ticket claimed by ${message.author}.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'ticketcategory',
    description: 'Set the ticket category',
    category: 'ticket',
    permission: 'admin',
    usage: '#category',
    async execute(client, message, args) {
      const category = Helpers.resolveChannel(message.guild, args[0]);
      if (!category || category.type !== ChannelType.GuildCategory) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike ticketcategory #category`')], allowedMentions: { repliedUser: false } });
      client.db.set(`ticket_category_${message.guild.id}`, category.id);
      return message.reply({ embeds: [Embeds.success('Set', `Ticket category set to ${category.name}.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'ticketlog',
    description: 'Set the ticket log channel',
    category: 'ticket',
    permission: 'admin',
    usage: '#channel',
    async execute(client, message, args) {
      const channel = Helpers.resolveChannel(message.guild, args[0]);
      if (!channel) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike ticketlog #channel`')], allowedMentions: { repliedUser: false } });
      client.db.set(`ticketlog_channel_${message.guild.id}`, channel.id);
      return message.reply({ embeds: [Embeds.success('Set', `Ticket logs will be sent to ${channel}.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'tickets',
    description: 'View all open tickets',
    category: 'ticket',
    permission: 'staff',
    async execute(client, message) {
      const tickets = client.db.get(`tickets_${message.guild.id}`) || [];
      const open = tickets.filter(t => t.status === 'open');
      if (open.length === 0) return message.reply({ embeds: [Embeds.info('No Tickets', 'No open tickets.')], allowedMentions: { repliedUser: false } });
      const list = open.map(t => `**#${t.id}** — <@${t.userId}> — <#${t.channelId}> — Created ${Helpers.discordTimestamp(t.createdAt)}`).join('\n');
      return message.reply({ embeds: [Embeds.info('Open Tickets', `**${open.length} open tickets:**`).addFields({ name: '\u200B', value: list })], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'ticketstats',
    description: 'View ticket statistics',
    category: 'ticket',
    permission: 'staff',
    async execute(client, message) {
      const tickets = client.db.get(`tickets_${message.guild.id}`) || [];
      const open = tickets.filter(t => t.status === 'open').length;
      const closed = tickets.filter(t => t.status === 'closed').length;
      const claimed = tickets.filter(t => t.claimedBy).length;
      const embed = Embeds.info('Ticket Stats', 'Ticket system statistics')
        .addFields(
          { name: 'Total', value: tickets.length.toString(), inline: true },
          { name: 'Open', value: open.toString(), inline: true },
          { name: 'Closed', value: closed.toString(), inline: true },
          { name: 'Claimed', value: claimed.toString(), inline: true },
        );
      return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'tickettopic',
    description: 'Set the ticket topic (description)',
    category: 'ticket',
    permission: 'staff',
    usage: '<topic>',
    async execute(client, message, args) {
      const topic = args.join(' ');
      if (!topic) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike tickettopic <topic>`')], allowedMentions: { repliedUser: false } });
      await message.channel.setTopic(topic);
      return message.reply({ embeds: [Embeds.success('Set', `Ticket topic updated.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'tickettranscript',
    description: 'Generate a transcript of the current ticket',
    category: 'ticket',
    permission: 'staff',
    async execute(client, message) {
      const messages = await message.channel.messages.fetch({ limit: 100 });
      const transcript = messages.reverse().map(m => `[${new Date(m.createdAt).toISOString()}] ${m.author.tag}: ${m.content}`).join('\n');
      const { AttachmentBuilder } = require('discord.js');
      const buffer = Buffer.from(transcript, 'utf-8');
      const attachment = new AttachmentBuilder(buffer, { name: `transcript-${message.channel.name}.txt` });
      return message.reply({ embeds: [Embeds.success('Transcript', 'Here is the transcript:'), { files: [attachment] }], files: [attachment], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'ticketpanel',
    description: 'Create a custom ticket panel',
    category: 'ticket',
    permission: 'admin',
    usage: '<title> | <description>',
    async execute(client, message, args) {
      const text = args.join(' ');
      const [title, desc] = text.split('|').map(s => s.trim());
      if (!title || !desc) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike ticketpanel <title> | <description>`')], allowedMentions: { repliedUser: false } });

      const embed = Embeds.base({ color: 0x8B5CF6 })
        .setTitle(`🎫 ${title}`)
        .setDescription(desc)
        .setThumbnail(message.guild.iconURL({ size: 256, extension: 'png' }));

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('ticket_create_default').setLabel('Open Ticket').setStyle(ButtonStyle.Primary).setEmoji('🎫'),
      );

      await message.channel.send({ embeds: [embed], components: [row] });
      return message.delete().catch(() => {});
    },
  },
];

module.exports = ticketCommands;
