const { EmbedBuilder } = require('discord.js');
const config = require('../config');

/**
 * Beautiful embed builder utility
 * All embeds share a consistent, gorgeous design language
 */
class EmbedBuilderPlus {
  /**
   * Create a beautiful default embed with footer and timestamp
   */
  static base(options = {}) {
    const embed = new EmbedBuilder()
      .setFooter({
        text: `Zike • Built by Arsh`,
        iconURL: options.footerIcon || undefined,
      })
      .setTimestamp();

    if (options.color) embed.setColor(options.color);
    else embed.setColor(config.colors.primary);

    return embed;
  }

  /**
   * Success embed - emerald green
   */
  static success(title, description, fields = []) {
    const embed = this.base({ color: config.colors.success })
      .setTitle(`${this.icon('success')} ${title}`)
      .setDescription(description);

    if (fields.length) embed.addFields(fields);
    return embed;
  }

  /**
   * Error embed - red
   */
  static error(title, description) {
    return this.base({ color: config.colors.danger })
      .setTitle(`${this.icon('error')} ${title}`)
      .setDescription(description);
  }

  /**
   * Warning embed - amber
   */
  static warning(title, description) {
    return this.base({ color: config.colors.warning })
      .setTitle(`${this.icon('warning')} ${title}`)
      .setDescription(description);
  }

  /**
   * Info embed - blue
   */
  static info(title, description, fields = []) {
    const embed = this.base({ color: config.colors.info })
      .setTitle(`${this.icon('info')} ${title}`)
      .setDescription(description);

    if (fields.length) embed.addFields(fields);
    return embed;
  }

  /**
   * Primary embed - purple
   */
  static primary(title, description, fields = []) {
    const embed = this.base({ color: config.colors.primary });
    if (title) embed.setTitle(title);
    if (description) embed.setDescription(description);
    if (fields.length) embed.addFields(fields);
    return embed;
  }

  /**
   * Loading embed
   */
  static loading(title = 'Processing', description = 'Please wait...') {
    return this.base({ color: config.colors.gold })
      .setTitle(`${this.icon('loading')} ${title}`)
      .setDescription(description);
  }

  /**
   * Owner-only embed - dark with crown
   */
  static owner(title, description) {
    return this.base({ color: config.colors.dark })
      .setTitle(`${this.icon('crown')} ${title}`)
      .setDescription(description);
  }

  /**
   * Premium/staff embed
   */
  static premium(title, description) {
    return this.base({ color: config.colors.gold })
      .setTitle(`${this.icon('diamond')} ${title}`)
      .setDescription(description);
  }

  /**
   * Get emoji - returns ASCII fallback if custom emoji not loaded
   */
  static icon(name) {
    const fallbacks = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
      loading: '⏳',
      owner: '👑',
      staff: '🛡️',
      online: '🟢',
      shield: '🛡️',
      crown: '👑',
      heart: '❤️',
      star: '⭐',
      diamond: '💎',
    };
    return fallbacks[name] || '•';
  }

  /**
   * Build a beautiful help menu
   */
  static help(title, description, categories) {
    const embed = this.base({ color: config.colors.primary })
      .setTitle(`✨ ${title}`)
      .setDescription(description);

    for (const cat of categories) {
      embed.addFields({
        name: `${cat.icon} ${cat.name}`,
        value: cat.value,
        inline: cat.inline || false,
      });
    }
    return embed;
  }

  /**
   * Build a command list embed
   */
  static commandList(category, commands) {
    const chunks = [];
    const chunkSize = 20;
    for (let i = 0; i < commands.length; i += chunkSize) {
      chunks.push(commands.slice(i, i + chunkSize));
    }

    return chunks.map((chunk, idx) => {
      const embed = this.base({ color: config.colors.primary })
        .setTitle(`✨ ${category} Commands${chunks.length > 1 ? ` (Page ${idx + 1}/${chunks.length})` : ''}`)
        .setDescription(`Use \`@Zike <command>\` to run any command.\nUse \`@Zike help <category>\` to see specific category commands.`);

      const commandText = chunk.map(c => {
        const usage = c.usage ? ` \`${c.usage}\`` : '';
        return `**${c.name}**${usage}\n${c.description}`;
      }).join('\n\n');

      embed.addFields({ name: '\u200B', value: commandText });
      return embed;
    });
  }
}

module.exports = EmbedBuilderPlus;
