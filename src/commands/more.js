const Embeds = require('../utils/Embeds');
const Helpers = require('../utils/Helpers');
const { ChannelType } = require('discord.js');

// ============================================
// ADDITIONAL COMMANDS - Pushing past 400+
// ============================================

const moreCommands = [
  // More social commands
  {
    name: 'cookie',
    description: 'Give someone a cookie',
    category: 'fun',
    permission: 'everyone',
    usage: '@user',
    async execute(client, message, args) {
      const target = message.mentions.users.first();
      if (!target) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike cookie @user`')], allowedMentions: { repliedUser: false } });
      return message.reply({ embeds: [Embeds.primary('🍪 Cookie', `${message.author} gave ${target} a cookie! 🍪`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'pizza',
    description: 'Order a pizza',
    category: 'fun',
    permission: 'everyone',
    async execute(client, message) {
      const toppings = ['pepperoni', 'cheese', 'mushroom', 'sausage', 'pineapple', 'bbq chicken', 'veggie'];
      return message.reply({ embeds: [Embeds.primary('🍕 Pizza', `Ordered a ${Helpers.random(toppings)} pizza for ${message.author}!`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'coffee',
    description: 'Get a coffee',
    category: 'fun',
    permission: 'everyone',
    async execute(client, message) {
      return message.reply({ embeds: [Embeds.primary('☕ Coffee', `${message.author} enjoys a hot cup of coffee! ☕`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'beer',
    description: 'Get a beer (virtual)',
    category: 'fun',
    permission: 'everyone',
    async execute(client, message) {
      return message.reply({ embeds: [Embeds.primary('🍺 Beer', `${message.author} enjoys a cold one! 🍻`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'magic',
    description: 'Cast a magic spell',
    category: 'fun',
    permission: 'everyone',
    usage: '@user',
    async execute(client, message, args) {
      const target = message.mentions.users.first() || message.author;
      const spells = ['🔥 Fireball!', '❄️ Ice Storm!', '⚡ Lightning!', '🌙 Magic Missile!', '✨ Heal!', '💀 Death Touch!', '🌟 Holy Light!'];
      return message.reply({ embeds: [Embeds.primary('🪄 Magic', `${message.author} casts ${Helpers.random(spells)} on ${target}!`)], allowedMentions: { repliedUser: false } });
    },
  },

  // More utility
  {
    name: 'charcount',
    description: 'Count characters in text',
    category: 'utility',
    permission: 'everyone',
    usage: '<text>',
    async execute(client, message, args) {
      const text = args.join(' ');
      if (!text) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike charcount <text>`')], allowedMentions: { repliedUser: false } });
      return message.reply({ embeds: [Embeds.primary('📝 Character Count', `Characters: ${text.length}\nWords: ${text.split(/\s+/).length}\nLines: ${text.split('\n').length}`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'reverseword',
    description: 'Reverse each word',
    category: 'utility',
    permission: 'everyone',
    usage: '<text>',
    async execute(client, message, args) {
      const text = args.join(' ');
      if (!text) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike reverseword <text>`')], allowedMentions: { repliedUser: false } });
      return message.reply({ content: text.split(' ').map(w => w.split('').reverse().join('')).join(' '), allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'uppercase',
    description: 'Convert text to uppercase',
    category: 'utility',
    permission: 'everyone',
    usage: '<text>',
    async execute(client, message, args) {
      const text = args.join(' ');
      if (!text) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike uppercase <text>`')], allowedMentions: { repliedUser: false } });
      return message.reply({ content: text.toUpperCase(), allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'lowercase',
    description: 'Convert text to lowercase',
    category: 'utility',
    permission: 'everyone',
    usage: '<text>',
    async execute(client, message, args) {
      const text = args.join(' ');
      if (!text) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike lowercase <text>`')], allowedMentions: { repliedUser: false } });
      return message.reply({ content: text.toLowerCase(), allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'leet',
    description: 'Convert text to leet speak',
    category: 'utility',
    permission: 'everyone',
    usage: '<text>',
    async execute(client, message, args) {
      const text = args.join(' ');
      if (!text) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike leet <text>`')], allowedMentions: { repliedUser: false } });
      const leet = text.replace(/[aeiou]/gi, c => ({a:'4',e:'3',i:'1',o:'0',u:'u'}[c.toLowerCase()] || c));
      return message.reply({ content: leet, allowedMentions: { repliedUser: false } });
    },
  },

  // More moderation
  {
    name: 'warnall',
    description: 'Warn all members with a specific role',
    category: 'moderation',
    permission: 'admin',
    usage: '@role <reason>',
    async execute(client, message, args) {
      const role = Helpers.resolveRole(message.guild, args[0]);
      const reason = args.slice(1).join(' ') || 'Mass warning';
      if (!role) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike warnall @role <reason>`')], allowedMentions: { repliedUser: false } });
      const members = role.members;
      for (const [, member] of members) {
        const warns = client.db.get(`warns_${message.guild.id}_${member.id}`) || [];
        warns.push({ id: Helpers.generateId(8), reason: `Mass warn: ${reason}`, moderator: message.author.id, timestamp: Date.now() });
        client.db.set(`warns_${message.guild.id}_${member.id}`, warns);
      }
      return message.reply({ embeds: [Embeds.success('Warned', `Warned ${members.size} members with ${role.name}.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'purgeuserall',
    description: 'Delete all messages from a user across channels',
    category: 'moderation',
    permission: 'admin',
    usage: '@user',
    async execute(client, message, args) {
      const target = await Helpers.resolveMember(message.guild, args[0]);
      if (!target) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike purgeuserall @user`')], allowedMentions: { repliedUser: false } });
      const channels = message.guild.channels.cache.filter(c => c.type === ChannelType.GuildText);
      let total = 0;
      for (const [, channel] of channels) {
        try {
          const messages = await channel.messages.fetch({ limit: 100 });
          const toDelete = messages.filter(m => m.author.id === target.id);
          if (toDelete.size > 0) {
            await channel.bulkDelete(toDelete).catch(() => {});
            total += toDelete.size;
          }
        } catch {}
      }
      return message.reply({ embeds: [Embeds.success('Purged', `Deleted ${total} messages from ${target.user.tag}.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'slowmodeall',
    description: 'Set slowmode on all text channels',
    category: 'moderation',
    permission: 'admin',
    usage: '<seconds>',
    async execute(client, message, args) {
      const seconds = parseInt(args[0]);
      if (isNaN(seconds)) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike slowmodeall <seconds>`')], allowedMentions: { repliedUser: false } });
      const channels = message.guild.channels.cache.filter(c => c.type === ChannelType.GuildText);
      let count = 0;
      for (const [, channel] of channels) {
        try { await channel.setRateLimitPerUser(seconds); count++; } catch {}
      }
      return message.reply({ embeds: [Embeds.success('Set', `Slowmode ${seconds}s on ${count} channels.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'resetslowmode',
    description: 'Reset slowmode on all channels',
    category: 'moderation',
    permission: 'admin',
    async execute(client, message) {
      const channels = message.guild.channels.cache.filter(c => c.type === ChannelType.GuildText);
      let count = 0;
      for (const [, channel] of channels) {
        try { await channel.setRateLimitPerUser(0); count++; } catch {}
      }
      return message.reply({ embeds: [Embeds.success('Reset', `Reset slowmode on ${count} channels.`)], allowedMentions: { repliedUser: false } });
    },
  },

  // More fun/social
  {
    name: 'catfact',
    description: 'Get a cat fact',
    category: 'fun',
    permission: 'everyone',
    async execute(client, message) {
      const facts = [
        'Cats sleep 70% of their lives.',
        'A group of cats is called a clowder.',
        'Cats have 32 muscles in each ear.',
        'A cat can jump up to 6 times its height.',
        'Cats cannot taste sweetness.',
        'A cat\'s nose print is unique, like a fingerprint.',
        'Cats make over 100 different sounds.',
      ];
      return message.reply({ embeds: [Embeds.primary('🐱 Cat Fact', Helpers.random(facts))], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'dogfact',
    description: 'Get a dog fact',
    category: 'fun',
    permission: 'everyone',
    async execute(client, message) {
      const facts = [
        'Dogs have 3 eyelids.',
        'A dog\'s sense of smell is 40x stronger than humans.',
        'Dogs can learn over 1000 words.',
        'Puppies have 28 teeth, adults have 42.',
        'Dogs sweat through their paws.',
        'A dog\'s nose print is unique.',
        'Dogs dream just like humans.',
      ];
      return message.reply({ embeds: [Embeds.primary('🐶 Dog Fact', Helpers.random(facts))], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'uselessfact',
    description: 'Get a useless fact',
    category: 'fun',
    permission: 'everyone',
    async execute(client, message) {
      const facts = [
        'A single cloud can weigh over a million pounds.',
        'Octopuses have three hearts.',
        'A shrimp\'s heart is in its head.',
        'Wombat poop is cube-shaped.',
        'A group of crows is called a murder.',
        'Honey never spoils.',
        'Bananas are berries but strawberries aren\'t.',
      ];
      return message.reply({ embeds: [Embeds.primary('🤷 Useless Fact', Helpers.random(facts))], allowedMentions: { repliedUser: false } });
    },
  },

  // More AI
  {
    name: 'aisong',
    description: 'Generate song lyrics',
    category: 'ai',
    permission: 'everyone',
    usage: '<topic>',
    async execute(client, message, args) {
      const topic = args.join(' ');
      if (!topic) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike aisong <topic>`')], allowedMentions: { repliedUser: false } });
      await message.channel.sendTyping();
      const response = await client.ai.quick(`Write song lyrics about: ${topic}`, 'You are Zike. Write original, catchy song lyrics with verses and chorus.');
      return message.reply({ embeds: [Embeds.primary('🎵 AI Song', response || 'No lyrics generated.')], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'airecipe',
    description: 'Generate a recipe',
    category: 'ai',
    permission: 'everyone',
    usage: '<dish>',
    async execute(client, message, args) {
      const dish = args.join(' ');
      if (!dish) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike airecipe <dish>`')], allowedMentions: { repliedUser: false } });
      await message.channel.sendTyping();
      const response = await client.ai.quick(`Recipe for ${dish}. Include ingredients list and step-by-step instructions.`, 'You are Zike. Provide clear recipes.');
      return message.reply({ embeds: [Embeds.primary('🍳 AI Recipe', response || 'No recipe generated.')], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'aihaiku',
    description: 'Generate a haiku',
    category: 'ai',
    permission: 'everyone',
    usage: '<topic>',
    async execute(client, message, args) {
      const topic = args.join(' ');
      if (!topic) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike aihaiku <topic>`')], allowedMentions: { repliedUser: false } });
      await message.channel.sendTyping();
      const response = await client.ai.quick(`Write a haiku about ${topic}. (5-7-5 syllables)`, 'You are Zike. Write beautiful haikus. Format on 3 lines.');
      return message.reply({ embeds: [Embeds.primary('🌸 Haiku', response || 'No haiku generated.')], allowedMentions: { repliedUser: false } });
    },
  },
];

module.exports = moreCommands;
