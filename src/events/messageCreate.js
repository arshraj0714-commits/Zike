const { AttachmentBuilder } = require('discord.js');
const Embeds = require('../utils/Embeds');
const Helpers = require('../utils/Helpers');
const config = require('../config');

module.exports = {
  name: 'messageCreate',
  async execute(client, message) {
    // Ignore bots (including self)
    if (message.author.bot) return;

    // Ignore DMs for now (can be enabled later)
    if (!message.guild) {
      // Allow DM AI chat if user is whitelisted
      if (client.permissions.canUseAI(message.author.id)) {
        try {
          await message.channel.sendTyping();
          const response = await client.ai.generateResponse(
            message.content,
            message.author,
            true // Treat DMs like focused channel
          );
          // Split long messages
          if (response.length > 2000) {
            const chunks = Helpers.chunkText(response, 2000);
            for (const chunk of chunks) {
              await message.reply({ content: chunk, allowedMentions: { repliedUser: false } });
            }
          } else {
            await message.reply({ content: response, allowedMentions: { repliedUser: false } });
          }
        } catch (e) {
          console.error('DM AI error:', e.message);
        }
      }
      return;
    }

    const content = message.content.trim();
    const isMentioned = message.mentions.has(client.user, { ignoreEveryone: true });
    const isReplyToBot = message.reference?.messageId &&
      (await message.channel.messages.fetch(message.reference.messageId).catch(() => null))?.author?.id === client.user.id;

    // ============================================
    // CASE 1: AI Chat Channel (no ping needed)
    // ============================================
    if (config.ai.chatChannelId && message.channel.id === config.ai.chatChannelId) {
      // If user pinged with a command, still process commands
      if (isMentioned) {
        const stripped = content.replace(/<@!?\d+>/g, '').trim();
        const firstWord = stripped.split(/\s+/)[0]?.toLowerCase();

        // Check if first word is a known command
        if (firstWord && client.commandHandler.has(firstWord)) {
          return handleCommand(client, message, stripped);
        }
      }

      // Otherwise treat as AI chat
      try {
        await message.channel.sendTyping();
        const userMessage = content.replace(/<@!?\d+>/g, '').trim() || 'hi';
        const response = await client.ai.generateResponse(
          userMessage,
          message.author,
          true // Focused mode for AI channel
        );

        if (response.length > 2000) {
          const chunks = Helpers.chunkText(response, 2000);
          for (const chunk of chunks) {
            await message.channel.send({ content: chunk, allowedMentions: { repliedUser: false, parse: [] } });
          }
        } else {
          await message.reply({ content: response, allowedMentions: { repliedUser: false, parse: [] } });
        }
      } catch (error) {
        console.error('AI Channel error:', error.message);
        await message.reply({
          embeds: [Embeds.error('AI Error', 'Something went wrong while generating a response. Please try again.')],
        }).catch(() => {});
      }
      return;
    }

    // ============================================
    // CASE 2: Bot is pinged (command or AI chat)
    // ============================================
    if (isMentioned) {
      // Strip the mention and get the rest
      const stripped = content.replace(/<@!?\d+>/g, '').trim();

      // No content after mention - just say hi
      if (!stripped) {
        const isOwner = message.author.id === config.owner.id;
        const greetings = isOwner
          ? [
              `Hey Arsh! 👑 Always here for you. What do you need?`,
              `At your service, Arsh. What's the plan?`,
              `You called, boss? I'm ready.`,
              `Arsh! My creator. What can I do for you?`,
              `Loyalty mode: activated. What do you need, Arsh?`,
            ]
          : [
              `Hey ${message.author.username}! Need help? Try \`@Zike help\` to see what I can do.`,
              `Hi! Mention me with a command like \`@Zike help\` or just chat with me!`,
              `What's up? Use \`@Zike help\` to see my 400+ commands.`,
            ];
        return message.reply({
          content: Helpers.random(greetings),
          allowedMentions: { repliedUser: false },
        });
      }

      // Get the first word (potential command name)
      const firstWord = stripped.split(/\s+/)[0]?.toLowerCase();

      // Check if it's a command
      if (firstWord && client.commandHandler.has(firstWord)) {
        return handleCommand(client, message, stripped);
      }

      // Not a command - treat as AI chat (for whitelisted users or owner)
      if (client.permissions.canUseAI(message.author.id)) {
        try {
          await message.channel.sendTyping();
          const response = await client.ai.generateResponse(
            stripped,
            message.author,
            false // Random/human mode for general chat
          );

          if (response.length > 2000) {
            const chunks = Helpers.chunkText(response, 2000);
            for (const chunk of chunks) {
              await message.channel.send({ content: chunk, allowedMentions: { repliedUser: false, parse: [] } });
            }
          } else {
            await message.reply({ content: response, allowedMentions: { repliedUser: false, parse: [] } });
          }
        } catch (error) {
          console.error('AI ping error:', error.message);
          await message.reply({
            embeds: [Embeds.error('AI Error', 'Something went wrong. Try again in a moment.')],
          }).catch(() => {});
        }
        return;
      }

      // Not whitelisted - tell them to use the AI channel
      return message.reply({
        embeds: [Embeds.info(
          'Hey there!',
          `I'm **Zike**, an AI bot built by **Arsh**.\n\n` +
          `Use \`@Zike help\` to see my commands, or use the AI chat channel to talk with me!\n\n` +
          `If you want me to respond to your messages, ask Arsh to whitelist you.`
        )],
        allowedMentions: { repliedUser: false },
      });
    }

    // ============================================
    // CASE 3: Reply to bot message (AI chat continuation)
    // ============================================
    if (isReplyToBot) {
      // Only respond if user is whitelisted
      if (client.permissions.canUseAI(message.author.id)) {
        try {
          await message.channel.sendTyping();
          const response = await client.ai.generateResponse(
            content,
            message.author,
            false // Random mode
          );

          if (response.length > 2000) {
            const chunks = Helpers.chunkText(response, 2000);
            for (const chunk of chunks) {
              await message.channel.send({ content: chunk, allowedMentions: { repliedUser: false, parse: [] } });
            }
          } else {
            await message.reply({ content: response, allowedMentions: { repliedUser: false, parse: [] } });
          }
        } catch (error) {
          console.error('AI reply error:', error.message);
        }
        return;
      }
    }

    // ============================================
    // CASE 4: Random chance to respond in general chat (very rare, just for fun)
    // Only for whitelisted users - 2% chance if message is substantive
    // ============================================
    if (client.permissions.canUseAI(message.author.id) && content.length > 5 && !content.startsWith('@')) {
      // Very small random chance to chime in
      if (Math.random() < 0.02) {
        try {
          await message.channel.sendTyping();
          // Get last few messages for context
          const recentMessages = await message.channel.messages.fetch({ limit: 5 });
          const context = recentMessages
            .filter(m => !m.author.bot)
            .map(m => `${m.author.username}: ${m.content}`)
            .reverse()
            .join('\n');

          const prompt = `Recent chat context:\n${context}\n\nYou're chiming in casually. Keep it very short (1 sentence). Current message is from ${message.author.username}: ${content}`;
          const response = await client.ai.quick(
            prompt,
            client.ai.getGeneralSystemPrompt(message.author, message.author.id === config.owner.id)
          );

          if (response) {
            await message.channel.send({
              content: response.substring(0, 500),
              allowedMentions: { repliedUser: false, parse: [] },
            });
          }
        } catch (e) {
          // Silent fail for random responses
        }
      }
    }

    // Track message count for leveling (if enabled)
    if (message.guild) {
      const levelingEnabled = client.db.get(`leveling_enabled_${message.guild.id}`);
      if (levelingEnabled) {
        const key = `xp_${message.guild.id}_${message.author.id}`;
        const currentXp = client.db.get(key, 0);
        const currentLevel = Math.floor(Math.sqrt(currentXp / 100));

        // Add random XP (15-25)
        const xpGain = Math.floor(Math.random() * 11) + 15;
        const newXp = currentXp + xpGain;
        client.db.set(key, newXp);

        const newLevel = Math.floor(Math.sqrt(newXp / 100));
        if (newLevel > currentLevel) {
          // Level up!
          const levelChannel = client.db.get(`level_channel_${message.guild.id}`);
          const channel = levelChannel
            ? message.guild.channels.cache.get(levelChannel)
            : message.channel;

          if (channel) {
            channel.send({
              embeds: [Embeds.success(
                'Level Up!',
                `🎉 ${message.author} reached level **${newLevel}**!`
              )],
            }).catch(() => {});
          }

          // Check for level rewards
          const rewards = client.db.get(`level_rewards_${message.guild.id}`) || {};
          if (rewards[newLevel]) {
            const role = message.guild.roles.cache.get(rewards[newLevel]);
            if (role) {
              message.member.roles.add(role).catch(() => {});
            }
          }
        }
      }
    }
  },
};

/**
 * Handle a command invocation
 */
async function handleCommand(client, message, content) {
  const args = content.trim().split(/\s+/);
  const commandName = args.shift().toLowerCase();
  const command = client.commandHandler.get(commandName);

  if (!command) return;

  // Check permissions
  const permCheck = client.permissions.canUseCommand(message.member, command, message.guild.id);
  if (!permCheck.allowed) {
    return message.reply({
      embeds: [Embeds.error('Access Denied', permCheck.reason)],
      allowedMentions: { repliedUser: false },
    });
  }

  try {
    await command.execute(client, message, args);
  } catch (error) {
    console.error(`Command error [${commandName}]:`, error);
    message.reply({
      embeds: [Embeds.error(
        'Command Error',
        `An error occurred while running \`${commandName}\`.\n\`\`\`${error.message}\`\`\``
      )],
      allowedMentions: { repliedUser: false },
    }).catch(() => {});
  }
}
