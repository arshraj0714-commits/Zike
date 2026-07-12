const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../config');

/**
 * Helper utilities for the bot
 */
class Helpers {
  /**
   * Parse duration strings like "1h", "30m", "2d" into milliseconds
   */
  static parseDuration(str) {
    if (!str) return null;
    const match = str.match(/^(\d+)(s|m|h|d|w|y)$/i);
    if (!match) return null;
    const num = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000, w: 604800000, y: 31536000000 };
    return num * multipliers[unit];
  }

  /**
   * Format milliseconds to human-readable string
   */
  static formatDuration(ms) {
    if (ms === 0) return '0 seconds';
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / 60000) % 60);
    const hours = Math.floor((ms / 3600000) % 24);
    const days = Math.floor(ms / 86400000);

    const parts = [];
    if (days) parts.push(`${days}d`);
    if (hours) parts.push(`${hours}h`);
    if (minutes) parts.push(`${minutes}m`);
    if (seconds) parts.push(`${seconds}s`);
    return parts.join(' ');
  }

  /**
   * Format a date nicely
   */
  static formatDate(date) {
    if (!date) return 'Unknown';
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  /**
   * Format relative time (Discord timestamp)
   */
  static discordTimestamp(date, style = 'R') {
    const d = date instanceof Date ? date : new Date(date);
    return `<t:${Math.floor(d.getTime() / 1000)}:${style}>`;
  }

  /**
   * Get user from mention or ID
   */
  static async resolveUser(client, query) {
    if (!query) return null;
    // Mention
    const mentionMatch = query.match(/^<@!?(\d+)>$/);
    if (mentionMatch) {
      try {
        return await client.users.fetch(mentionMatch[1]);
      } catch { return null; }
    }
    // ID
    if (/^\d+$/.test(query)) {
      try {
        return await client.users.fetch(query);
      } catch { return null; }
    }
    // Username
    try {
      return await client.users.fetch(query, { force: false });
    } catch { return null; }
  }

  /**
   * Get member from mention, ID, or username
   */
  static async resolveMember(guild, query) {
    if (!query) return null;
    const mentionMatch = query.match(/^<@!?(\d+)>$/);
    if (mentionMatch) {
      try {
        return await guild.members.fetch(mentionMatch[1]);
      } catch { return null; }
    }
    if (/^\d+$/.test(query)) {
      try {
        return await guild.members.fetch(query);
      } catch { return null; }
    }
    // Try username
    const member = guild.members.cache.find(m =>
      m.user.username.toLowerCase() === query.toLowerCase() ||
      m.displayName?.toLowerCase() === query.toLowerCase()
    );
    return member || null;
  }

  /**
   * Get channel from mention or ID
   */
  static resolveChannel(guild, query) {
    if (!query) return null;
    const mentionMatch = query.match(/^<#(\d+)>$/);
    if (mentionMatch) {
      return guild.channels.cache.get(mentionMatch[1]);
    }
    return guild.channels.cache.get(query) ||
      guild.channels.cache.find(c => c.name.toLowerCase() === query.toLowerCase());
  }

  /**
   * Get role from mention or ID
   */
  static resolveRole(guild, query) {
    if (!query) return null;
    const mentionMatch = query.match(/^<@&(\d+)>$/);
    if (mentionMatch) {
      return guild.roles.cache.get(mentionMatch[1]);
    }
    return guild.roles.cache.get(query) ||
      guild.roles.cache.find(r => r.name.toLowerCase() === query.toLowerCase());
  }

  /**
   * Paginate an array
   */
  static paginate(array, pageSize = 10) {
    const pages = [];
    for (let i = 0; i < array.length; i += pageSize) {
      pages.push(array.slice(i, i + pageSize));
    }
    return pages;
  }

  /**
   * Generate a random ID
   */
  static generateId(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Shuffle an array
   */
  static shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /**
   * Random item from array
   */
  static random(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Capitalize first letter
   */
  static capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Truncate text
   */
  static truncate(text, max = 100) {
    if (!text) return '';
    if (text.length <= max) return text;
    return text.substring(0, max - 3) + '...';
  }

  /**
   * Format numbers with commas
   */
  static formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  /**
   * Get ordinal suffix for a number (1st, 2nd, 3rd, 4th)
   */
  static ordinal(n) {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  /**
   * Create confirmation buttons
   */
  static confirmButtons(idPrefix = 'confirm') {
    return new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`${idPrefix}_yes`)
        .setLabel('Confirm')
        .setStyle(ButtonStyle.Success)
        .setEmoji('✅'),
      new ButtonBuilder()
        .setCustomId(`${idPrefix}_no`)
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('❌')
    );
  }

  /**
   * Create pagination buttons
   */
  static paginationButtons(current, total) {
    return new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('page_first')
        .setLabel('<<')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(current === 0),
      new ButtonBuilder()
        .setCustomId('page_prev')
        .setLabel('<')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(current === 0),
      new ButtonBuilder()
        .setCustomId('page_next')
        .setLabel('>')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(current === total - 1),
      new ButtonBuilder()
        .setCustomId('page_last')
        .setLabel('>>')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(current === total - 1)
    );
  }

  /**
   * Calculate account age in days
   */
  static accountAge(user) {
    const created = new Date(user.id / 4194304 + 1420070400000);
    return Math.floor((Date.now() - created.getTime()) / 86400000);
  }

  /**
   * Check if a string is a valid URL
   */
  static isURL(str) {
    try {
      new URL(str);
      return true;
    } catch { return false; }
  }

  /**
   * Escape markdown
   */
  static escapeMarkdown(text) {
    if (!text) return '';
    return text.replace(/[\\`*{}[\]()#+\-.!|_>]/g, '\\$&');
  }

  /**
   * Chunk text into multiple fields
   */
  static chunkText(text, size = 1024) {
    const chunks = [];
    for (let i = 0; i < text.length; i += size) {
      chunks.push(text.substring(i, i + size));
    }
    return chunks;
  }

  /**
   * Wait for ms
   */
  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get guild icon URL with fallback
   */
  static guildIconURL(guild, size = 1024) {
    return guild.iconURL({ size, extension: 'png' }) ||
      `https://cdn.discordapp.com/embed/avatars/${parseInt(guild.id) % 5}.png`;
  }
}

module.exports = Helpers;
