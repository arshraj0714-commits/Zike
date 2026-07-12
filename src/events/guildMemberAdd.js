const Embeds = require('../utils/Embeds');
const Helpers = require('../utils/Helpers');

module.exports = {
  name: 'guildMemberAdd',
  async execute(client, member) {
    const guild = member.guild;

    // ============================================
    // Anti-Nuke / Anti-Raid: Check if mass join happening
    // ============================================
    const antinukeEnabled = client.db.get(`antinuke_enabled_${guild.id}`);
    if (antinukeEnabled) {
      const joinThreshold = client.db.get(`antinuke_join_threshold_${guild.id}`) || 10;
      const timeWindow = client.db.get(`antinuke_join_window_${guild.id}`) || 10000; // 10 sec

      const recentJoinsKey = `recent_joins_${guild.id}`;
      const recentJoins = client.db.get(recentJoinsKey, []);
      const now = Date.now();

      // Filter to only recent joins
      const recent = recentJoins.filter(t => now - t < timeWindow);
      recent.push(now);
      client.db.set(recentJoinsKey, recent);

      if (recent.length > joinThreshold) {
        // Possible raid - kick new member and alert
        const alertChannel = client.db.get(`antinuke_alert_channel_${guild.id}`);
        const alertChannelObj = alertChannel ? guild.channels.cache.get(alertChannel) : null;

        if (alertChannelObj) {
          alertChannelObj.send({
            embeds: [Embeds.warning(
              '⚠️ Possible Raid Detected',
              `${recent.length} members joined in ${timeWindow / 1000} seconds!\n` +
              `Newest member: ${member.user.tag} (${member.id})\n` +
              `Action: Auto-kicked new member and monitoring.`
            )],
          }).catch(() => {});
        }

        // Kick the new member
        try {
          await member.kick('Anti-Raid: Mass join detected');
        } catch {}
      }

      // Account age check (for anti-nuke)
      const minAge = client.db.get(`antinuke_min_account_age_${guild.id}`);
      if (minAge) {
        const accountAge = Helpers.accountAge(member.user);
        if (accountAge < minAge) {
          try {
            await member.kick(`Account too new (age: ${accountAge} days, required: ${minAge} days)`);
            const logChannel = client.db.get(`antinuke_log_channel_${guild.id}`);
            if (logChannel) {
              const ch = guild.channels.cache.get(logChannel);
              if (ch) {
                ch.send({
                  embeds: [Embeds.warning(
                    'New Account Blocked',
                    `${member.user.tag} (${member.id}) was kicked.\nAccount age: ${accountAge} days\nRequired: ${minAge} days`
                  )],
                }).catch(() => {});
              }
            }
            return; // Don't process further
          } catch {}
        }
      }
    }

    // ============================================
    // Welcome message
    // ============================================
    const welcomeEnabled = client.db.get(`welcome_enabled_${guild.id}`);
    if (welcomeEnabled) {
      const welcomeChannelId = client.db.get(`welcome_channel_${guild.id}`);
      const welcomeMessage = client.db.get(`welcome_message_${guild.id}`) ||
        'Welcome {user} to {server}! You are member #{count}.';
      const welcomeChannel = welcomeChannelId ? guild.channels.cache.get(welcomeChannelId) : guild.systemChannel;

      if (welcomeChannel) {
        const msg = welcomeMessage
          .replace(/{user}/g, `<@${member.id}>`)
          .replace(/{username}/g, member.user.username)
          .replace(/{server}/g, guild.name)
          .replace(/{count}/g, guild.memberCount)
          .replace(/{mention}/g, `<@${member.id}>`);

        const embed = Embeds.primary(
          `Welcome to ${guild.name}!`,
          msg
        )
          .setThumbnail(member.user.displayAvatarURL({ size: 256, extension: 'png' }))
          .addFields(
            { name: '👤 Member', value: `${member.user.tag}`, inline: true },
            { name: '📅 Joined', value: Helpers.discordTimestamp(member.joinedAt), inline: true },
            { name: '📊 Member #', value: `${guild.memberCount}`, inline: true }
          );

        if (guild.iconURL()) {
          embed.setAuthor({ name: guild.name, iconURL: guild.iconURL() });
        }

        welcomeChannel.send({ embeds: [embed] }).catch(() => {});
      }
    }

    // ============================================
    // Auto-role
    // ============================================
    const autoRoleIds = client.db.get(`autoroles_${guild.id}`) || [];
    if (autoRoleIds.length > 0) {
      for (const roleId of autoRoleIds) {
        const role = guild.roles.cache.get(roleId);
        if (role) {
          try {
            await member.roles.add(role);
          } catch (e) {
            console.error(`Failed to add auto-role ${roleId}:`, e.message);
          }
        }
      }
    }

    // ============================================
    // Verification system
    // ============================================
    const verifyEnabled = client.db.get(`verify_enabled_${guild.id}`);
    if (verifyEnabled) {
      const verifyRole = client.db.get(`verify_role_${guild.id}`);
      const verifyChannelId = client.db.get(`verify_channel_${guild.id}`);
      const verifyMessage = client.db.get(`verify_message_${guild.id}`) ||
        `Welcome ${member}! Please verify yourself to gain access to the server.`;

      if (verifyChannelId) {
        const channel = guild.channels.cache.get(verifyChannelId);
        if (channel) {
          channel.send({
            content: `<@${member.id}>`,
            embeds: [Embeds.info('Verification Required', verifyMessage.replace(/{user}/g, `<@${member.id}>`))],
          }).catch(() => {});
        }
      }
    }

    // ============================================
    // Invite tracking
    // ============================================
    try {
      const invites = await guild.invites.fetch();
      const storedInvites = client.db.get(`invites_${guild.id}`) || {};

      let inviter = null;
      let usedCode = null;

      for (const [code, invite] of invites) {
        const stored = storedInvites[code];
        if (!stored || invite.uses > stored.uses) {
          inviter = invite.inviter;
          usedCode = code;
          storedInvites[code] = { uses: invite.uses, inviter: invite.inviter?.id };
          break;
        }
      }
      client.db.set(`invites_${guild.id}`, storedInvites);

      if (inviter) {
        const inviteKey = `invites_count_${guild.id}_${inviter.id}`;
        const count = client.db.increment(inviteKey);
        const totalKey = `invites_total_${guild.id}_${inviter.id}`;
        client.db.increment(totalKey);

        // Save who invited this member
        client.db.set(`invited_by_${guild.id}_${member.id}`, {
          inviterId: inviter.id,
          code: usedCode,
          timestamp: Date.now(),
        });

        // Log invite
        const logChannelId = client.db.get(`invitelog_channel_${guild.id}`);
        if (logChannelId) {
          const ch = guild.channels.cache.get(logChannelId);
          if (ch) {
            ch.send({
              embeds: [Embeds.success(
                'New Member Joined',
                `${member.user.tag} (${member.id}) joined the server!`
              ).addFields(
                { name: 'Invited By', value: `<@${inviter.id}> (${inviter.tag})`, inline: true },
                { name: 'Invite Code', value: `\`${usedCode}\``, inline: true },
                { name: 'Total Invites', value: `${count}`, inline: true },
                { name: 'Account Created', value: Helpers.discordTimestamp(member.user.createdAt), inline: true },
                { name: 'Joined At', value: Helpers.discordTimestamp(member.joinedAt), inline: true },
              )],
            }).catch(() => {});
          }
        }

        // Check for invite rewards
        const rewards = client.db.get(`invite_rewards_${guild.id}`) || {};
        for (const [threshold, roleId] of Object.entries(rewards)) {
          if (count >= parseInt(threshold)) {
            const role = guild.roles.cache.get(roleId);
            if (role && !member.roles.cache.has(roleId)) {
              try {
                const inviterMember = await guild.members.fetch(inviter.id);
                await inviterMember.roles.add(role);
              } catch {}
            }
          }
        }
      }
    } catch (e) {
      console.error('Invite tracking error:', e.message);
    }
  },
};
