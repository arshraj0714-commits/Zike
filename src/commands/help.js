const Embeds = require('../utils/Embeds');
const Helpers = require('../utils/Helpers');
const config = require('../config');

// ============================================
// HELP COMMAND - Shows all categories & commands
// ============================================
module.exports = {
  name: 'help',
  description: 'Shows all commands and categories',
  category: 'help',
  permission: 'everyone',
  aliases: ['h', 'commands', 'cmds', 'menu'],
  async execute(client, message, args) {
    // If no args - show main help menu
    if (!args.length) {
      return showMainMenu(client, message);
    }

    const query = args[0].toLowerCase();

    // If category - show category commands
    if (client.commandHandler.categories.has(query)) {
      return showCategory(client, message, query);
    }

    // If command - show command help
    const command = client.commandHandler.get(query);
    if (command) {
      return showCommandHelp(client, message, command);
    }

    return message.reply({
      embeds: [Embeds.error('Not Found', `No category or command found for \`${query}\`. Use \`@Zike help\` to see all categories.`)],
      allowedMentions: { repliedUser: false },
    });
  },
};

async function showMainMenu(client, message) {
  const stats = client.commandHandler.getCategoryStats();
  const isOwner = client.permissions.isOwner(message.author.id);
  const isStaff = client.permissions.isStaff(message.member);

  const embed = Embeds.base({ color: config.colors.primary })
    .setTitle('✨ Zike — All-in-One Discord Bot')
    .setDescription(
      `Hey ${message.author}! I'm **Zike**, a crazy AI-powered all-in-one Discord bot built by **Arsh** (escapingdum).\n\n` +
      `I have **${client.commandHandler.getAll().length}+ commands** across ${client.commandHandler.categories.size} categories. ` +
      `To use any command, just ping me with the command name!\n\n` +
      `**Usage:** \`@Zike <command>\` — example: \`@Zike ban @user\`\n` +
      `**Browse:** \`@Zike help <category>\` — example: \`@Zike help moderation\`\n\n` +
      `Want to just chat with me? **Ping me with anything that isn't a command!**`
    )
    .setThumbnail(client.user.displayAvatarURL({ size: 256, extension: 'png' }));

  // Category info with icons and counts
  const categoryInfo = {
    moderation: { icon: '🔨', name: 'Moderation', desc: 'Ban, kick, mute, warn, purge & more' },
    security: { icon: '🛡️', name: 'Security', desc: 'Anti-nuke, anti-raid, lockdown & more' },
    ticket: { icon: '🎫', name: 'Tickets', desc: 'Ticket system & support' },
    invite: { icon: '📨', name: 'Invites', desc: 'Track invites & rewards' },
    verification: { icon: '✅', name: 'Verification', desc: 'Verify new members' },
    server: { icon: '⚙️', name: 'Server', desc: 'Server management tools' },
    games: { icon: '🎮', name: 'Games', desc: '50+ fun games to play' },
    economy: { icon: '💰', name: 'Economy', desc: 'Coins, shop, gambling & more' },
    leveling: { icon: '📊', name: 'Leveling', desc: 'XP, levels & rewards' },
    rewards: { icon: '🎁', name: 'Rewards', desc: 'Daily rewards & bonuses' },
    fun: { icon: '🎉', name: 'Fun', desc: 'Memes, jokes & entertainment' },
    utility: { icon: '🛠️', name: 'Utility', desc: 'Useful tools & info' },
    ai: { icon: '🤖', name: 'AI', desc: 'AI-powered features' },
    music: { icon: '🎵', name: 'Music', desc: 'Music player controls' },
    welcome: { icon: '👋', name: 'Welcome', desc: 'Welcome/goodbye system' },
    logging: { icon: '📝', name: 'Logging', desc: 'Server logging setup' },
    owner: { icon: '👑', name: 'Owner', desc: 'Owner-only commands' },
  };

  const categories = Object.keys(categoryInfo).filter(c => client.commandHandler.categories.has(c));
  let fieldValue = '';
  for (const cat of categories) {
    const info = categoryInfo[cat];
    const count = stats[cat] || 0;
    fieldValue += `${info.icon} **${info.name}** — ${info.desc} *(${count} cmds)*\n`;
  }

  // Add other categories not in our list
  for (const cat of client.commandHandler.categories.keys()) {
    if (!categoryInfo[cat]) {
      fieldValue += `📁 **${Helpers.capitalize(cat)}** *(${stats[cat] || 0} cmds)*\n`;
    }
  }

  embed.addFields({
    name: '📂 Categories',
    value: fieldValue || 'No categories available',
  });

  // Permission info
  let permInfo = '';
  if (isOwner) {
    permInfo = '👑 **You are the Bot Owner** — you can use ALL commands.';
  } else if (isStaff) {
    permInfo = '🛡️ **You are Staff** — you can use most commands.';
  } else {
    permInfo = '👤 **You are a Member** — you can use basic commands. Ask Arsh for staff role.';
  }
  embed.addFields({ name: 'Your Permissions', value: permInfo });

  embed.addFields({
    name: '🔗 Quick Links',
    value: `• \`@Zike help <category>\` — Browse a category\n• \`@Zike help <command>\` — Command details\n• \`@Zike about\` — About Zike\n• \`@Zike ping\` — Check latency`,
  });

  return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
}

async function showCategory(client, message, category) {
  const commands = client.commandHandler.getByCategory(category);
  const categoryNames = {
    moderation: 'Moderation', security: 'Security', ticket: 'Tickets', invite: 'Invites',
    verification: 'Verification', server: 'Server Management', games: 'Games',
    economy: 'Economy', leveling: 'Leveling', rewards: 'Rewards', fun: 'Fun',
    utility: 'Utility', ai: 'AI', music: 'Music', welcome: 'Welcome System',
    logging: 'Logging', owner: 'Owner Only',
  };

  const categoryName = categoryNames[category] || Helpers.capitalize(category);
  const pages = Helpers.paginate(commands, 15);
  let pageIdx = 0;

  const generateEmbed = (idx) => {
    const page = pages[idx];
    const embed = Embeds.base({ color: config.colors.primary })
      .setTitle(`✨ ${categoryName} Commands`)
      .setDescription(
        `**${commands.length} commands** in this category.\n\n` +
        `Use \`@Zike <command>\` to run any command.\n` +
        `Page ${idx + 1} of ${pages.length}.`
      )
      .setThumbnail(client.user.displayAvatarURL({ size: 256, extension: 'png' }));

    const fields = page.map(cmd => {
      const permIcon = cmd.permission === 'owner' ? '👑' :
                      cmd.permission === 'staff' ? '🛡️' :
                      cmd.permission === 'admin' ? '⚡' :
                      cmd.permission === 'moderator' ? '🔨' : '👤';
      const usage = cmd.usage ? ` \`${cmd.usage}\`` : '';
      const aliases = cmd.aliases ? ` *(aliases: ${cmd.aliases.join(', ')})*` : '';
      return {
        name: `${permIcon} ${cmd.name}${usage}`,
        value: `${cmd.description || 'No description'}${aliases}`,
        inline: false,
      };
    });

    embed.addFields(fields);
    embed.setFooter({ text: `Zike • Built by Arsh • Page ${idx + 1}/${pages.length}` });
    return embed;
  };

  if (pages.length === 1) {
    return message.reply({ embeds: [generateEmbed(0)], allowedMentions: { repliedUser: false } });
  }

  // Multi-page with reactions
  const msg = await message.reply({ embeds: [generateEmbed(0)], allowedMentions: { repliedUser: false } });
  const emojis = ['⏮️', '◀️', '▶️', '⏭️', '❌'];
  for (const e of emojis) await msg.react(e).catch(() => {});

  const filter = (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id;
  const collector = msg.createReactionCollector({ filter, time: 120000 });

  collector.on('collect', async (reaction, user) => {
    await reaction.users.remove(user).catch(() => {});
    switch (reaction.emoji.name) {
      case '⏮️': pageIdx = 0; break;
      case '◀️': pageIdx = Math.max(0, pageIdx - 1); break;
      case '▶️': pageIdx = Math.min(pages.length - 1, pageIdx + 1); break;
      case '⏭️': pageIdx = pages.length - 1; break;
      case '❌': collector.stop(); return msg.reactions.removeAll().catch(() => {});
    }
    await msg.edit({ embeds: [generateEmbed(pageIdx)] }).catch(() => {});
  });

  collector.on('end', () => {
    msg.reactions.removeAll().catch(() => {});
  });
}

async function showCommandHelp(client, message, command) {
  const permNames = {
    owner: '👑 Owner Only',
    staff: '🛡️ Staff Only',
    admin: '⚡ Administrator',
    moderator: '🔨 Moderator',
    everyone: '👤 Everyone',
  };

  const embed = Embeds.base({ color: config.colors.primary })
    .setTitle(`📖 Command: ${command.name}`)
    .setDescription(command.description || 'No description available.')
    .addFields(
      { name: 'Category', value: Helpers.capitalize(command.category || 'utility'), inline: true },
      { name: 'Permission', value: permNames[command.permission] || '👤 Everyone', inline: true },
      { name: 'Usage', value: `\`@Zike ${command.name}${command.usage ? ' ' + command.usage : ''}\``, inline: false },
    );

  if (command.aliases && command.aliases.length) {
    embed.addFields({ name: 'Aliases', value: command.aliases.map(a => `\`${a}\``).join(', '), inline: false });
  }

  if (command.examples && command.examples.length) {
    embed.addFields({ name: 'Examples', value: command.examples.map(e => `\`@Zike ${e}\``).join('\n'), inline: false });
  }

  return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
}
