const Embeds = require('../utils/Embeds');
const Helpers = require('../utils/Helpers');

// ============================================
// ADDITIONAL COMMANDS - Reaching 400+
// Includes: more fun, utility, social, info commands
// ============================================

const extraCommands = [
  // ============================================
  // MORE FUN COMMANDS
  // ============================================
  {
    name: 'bottle',
    description: 'Spin the bottle',
    category: 'fun',
    permission: 'everyone',
    async execute(client, message) {
      const members = await message.guild.members.fetch();
      const humans = members.filter(m => !m.user.bot && m.id !== message.author.id);
      if (humans.size === 0) return message.reply({ embeds: [Embeds.error('Error', 'No other members to spin!')], allowedMentions: { repliedUser: false } });
      const target = humans.random();
      return message.reply({ embeds: [Embeds.primary('🍾 Spin the Bottle', `The bottle points to... ${target}!`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'ratewaifu',
    description: 'Rate your waifu',
    category: 'fun',
    permission: 'everyone',
    usage: '@user',
    async execute(client, message, args) {
      const target = message.mentions.users.first() || message.author;
      const rate = Math.floor(Math.random() * 11);
      return message.reply({ embeds: [Embeds.primary('🌸 Waifu Rate', `${target.username} is a ${rate}/10 waifu!`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'penis',
    description: 'Measure size (joke)',
    category: 'fun',
    permission: 'everyone',
    usage: '[@user]',
    async execute(client, message, args) {
      const target = message.mentions.users.first() || message.author;
      const size = Math.floor(Math.random() * 12) + 1;
      return message.reply({ embeds: [Embeds.primary('📏 Size', `${target.username}'s size: 8${'='.repeat(size)}D`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'trash',
    description: 'Call someone trash',
    category: 'fun',
    permission: 'everyone',
    usage: '@user',
    async execute(client, message, args) {
      const target = message.mentions.users.first();
      if (!target) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike trash @user`')], allowedMentions: { repliedUser: false } });
      return message.reply({ embeds: [Embeds.primary('🗑️ Trash', `${target} is trash! 🗑️`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'love',
    description: 'Send love to someone',
    category: 'fun',
    permission: 'everyone',
    usage: '@user',
    async execute(client, message, args) {
      const target = message.mentions.users.first();
      if (!target) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike love @user`')], allowedMentions: { repliedUser: false } });
      return message.reply({ embeds: [Embeds.primary('❤️ Love', `${message.author} sends lots of love to ${target}! ❤️💕💖`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'punch',
    description: 'Punch a user',
    category: 'fun',
    permission: 'everyone',
    usage: '@user',
    async execute(client, message, args) {
      const target = message.mentions.users.first();
      if (!target) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike punch @user`')], allowedMentions: { repliedUser: false } });
      return message.reply({ embeds: [Embeds.primary('👊 Punch', `${message.author} punched ${target}! POW!`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'poke',
    description: 'Poke a user',
    category: 'fun',
    permission: 'everyone',
    usage: '@user',
    async execute(client, message, args) {
      const target = message.mentions.users.first();
      if (!target) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike poke @user`')], allowedMentions: { repliedUser: false } });
      return message.reply({ embeds: [Embeds.primary('👉 Poke', `${message.author} poked ${target}!`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'tickle',
    description: 'Tickle a user',
    category: 'fun',
    permission: 'everyone',
    usage: '@user',
    async execute(client, message, args) {
      const target = message.mentions.users.first();
      if (!target) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike tickle @user`')], allowedMentions: { repliedUser: false } });
      return message.reply({ embeds: [Embeds.primary('🤣 Tickle', `${message.author} tickled ${target}! Haha!`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'feed',
    description: 'Feed a user',
    category: 'fun',
    permission: 'everyone',
    usage: '@user',
    async execute(client, message, args) {
      const target = message.mentions.users.first();
      if (!target) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike feed @user`')], allowedMentions: { repliedUser: false } });
      return message.reply({ embeds: [Embeds.primary('🍴 Feed', `${message.author} fed ${target} some delicious food! 🍕`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'bite',
    description: 'Bite a user',
    category: 'fun',
    permission: 'everyone',
    usage: '@user',
    async execute(client, message, args) {
      const target = message.mentions.users.first();
      if (!target) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike bite @user`')], allowedMentions: { repliedUser: false } });
      return message.reply({ embeds: [Embeds.primary('🦷 Bite', `${message.author} bit ${target}! Ouch!`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'cry',
    description: 'Cry',
    category: 'fun',
    permission: 'everyone',
    async execute(client, message) {
      return message.reply({ embeds: [Embeds.primary('😢 Cry', `${message.author} is crying... 😭`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'laugh',
    description: 'Laugh',
    category: 'fun',
    permission: 'everyone',
    async execute(client, message) {
      return message.reply({ embeds: [Embeds.primary('😂 Laugh', `${message.author} is laughing out loud! 🤣`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'sleep',
    description: 'Go to sleep',
    category: 'fun',
    permission: 'everyone',
    async execute(client, message) {
      return message.reply({ embeds: [Embeds.primary('😴 Sleep', `${message.author} is going to sleep. Goodnight! 🌙`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'think',
    description: 'Thinking',
    category: 'fun',
    permission: 'everyone',
    async execute(client, message) {
      return message.reply({ embeds: [Embeds.primary('🤔 Think', `${message.author} is thinking... 🤔`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'smile',
    description: 'Smile',
    category: 'fun',
    permission: 'everyone',
    async execute(client, message) {
      return message.reply({ embeds: [Embeds.primary('😊 Smile', `${message.author} is smiling! 😄`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'wave',
    description: 'Wave at someone',
    category: 'fun',
    permission: 'everyone',
    usage: '[@user]',
    async execute(client, message, args) {
      const target = message.mentions.users.first();
      return message.reply({ embeds: [Embeds.primary('👋 Wave', `${message.author} waves${target ? ` at ${target}` : ''}! 👋`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'wink',
    description: 'Wink at someone',
    category: 'fun',
    permission: 'everyone',
    usage: '[@user]',
    async execute(client, message, args) {
      const target = message.mentions.users.first();
      return message.reply({ embeds: [Embeds.primary('😉 Wink', `${message.author} winks${target ? ` at ${target}` : ''}! 😉`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'shrug',
    description: 'Shrug',
    category: 'fun',
    permission: 'everyone',
    async execute(client, message) {
      return message.reply({ content: `${message.author} shrugs ¯\\_(ツ)_/¯`, allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'tableflip',
    description: 'Flip a table',
    category: 'fun',
    permission: 'everyone',
    async execute(client, message) {
      return message.reply({ content: `${message.author} (╯°□°)╯︵ ┻━┻`, allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'unflip',
    description: 'Unflip table',
    category: 'fun',
    permission: 'everyone',
    async execute(client, message) {
      return message.reply({ content: `${message.author} ┬─┬ ノ( ゜-゜ノ)`, allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'lenny',
    description: 'Lenny face',
    category: 'fun',
    permission: 'everyone',
    async execute(client, message) {
      return message.reply({ content: `${message.author} ( ͡° ͜ʖ ͡°)`, allowedMentions: { repliedUser: false } });
    },
  },

  // ============================================
  // MORE UTILITY COMMANDS
  // ============================================
  {
    name: 'ascii',
    description: 'Convert text to ASCII art',
    category: 'utility',
    permission: 'everyone',
    usage: '<text>',
    async execute(client, message, args) {
      const text = args.join(' ').toUpperCase();
      if (!text) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike ascii <text>`')], allowedMentions: { repliedUser: false } });
      const font = {
        A: ['  ▄▀█  ', ' █▀█  ', ' █▀▀  '], B: ['  █▀▄  ', '  █▀▄  ', '  ▀▀   '],
        C: ['  ▄▀▀  ', '  █    ', '  ▄▄▀  '], D: ['  █▀▄  ', '  █ █  ', '  █▄▀  '],
        E: ['  █▀▀  ', '  █▀   ', '  ▄▄▀  '], F: ['  █▀▀  ', '  █▀   ', '  █    '],
        G: ['  ▄▀▀  ', '  █ ▀█ ', '  ▄▄▀  '], H: ['  █ █  ', '  █▀█  ', '  █ █  '],
        I: ['  ▀█▀  ', '   █   ', '  ▄█▄  '], J: ['    █  ', '    █  ', '  ▀▀   '],
        K: ['  █ ▄  ', '  █▀▄  ', '  █ ▀  '], L: ['  █    ', '  █    ', '  ▄▄▀  '],
        M: ['  █▀▄▀█', '  █ ▀ █', '  █   █'], N: ['  █▀▄  ', '  █ █  ', '  █ ▀  '],
        O: ['  ▄▀▄  ', '  █ █  ', '  ▄▀▄  '], P: ['  █▀▄  ', '  █▀   ', '  █    '],
        Q: ['  ▄▀▄  ', '  █ █  ', '  ▀▀█▀'], R: ['  █▀▄  ', '  █▀▄  ', '  █ █  '],
        S: ['  ▄▀▀  ', '   ▀▄  ', '  ▀▀   '], T: ['  ▀█▀  ', '   █   ', '   █   '],
        U: ['  █ █  ', '  █ █  ', '  ▄▀▄  '], V: ['  █ █  ', '  █ █  ', '   ▀   '],
        W: ['  █   █', '  █ ▄ █', '  ▀▀▀▀▀'], X: ['  █ █  ', '   █   ', '  █ █  '],
        Y: ['  █ █  ', '   █   ', '   █   '], Z: ['  ▀▀█  ', '   █   ', '  █▀▀  '],
        ' ': ['       ', '       ', '       '],
      };
      let result = '';
      for (let row = 0; row < 3; row++) {
        for (const char of text) {
          result += font[char]?.[row] || '   ';
        }
        result += '\n';
      }
      return message.reply({ content: '```\n' + result + '\n```', allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'strawpoll',
    description: 'Create a quick strawpoll',
    category: 'utility',
    permission: 'everyone',
    usage: '<question>',
    async execute(client, message, args) {
      const question = args.join(' ');
      if (!question) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike strawpoll <question>`')], allowedMentions: { repliedUser: false } });
      const embed = Embeds.primary('📊 Strawpoll', question).setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() });
      const pollMsg = await message.channel.send({ embeds: [embed] });
      await pollMsg.react('👍');
      await pollMsg.react('👎');
      await pollMsg.react('🤷');
      return message.delete().catch(() => {});
    },
  },
  {
    name: 'reminderlist',
    description: 'List your active reminders',
    category: 'utility',
    permission: 'everyone',
    async execute(client, message) {
      const reminders = client.db.get(`reminders_${message.author.id}`) || [];
      if (reminders.length === 0) return message.reply({ embeds: [Embeds.info('No Reminders', 'You have no active reminders.')], allowedMentions: { repliedUser: false } });
      const list = reminders.map(r => `**${r.text}** — ${Helpers.discordTimestamp(r.expires)}`).join('\n');
      return message.reply({ embeds: [Embeds.info('Your Reminders', list)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'randomuser',
    description: 'Get a random user from the server',
    category: 'utility',
    permission: 'everyone',
    async execute(client, message) {
      const members = await message.guild.members.fetch();
      const humans = members.filter(m => !m.user.bot);
      const random = humans.random();
      return message.reply({ embeds: [Embeds.primary('🎲 Random User', `${random.user.tag} (${random.user.id})`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'pickrandom',
    description: 'Pick a random member from a role',
    category: 'utility',
    permission: 'everyone',
    usage: '@role',
    async execute(client, message, args) {
      const role = Helpers.resolveRole(message.guild, args[0]);
      if (!role) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike pickrandom @role`')], allowedMentions: { repliedUser: false } });
      const members = role.members;
      if (members.size === 0) return message.reply({ embeds: [Embeds.error('Empty', 'Role has no members.')], allowedMentions: { repliedUser: false } });
      const random = members.random();
      return message.reply({ embeds: [Embeds.primary('🎲 Random Member', `From ${role.name}: ${random.user.tag}`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'perms',
    description: 'View your permissions',
    category: 'utility',
    permission: 'everyone',
    usage: '[@user]',
    async execute(client, message, args) {
      const target = message.mentions.members.first() || message.member;
      const perms = target.permissions.toArray();
      return message.reply({ embeds: [Embeds.primary('Permissions', `${target.user.username}'s permissions`).addFields({ name: 'Permissions', value: perms.length ? perms.join(', ') : 'None' })], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'myperms',
    description: 'View Zike\'s permissions',
    category: 'utility',
    permission: 'everyone',
    async execute(client, message) {
      const me = message.guild.members.me;
      const perms = me.permissions.toArray();
      return message.reply({ embeds: [Embeds.primary('My Permissions', `Zike's permissions in this server`).addFields({ name: 'Permissions', value: perms.length ? perms.join(', ') : 'None' })], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'channelinfo',
    description: 'View channel info',
    category: 'utility',
    permission: 'everyone',
    usage: '[#channel]',
    async execute(client, message, args) {
      const channel = Helpers.resolveChannel(message.guild, args[0]) || message.channel;
      return message.reply({ embeds: [Embeds.info('Channel Info', '').addFields(
        { name: 'Name', value: channel.name, inline: true },
        { name: 'ID', value: channel.id, inline: true },
        { name: 'Type', value: channel.type.toString(), inline: true },
        { name: 'Created', value: Helpers.discordTimestamp(channel.createdAt), inline: true },
        { name: 'NSFW', value: channel.nsfw ? 'Yes' : 'No', inline: true },
        { name: 'Topic', value: Helpers.truncate(channel.topic || 'None', 100), inline: false },
      )], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'membercount',
    description: 'View member count',
    category: 'utility',
    permission: 'everyone',
    async execute(client, message) {
      const members = await message.guild.members.fetch();
      const humans = members.filter(m => !m.user.bot).size;
      const bots = members.filter(m => m.user.bot).size;
      return message.reply({ embeds: [Embeds.primary('Member Count', `Total: ${members.size}\nHumans: ${humans}\nBots: ${bots}`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'channeltopiclist',
    description: 'List all channel topics',
    category: 'utility',
    permission: 'everyone',
    async execute(client, message) {
      const channels = message.guild.channels.cache.filter(c => c.topic);
      if (channels.size === 0) return message.reply({ embeds: [Embeds.info('No Topics', 'No channels with topics.')], allowedMentions: { repliedUser: false } });
      const list = channels.map(c => `**#${c.name}**: ${Helpers.truncate(c.topic, 100)}`).join('\n');
      return message.reply({ embeds: [Embeds.info('Channel Topics', list)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'rolehierarchy',
    description: 'View role hierarchy',
    category: 'utility',
    permission: 'everyone',
    async execute(client, message) {
      const roles = message.guild.roles.cache.sort((a, b) => b.position - a.position);
      const list = roles.map(r => `${r.position}. ${r} (${r.members.size} members)`).join('\n');
      return message.reply({ embeds: [Embeds.info('Role Hierarchy', Helpers.truncate(list, 1024))], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'setnickname',
    description: 'Change your own nickname',
    category: 'utility',
    permission: 'everyone',
    usage: '<new nick>',
    async execute(client, message, args) {
      const nick = args.join(' ');
      try {
        await message.member.setNickname(nick || null);
        return message.reply({ embeds: [Embeds.success('Set', `Your nickname is now "${nick || 'reset'}".`)], allowedMentions: { repliedUser: false } });
      } catch (e) {
        return message.reply({ embeds: [Embeds.error('Error', 'Cannot change your nickname.')], allowedMentions: { repliedUser: false } });
      }
    },
  },

  // ============================================
  // MORE MODERATION COMMANDS
  // ============================================
  {
    name: 'muteall',
    description: 'Mute all non-staff in voice channel',
    category: 'moderation',
    permission: 'admin',
    usage: '[#voiceChannel]',
    async execute(client, message, args) {
      const channel = message.member.voice.channel;
      if (!channel) return message.reply({ embeds: [Embeds.error('Error', 'You must be in a voice channel.')], allowedMentions: { repliedUser: false } });
      let count = 0;
      for (const [, member] of channel.members) {
        if (!client.permissions.isStaff(member) && member.id !== message.author.id) {
          try { await member.voice.setMute(true, 'Mass mute'); count++; } catch {}
        }
      }
      return message.reply({ embeds: [Embeds.success('Muted', `Muted ${count} members.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'unmuteall',
    description: 'Unmute everyone in voice channel',
    category: 'moderation',
    permission: 'admin',
    async execute(client, message) {
      const channel = message.member.voice.channel;
      if (!channel) return message.reply({ embeds: [Embeds.error('Error', 'You must be in a voice channel.')], allowedMentions: { repliedUser: false } });
      let count = 0;
      for (const [, member] of channel.members) {
        try { await member.voice.setMute(false, 'Mass unmute'); count++; } catch {}
      }
      return message.reply({ embeds: [Embeds.success('Unmuted', `Unmuted ${count} members.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'deafenall',
    description: 'Deafen everyone in voice channel',
    category: 'moderation',
    permission: 'admin',
    async execute(client, message) {
      const channel = message.member.voice.channel;
      if (!channel) return message.reply({ embeds: [Embeds.error('Error', 'You must be in a voice channel.')], allowedMentions: { repliedUser: false } });
      let count = 0;
      for (const [, member] of channel.members) {
        if (!client.permissions.isStaff(member)) {
          try { await member.voice.setDeaf(true, 'Mass deafen'); count++; } catch {}
        }
      }
      return message.reply({ embeds: [Embeds.success('Deafened', `Deafened ${count} members.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'undeafenall',
    description: 'Undeafen everyone in voice channel',
    category: 'moderation',
    permission: 'admin',
    async execute(client, message) {
      const channel = message.member.voice.channel;
      if (!channel) return message.reply({ embeds: [Embeds.error('Error', 'You must be in a voice channel.')], allowedMentions: { repliedUser: false } });
      let count = 0;
      for (const [, member] of channel.members) {
        try { await member.voice.setDeaf(false, 'Mass undeafen'); count++; } catch {}
      }
      return message.reply({ embeds: [Embeds.success('Undeafened', `Undeafened ${count} members.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'clearallwarns',
    description: 'Clear all warnings in the server',
    category: 'moderation',
    permission: 'admin',
    async execute(client, message) {
      const keys = client.db.keys(`warns_${message.guild.id}_*`);
      for (const k of keys) client.db.delete(k);
      return message.reply({ embeds: [Embeds.success('Cleared', 'All warnings cleared.')], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'purgeembeds',
    description: 'Delete messages with embeds',
    category: 'moderation',
    permission: 'moderator',
    async execute(client, message, args) {
      const count = parseInt(args[0]) || 100;
      const messages = await message.channel.messages.fetch({ limit: 100 });
      const toDelete = messages.filter(m => m.embeds.length > 0).first(count);
      await message.channel.bulkDelete(toDelete);
      const msg = await message.channel.send({ embeds: [Embeds.success('Purged', `Deleted ${toDelete.length} embed messages.`)] });
      setTimeout(() => msg.delete().catch(() => {}), 5000);
    },
  },
  {
    name: 'purgementions',
    description: 'Delete messages with mentions',
    category: 'moderation',
    permission: 'moderator',
    async execute(client, message, args) {
      const count = parseInt(args[0]) || 100;
      const messages = await message.channel.messages.fetch({ limit: 100 });
      const toDelete = messages.filter(m => m.mentions.users.size > 0 || m.mentions.roles.size > 0 || m.mentions.everyone).first(count);
      await message.channel.bulkDelete(toDelete);
      const msg = await message.channel.send({ embeds: [Embeds.success('Purged', `Deleted ${toDelete.length} mention messages.`)] });
      setTimeout(() => msg.delete().catch(() => {}), 5000);
    },
  },

  // ============================================
  // MORE GAMES
  // ============================================
  {
    name: 'wordle',
    description: 'Simple wordle game',
    category: 'games',
    permission: 'everyone',
    async execute(client, message) {
      const words = ['apple', 'brain', 'chair', 'dance', 'eagle', 'flame', 'grape', 'heart', 'ivory', 'jelly', 'knife', 'lemon', 'mango', 'noble', 'ocean', 'piano', 'quiet', 'river', 'stone', 'table', 'ultra', 'voice', 'water', 'xenon', 'yacht', 'zebra'];
      const word = Helpers.random(words);
      await message.reply({ embeds: [Embeds.primary('🎯 Wordle', 'Guess the 5-letter word! You have 6 tries. Type your guess!')] });
      let tries = 6;
      const filter = m => m.author.id === message.author.id && m.content.length === 5 && /^[a-zA-Z]+$/.test(m.content);
      const collector = message.channel.createMessageCollector({ filter, time: 120000 });
      collector.on('collect', m => {
        const guess = m.content.toLowerCase();
        tries--;
        if (guess === word) {
          collector.stop();
          return message.channel.send({ embeds: [Embeds.success('🎉 Won!', `The word was: ${word}`)] });
        }
        const result = guess.split('').map((c, i) => {
          if (c === word[i]) return '🟩';
          if (word.includes(c)) return '🟨';
          return '⬛';
        }).join('');
        m.reply({ content: `${result}\n${tries} tries left` });
        if (tries <= 0) {
          collector.stop();
          return message.channel.send({ embeds: [Embeds.error('Game Over', `The word was: ${word}`)] });
        }
      });
    },
  },
  {
    name: 'connect4',
    description: 'Play Connect 4 (vs bot)',
    category: 'games',
    permission: 'everyone',
    async execute(client, message) {
      const cols = 7, rows = 6;
      const board = Array(rows).fill(null).map(() => Array(cols).fill('⚪'));
      let playerTurn = true;
      const render = () => board.map(r => r.join('')).join('\n') + '\n1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣';
      const msg = await message.reply({ embeds: [Embeds.primary('🔴 Connect 4', `${render()}\n\nYour turn! Type a column (1-7)`)] });
      const filter = m => m.author.id === message.author.id && /^[1-7]$/.test(m.content);
      const collector = message.channel.createMessageCollector({ filter, time: 60000 });

      const drop = (col, symbol) => {
        for (let r = rows - 1; r >= 0; r--) {
          if (board[r][col] === '⚪') { board[r][col] = symbol; return true; }
        }
        return false;
      };

      const checkWin = (symbol) => {
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            if (board[r][c] !== symbol) continue;
            if (c + 3 < cols && board[r][c+1] === symbol && board[r][c+2] === symbol && board[r][c+3] === symbol) return true;
            if (r + 3 < rows && board[r+1][c] === symbol && board[r+2][c] === symbol && board[r+3][c] === symbol) return true;
            if (r + 3 < rows && c + 3 < cols && board[r+1][c+1] === symbol && board[r+2][c+2] === symbol && board[r+3][c+3] === symbol) return true;
            if (r - 3 >= 0 && c + 3 < cols && board[r-1][c+1] === symbol && board[r-2][c+2] === symbol && board[r-3][c+3] === symbol) return true;
          }
        }
        return false;
      };

      collector.on('collect', m => {
        const col = parseInt(m.content) - 1;
        m.delete().catch(() => {});
        if (!drop(col, '🔴')) return message.channel.send('Column full!').then(r => setTimeout(() => r.delete(), 3000));
        if (checkWin('🔴')) {
          collector.stop();
          return msg.edit({ embeds: [Embeds.success('🎉 You Win!', render())] });
        }
        // Bot move
        let botCol;
        do { botCol = Math.floor(Math.random() * cols); } while (!drop(botCol, '🟡'));
        if (checkWin('🟡')) {
          collector.stop();
          return msg.edit({ embeds: [Embeds.error('🤖 Bot Wins!', render())] });
        }
        msg.edit({ embeds: [Embeds.primary('🔴 Connect 4', `${render()}\n\nYour turn! Type a column (1-7)`)] });
      });
    },
  },
  {
    name: 'memory',
    description: 'Memory match game (text)',
    category: 'games',
    permission: 'everyone',
    async execute(client, message) {
      const emojis = ['🐶', '🐱', '🦊', '🐻', '🐼', '🦁'];
      const pairs = [...emojis, ...emojis];
      const cards = Helpers.shuffle(pairs);
      const revealed = Array(12).fill(false);
      const display = () => cards.map((c, i) => revealed[i] ? c : '🃏').join(' ');
      await message.reply({ embeds: [Embeds.primary('🃏 Memory', `Cards: ${display()}\nGuess pairs! Type 2 positions (1-12)`)] });
      const filter = m => m.author.id === message.author.id;
      const collector = message.channel.createMessageCollector({ filter, time: 120000, max: 12 });
      let score = 0;
      collector.on('collect', m => {
        const [a, b] = m.content.split(' ').map(n => parseInt(n) - 1);
        if (isNaN(a) || isNaN(b) || a === b || a < 0 || a > 11 || b < 0 || b > 11) return;
        if (cards[a] === cards[b] && !revealed[a] && !revealed[b]) {
          revealed[a] = revealed[b] = true;
          score++;
          message.channel.send(`✅ Match! ${cards[a]} Score: ${score}`);
        } else {
          message.channel.send(`❌ No match! ${cards[a]} ≠ ${cards[b]}`);
        }
        if (revealed.every(r => r)) {
          collector.stop();
          return message.channel.send({ embeds: [Embeds.success('🎉 Done!', `You matched all pairs! Score: ${score}`)] });
        }
      });
    },
  },

  // ============================================
  // MORE UTILITY
  // ============================================
  {
    name: 'topmembers',
    description: 'Top members by join date',
    category: 'utility',
    permission: 'everyone',
    async execute(client, message) {
      const members = await message.guild.members.fetch();
      const oldest = members.filter(m => !m.user.bot).sort((a, b) => a.joinedAt - b.joinedAt).first(10);
      const list = oldest.map((m, i) => `**${i + 1}.** ${m.user.tag} — Joined ${Helpers.discordTimestamp(m.joinedAt)}`).join('\n');
      return message.reply({ embeds: [Embeds.primary('🏆 Top Members', 'Oldest members:').addFields({ name: '\u200B', value: list })], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'topgames',
    description: 'Show top game players',
    category: 'games',
    permission: 'everyone',
    async execute(client, message) {
      const keys = client.db.keys(`game_wins_${message.guild.id}_*`);
      const data = keys.map(k => ({ userId: k.replace(`game_wins_${message.guild.id}_`, ''), wins: client.db.get(k) || 0 })).sort((a, b) => b.wins - a.wins).slice(0, 10);
      if (data.length === 0) return message.reply({ embeds: [Embeds.info('No Data', 'No game data yet.')], allowedMentions: { repliedUser: false } });
      const list = data.map((d, i) => `${['🥇', '🥈', '🥉'][i] || `**${i + 1}.**`} <@${d.userId}> — ${d.wins} wins`).join('\n');
      return message.reply({ embeds: [Embeds.primary('🎮 Top Players', list)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'leveltop',
    description: 'Top members by level',
    category: 'leveling',
    permission: 'everyone',
    async execute(client, message) {
      const keys = client.db.keys(`xp_${message.guild.id}_*`);
      const data = keys.map(k => ({ userId: k.replace(`xp_${message.guild.id}_`, ''), xp: client.db.get(k) || 0 }))
        .sort((a, b) => b.xp - a.xp).slice(0, 10);
      if (data.length === 0) return message.reply({ embeds: [Embeds.info('No Data', 'No XP data yet.')], allowedMentions: { repliedUser: false } });
      const list = data.map((d, i) => `${['🥇', '🥈', '🥉'][i] || `**${i + 1}.**`} <@${d.userId}> — ${Math.floor(Math.sqrt(d.xp / 100))} (${d.xp} XP)`).join('\n');
      return message.reply({ embeds: [Embeds.primary('🏆 Top Levels', list)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'vote',
    description: 'Vote for Zike (demo)',
    category: 'utility',
    permission: 'everyone',
    async execute(client, message) {
      return message.reply({ embeds: [Embeds.primary('🗳️ Vote', 'Vote for Zike on top.gg!\n\n*This is a demo link.*\n\nhttps://top.gg/bot/' + client.user.id + '/vote')], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'info',
    description: 'Get info about anything (AI)',
    category: 'ai',
    permission: 'everyone',
    usage: '<topic>',
    async execute(client, message, args) {
      const topic = args.join(' ');
      if (!topic) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike info <topic>`')], allowedMentions: { repliedUser: false } });
      await message.channel.sendTyping();
      const response = await client.ai.quick(`Provide brief, factual info about: ${topic}`, 'You are Zike. Provide accurate, concise info.');
      return message.reply({ embeds: [Embeds.primary('ℹ️ Info', response || 'No info available.')], allowedMentions: { repliedUser: false } });
    },
  },
];

module.exports = extraCommands;
