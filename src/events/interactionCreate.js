const Embeds = require('../utils/Embeds');
const Helpers = require('../utils/Helpers');
const { ChannelType, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'interactionCreate',
  async execute(client, interaction) {
    if (!interaction.isButton()) return;
    if (!interaction.guild) return;

    const guild = interaction.guild;
    const customId = interaction.customId;

    // ============================================
    // TICKET SYSTEM
    // ============================================
    if (customId.startsWith('ticket_create_')) {
      const categoryId = customId.replace('ticket_create_', '');
      const category = categoryId !== 'default' ? guild.channels.cache.get(categoryId) : null;

      // Check if user already has an open ticket
      const existingTickets = client.db.get(`tickets_${guild.id}`) || [];
      const existing = existingTickets.find(t => t.userId === interaction.user.id && t.status === 'open');
      if (existing) {
        return interaction.reply({
          embeds: [Embeds.warning('Ticket Already Open', `You already have an open ticket: <#${existing.channelId}>`)],
          ephemeral: true,
        });
      }

      // Create ticket channel
      const ticketId = Helpers.generateId(6);
      const ticketName = `ticket-${interaction.user.username}-${ticketId}`;

      try {
        const ticketChannel = await guild.channels.create({
          name: ticketName,
          type: ChannelType.GuildText,
          parent: category?.id || undefined,
          permissionOverwrites: [
            {
              id: guild.id,
              deny: [PermissionFlagsBits.ViewChannel],
            },
            {
              id: interaction.user.id,
              allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ReadMessageHistory,
                PermissionFlagsBits.AttachFiles,
                PermissionFlagsBits.EmbedLinks,
              ],
            },
            {
              id: client.user.id,
              allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ReadMessageHistory,
                PermissionFlagsBits.ManageChannels,
              ],
            },
          ],
        });

        // Add staff role if configured
        const staffRoles = client.permissions.getStaffRoles(guild.id);
        for (const roleId of staffRoles) {
          await ticketChannel.permissionOverwrites.edit(roleId, {
            ViewChannel: true,
            SendMessages: true,
            ReadMessageHistory: true,
          }).catch(() => {});
        }

        // Save ticket
        const ticket = {
          id: ticketId,
          channelId: ticketChannel.id,
          userId: interaction.user.id,
          username: interaction.user.username,
          status: 'open',
          createdAt: Date.now(),
          claimedBy: null,
        };
        existingTickets.push(ticket);
        client.db.set(`tickets_${guild.id}`, existingTickets);

        // Send welcome message in ticket
        const welcomeEmbed = Embeds.primary(
          `🎫 Ticket #${ticketId}`,
          `Hello ${interaction.user}! Thank you for creating a ticket.\n\n` +
          `Please describe your issue and our staff team will assist you shortly.\n\n` +
          `**Ticket ID:** ${ticketId}\n` +
          `**Created:** ${Helpers.discordTimestamp(new Date())}\n` +
          `**Status:** Open`
        ).setThumbnail(interaction.user.displayAvatarURL({ size: 256, extension: 'png' }));

        const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('ticket_close_' + ticketId)
            .setLabel('Close Ticket')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🔒'),
          new ButtonBuilder()
            .setCustomId('ticket_claim_' + ticketId)
            .setLabel('Claim Ticket')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('✋'),
        );

        await ticketChannel.send({
          content: `<@${interaction.user.id}> ${staffRoles.map(r => `<@&${r}>`).join(' ')}`,
          embeds: [welcomeEmbed],
          components: [row],
        });

        await interaction.reply({
          embeds: [Embeds.success('Ticket Created', `Your ticket has been created: ${ticketChannel}`)],
          ephemeral: true,
        });

        // Log ticket creation
        const logChannelId = client.db.get(`ticketlog_channel_${guild.id}`);
        if (logChannelId) {
          const ch = guild.channels.cache.get(logChannelId);
          if (ch) {
            ch.send({
              embeds: [Embeds.info('Ticket Created', `Ticket #${ticketId} was created.`).addFields(
                { name: 'User', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
                { name: 'Channel', value: ticketChannel.toString(), inline: true },
              )],
            }).catch(() => {});
          }
        }
      } catch (e) {
        console.error('Ticket creation error:', e.message);
        await interaction.reply({
          embeds: [Embeds.error('Error', 'Failed to create ticket. Please contact an admin.')],
          ephemeral: true,
        });
      }
      return;
    }

    if (customId.startsWith('ticket_close_')) {
      const ticketId = customId.replace('ticket_close_', '');
      const tickets = client.db.get(`tickets_${guild.id}`) || [];
      const ticket = tickets.find(t => t.id === ticketId);

      if (!ticket) {
        return interaction.reply({
          embeds: [Embeds.error('Error', 'Ticket not found.')],
          ephemeral: true,
        });
      }

      // Check if user is ticket owner or staff
      const isOwner = interaction.user.id === ticket.userId;
      const isStaff = client.permissions.isStaff(interaction.member);
      if (!isOwner && !isStaff) {
        return interaction.reply({
          embeds: [Embeds.error('Access Denied', 'Only the ticket owner or staff can close this ticket.')],
          ephemeral: true,
        });
      }

      // Update ticket status
      ticket.status = 'closed';
      ticket.closedBy = interaction.user.id;
      ticket.closedAt = Date.now();
      client.db.set(`tickets_${guild.id}`, tickets);

      await interaction.reply({
        embeds: [Embeds.warning('Ticket Closing', `Ticket will be deleted in 5 seconds. Closed by ${interaction.user}.`)],
      });

      // Generate transcript (save last 50 messages)
      try {
        const messages = await interaction.channel.messages.fetch({ limit: 50 });
        const transcript = messages.reverse().map(m =>
          `[${new Date(m.createdAt).toISOString()}] ${m.author.tag}: ${m.content}`
        ).join('\n');

        const logChannelId = client.db.get(`ticketlog_channel_${guild.id}`);
        if (logChannelId) {
          const ch = guild.channels.cache.get(logChannelId);
          if (ch) {
            const { AttachmentBuilder } = require('discord.js');
            const buffer = Buffer.from(transcript, 'utf-8');
            const attachment = new AttachmentBuilder(buffer, { name: `transcript-${ticketId}.txt` });

            ch.send({
              embeds: [Embeds.info('Ticket Closed', `Ticket #${ticketId} was closed.`).addFields(
                { name: 'Opened By', value: `<@${ticket.userId}>`, inline: true },
                { name: 'Closed By', value: `<@${interaction.user.id}>`, inline: true },
                { name: 'Duration', value: Helpers.formatDuration(ticket.closedAt - ticket.createdAt), inline: true },
              )],
              files: [attachment],
            }).catch(() => {});
          }
        }
      } catch (e) {
        console.error('Transcript error:', e.message);
      }

      setTimeout(async () => {
        try {
          await interaction.channel.delete();
        } catch {}
      }, 5000);
      return;
    }

    if (customId.startsWith('ticket_claim_')) {
      const ticketId = customId.replace('ticket_claim_', '');
      const tickets = client.db.get(`tickets_${guild.id}`) || [];
      const ticket = tickets.find(t => t.id === ticketId);

      if (!ticket) return;

      if (!client.permissions.isStaff(interaction.member)) {
        return interaction.reply({
          embeds: [Embeds.error('Access Denied', 'Only staff can claim tickets.')],
          ephemeral: true,
        });
      }

      if (ticket.claimedBy) {
        return interaction.reply({
          embeds: [Embeds.warning('Already Claimed', `This ticket is already claimed by <@${ticket.claimedBy}>.`)],
          ephemeral: true,
        });
      }

      ticket.claimedBy = interaction.user.id;
      client.db.set(`tickets_${guild.id}`, tickets);

      await interaction.reply({
        embeds: [Embeds.success('Ticket Claimed', `This ticket has been claimed by ${interaction.user}.`)],
      });
      return;
    }

    // ============================================
    // VERIFICATION SYSTEM
    // ============================================
    if (customId === 'verify_button') {
      const verifyRole = client.db.get(`verify_role_${guild.id}`);
      if (!verifyRole) {
        return interaction.reply({
          embeds: [Embeds.error('Verification Not Setup', 'Verification role has not been configured.')],
          ephemeral: true,
        });
      }

      const verifyType = client.db.get(`verify_type_${guild.id}`) || 'button';

      if (verifyType === 'captcha') {
        // Simple math captcha
        const a = Math.floor(Math.random() * 10) + 1;
        const b = Math.floor(Math.random() * 10) + 1;
        const answer = a + b;

        client.db.set(`verify_captcha_${interaction.user.id}`, { answer, expires: Date.now() + 60000 });

        const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
        const modal = new ModalBuilder()
          .setCustomId('verify_captcha_modal')
          .setTitle('Verification');

        const input = new TextInputBuilder()
          .setCustomId('captcha_answer')
          .setLabel(`What is ${a} + ${b}?`)
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setMaxLength(3);

        modal.addComponents(new ActionRowBuilder().addComponents(input));
        return await interaction.showModal(modal);
      }

      // Button verification - just give role
      try {
        await interaction.member.roles.add(verifyRole);
        await interaction.reply({
          embeds: [Embeds.success('Verified!', 'You have been verified successfully! Welcome to the server.')],
          ephemeral: true,
        });
      } catch (e) {
        await interaction.reply({
          embeds: [Embeds.error('Error', 'Failed to assign verification role. Please contact an admin.')],
          ephemeral: true,
        });
      }
      return;
    }

    // ============================================
    // GIVEAWAY SYSTEM
    // ============================================
    if (customId.startsWith('giveaway_join_')) {
      const giveawayId = customId.replace('giveaway_join_', '');
      const giveaway = client.db.get(`giveaway_${guild.id}_${giveawayId}`);

      if (!giveaway) {
        return interaction.reply({
          embeds: [Embeds.error('Error', 'Giveaway not found.')],
          ephemeral: true,
        });
      }

      if (giveaway.ended) {
        return interaction.reply({
          embeds: [Embeds.warning('Ended', 'This giveaway has already ended.')],
          ephemeral: true,
        });
      }

      if (!giveaway.participants) giveaway.participants = [];

      if (giveaway.participants.includes(interaction.user.id)) {
        // Remove entry
        giveaway.participants = giveaway.participants.filter(id => id !== interaction.user.id);
        client.db.set(`giveaway_${guild.id}_${giveawayId}`, giveaway);
        return interaction.reply({
          embeds: [Embeds.info('Left Giveaway', 'You have left the giveaway.')],
          ephemeral: true,
        });
      }

      giveaway.participants.push(interaction.user.id);
      client.db.set(`giveaway_${guild.id}_${giveawayId}`, giveaway);

      return interaction.reply({
        embeds: [Embeds.success('Joined!', `You're now entered in the giveaway! ${giveaway.participants.length} total entries.`)],
        ephemeral: true,
      });
    }
  },
};
