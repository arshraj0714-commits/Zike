const Embeds = require('../utils/Embeds');
const Helpers = require('../utils/Helpers');

// ============================================
// FUN COMMANDS (30+ commands)
// ============================================

const funCommands = [
  {
    name: 'avatar',
    description: 'View a user\'s avatar',
    category: 'fun',
    permission: 'everyone',
    usage: '[@user]',
    aliases: ['av', 'pfp', 'icon'],
    async execute(client, message, args) {
      const target = message.mentions.users.first() || message.author;
      const avatar = target.displayAvatarURL({ size: 1024, extension: 'png' });
      return message.reply({ embeds: [Embeds.primary(`${target.username}'s Avatar`, '').setImage(avatar)] });
    },
  },
  {
    name: 'banner',
    description: 'View a user\'s banner',
    category: 'fun',
    permission: 'everyone',
    usage: '[@user]',
    async execute(client, message, args) {
      const target = message.mentions.users.first() || message.author;
      const user = await client.users.fetch(target.id, { force: true });
      if (!user.banner) return message.reply({ embeds: [Embeds.info('No Banner', `${user.username} has no banner.`)], allowedMentions: { repliedUser: false } });
      return message.reply({ embeds: [Embeds.primary(`${user.username}'s Banner`, '').setImage(user.bannerURL({ size: 1024, extension: 'png' }))] });
    },
  },
  {
    name: 'ship',
    description: 'Ship two users',
    category: 'fun',
    permission: 'everyone',
    usage: '@user1 @user2',
    async execute(client, message, args) {
      const user1 = message.mentions.users.first() || message.author;
      const user2 = message.mentions.users.last() || message.author;
      const percentage = Math.floor(Math.random() * 100) + 1;
      let emoji;
      if (percentage >= 80) emoji = '💞';
      else if (percentage >= 60) emoji = '💖';
      else if (percentage >= 40) emoji = '💕';
      else if (percentage >= 20) emoji = '💔';
      else emoji = '🖤';
      const shipName = user1.username.slice(0, Math.ceil(user1.username.length / 2)) + user2.username.slice(Math.floor(user2.username.length / 2));
      return message.reply({ embeds: [Embeds.primary('💕 Ship', `${emoji} **${user1.username}** x **${user2.username}**\n\nShip name: **${shipName}**\nLove: **${percentage}%**`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'gayrate',
    description: 'How gay is a user?',
    category: 'fun',
    permission: 'everyone',
    usage: '[@user]',
    async execute(client, message, args) {
      const target = message.mentions.users.first() || message.author;
      const rate = Math.floor(Math.random() * 101);
      return message.reply({ embeds: [Embeds.primary('🌈 Gay Rate', `${target.username} is **${rate}%** gay 🏳️‍🌈`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'simprate',
    description: 'How much of a simp is a user?',
    category: 'fun',
    permission: 'everyone',
    usage: '[@user]',
    async execute(client, message, args) {
      const target = message.mentions.users.first() || message.author;
      const rate = Math.floor(Math.random() * 101);
      return message.reply({ embeds: [Embeds.primary('😏 Simp Rate', `${target.username} is **${rate}%** simp 💕`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'smart',
    description: 'How smart is a user?',
    category: 'fun',
    permission: 'everyone',
    usage: '[@user]',
    async execute(client, message, args) {
      const target = message.mentions.users.first() || message.author;
      const rate = Math.floor(Math.random() * 101);
      return message.reply({ embeds: [Embeds.primary('🧠 Smart Rate', `${target.username} is **${rate}%** smart 🧠`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'stankrate',
    description: 'How stinky is a user?',
    category: 'fun',
    permission: 'everyone',
    usage: '[@user]',
    async execute(client, message, args) {
      const target = message.mentions.users.first() || message.author;
      const rate = Math.floor(Math.random() * 101);
      return message.reply({ embeds: [Embeds.primary('🤢 Stank Rate', `${target.username} is **${rate}%** stinky 💩`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'howhot',
    description: 'How hot is a user?',
    category: 'fun',
    permission: 'everyone',
    usage: '[@user]',
    async execute(client, message, args) {
      const target = message.mentions.users.first() || message.author;
      const rate = Math.floor(Math.random() * 101);
      let emoji = rate > 80 ? '🔥' : rate > 50 ? '😍' : rate > 30 ? '😊' : '🥶';
      return message.reply({ embeds: [Embeds.primary('🌡️ Hot Rate', `${target.username} is **${rate}%** hot ${emoji}`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: '8balllove',
    description: 'Magic 8-ball for love questions',
    category: 'fun',
    permission: 'everyone',
    usage: '<question>',
    async execute(client, message, args) {
      const q = args.join(' ');
      if (!q) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike 8balllove <question>`')], allowedMentions: { repliedUser: false } });
      const answers = ['💕 Absolutely!', '💔 Never.', '🌹 Maybe...', '😍 Yes!', '😔 Doubtful.', '🤔 Hard to say.'];
      return message.reply({ embeds: [Embeds.primary('❤️ Love 8-Ball', `Q: ${q}\nA: ${Helpers.random(answers)}`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'roast',
    description: 'Roast a user',
    category: 'fun',
    permission: 'everyone',
    usage: '@user',
    async execute(client, message, args) {
      const target = message.mentions.users.first();
      if (!target) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike roast @user`')], allowedMentions: { repliedUser: false } });
      const roasts = [
        `${target}, you're as useful as a screen door on a submarine.`,
        `${target}, I'd agree with you but then we'd both be wrong.`,
        `${target}, you bring everyone so much joy when you leave the room.`,
        `${target}, you're the reason the gene pool needs a lifeguard.`,
        `${target}, if I threw a stick, you'd fetch it.`,
        `${target}, you're not stupid, you just have bad luck thinking.`,
        `${target}, I'm jealous of people who don't know you.`,
        `${target}, you're like a cloud. When you disappear, it's a beautiful day.`,
      ];
      return message.reply({ embeds: [Embeds.primary('🔥 Roast', Helpers.random(roasts))], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'compliment',
    description: 'Compliment a user',
    category: 'fun',
    permission: 'everyone',
    usage: '@user',
    async execute(client, message, args) {
      const target = message.mentions.users.first();
      if (!target) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike compliment @user`')], allowedMentions: { repliedUser: false } });
      const compliments = [
        `${target}, you light up every room you enter.`,
        `${target}, you're more fun than bubble wrap.`,
        `${target}, your potential is limitless.`,
        `${target}, you make the world better just by being in it.`,
        `${target}, you're someone's reason to smile.`,
        `${target}, you're stronger than you think.`,
        `${target}, you inspire the people around you.`,
        `${target}, your vibe is immaculate.`,
      ];
      return message.reply({ embeds: [Embeds.primary('💫 Compliment', Helpers.random(compliments))], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'hack',
    description: 'Fake hack a user',
    category: 'fun',
    permission: 'everyone',
    usage: '@user',
    async execute(client, message, args) {
      const target = message.mentions.users.first() || message.author;
      const msg = await message.reply({ embeds: [Embeds.loading('Hacking', `Hacking ${target.username}...`)] });
      const steps = [
        '🔧 Accessing Discord API...',
        '📡 Bypassing 2FA...',
        '💾 Stealing passwords...',
        '🎮 Reading DMs...',
        '💳 Found credit card: **** 1337',
        '📷 Accessing camera...',
        '✅ Hack complete!',
      ];
      for (let i = 0; i < steps.length; i++) {
        await Helpers.sleep(1500);
        await msg.edit({ embeds: [Embeds.loading('Hacking', `Hacking ${target.username}...\n\n${steps.slice(0, i + 1).join('\n')}`)] });
      }
      await msg.edit({ embeds: [Embeds.success('Hacked!', `${target.username} has been hacked! (Just kidding, this is a joke command 😄)`)] });
    },
  },
  {
    name: 'kill',
    description: 'Kill a user (virtually)',
    category: 'fun',
    permission: 'everyone',
    usage: '@user',
    async execute(client, message, args) {
      const target = message.mentions.users.first();
      if (!target) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike kill @user`')], allowedMentions: { repliedUser: false } });
      const methods = [
        `🔪 ${message.author.username} stabbed ${target.username}!`,
        `💣 ${message.author.username} blew up ${target.username}!`,
        `🏹 ${message.author.username} shot ${target.username} with an arrow!`,
        `🌶️ ${target.username} died from eating too many hot peppers!`,
        `👻 ${target.username} was scared to death by ${message.author.username}!`,
        `🤖 ${target.username} was defeated by the AI overlords!`,
      ];
      return message.reply({ embeds: [Embeds.primary('💀 Death', Helpers.random(methods))], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'hug',
    description: 'Hug a user',
    category: 'fun',
    permission: 'everyone',
    usage: '@user',
    async execute(client, message, args) {
      const target = message.mentions.users.first();
      if (!target) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike hug @user`')], allowedMentions: { repliedUser: false } });
      return message.reply({ embeds: [Embeds.primary('🤗 Hug', `${message.author} gave ${target} a big warm hug!`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'slap',
    description: 'Slap a user',
    category: 'fun',
    permission: 'everyone',
    usage: '@user',
    async execute(client, message, args) {
      const target = message.mentions.users.first();
      if (!target) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike slap @user`')], allowedMentions: { repliedUser: false } });
      return message.reply({ embeds: [Embeds.primary('👋 Slap', `${message.author} slapped ${target}! Ouch!`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'pat',
    description: 'Pat a user',
    category: 'fun',
    permission: 'everyone',
    usage: '@user',
    async execute(client, message, args) {
      const target = message.mentions.users.first();
      if (!target) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike pat @user`')], allowedMentions: { repliedUser: false } });
      return message.reply({ embeds: [Embeds.primary('🫳 Pat', `${message.author} patted ${target}. Good human!`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'kiss',
    description: 'Kiss a user',
    category: 'fun',
    permission: 'everyone',
    usage: '@user',
    async execute(client, message, args) {
      const target = message.mentions.users.first();
      if (!target) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike kiss @user`')], allowedMentions: { repliedUser: false } });
      return message.reply({ embeds: [Embeds.primary('💋 Kiss', `${message.author} kissed ${target}! 💕`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'highfive',
    description: 'High five a user',
    category: 'fun',
    permission: 'everyone',
    usage: '@user',
    async execute(client, message, args) {
      const target = message.mentions.users.first();
      if (!target) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike highfive @user`')], allowedMentions: { repliedUser: false } });
      return message.reply({ embeds: [Embeds.primary('🙋 High Five', `${message.author} high-fived ${target}! ✋`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'cuddle',
    description: 'Cuddle a user',
    category: 'fun',
    permission: 'everyone',
    usage: '@user',
    async execute(client, message, args) {
      const target = message.mentions.users.first();
      if (!target) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike cuddle @user`')], allowedMentions: { repliedUser: false } });
      return message.reply({ embeds: [Embeds.primary('🧸 Cuddle', `${message.author} cuddled with ${target}!`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'dance',
    description: 'Dance!',
    category: 'fun',
    permission: 'everyone',
    async execute(client, message) {
      const dances = ['💃', '🕺', '🎶', '🎵', '🪩'];
      return message.reply({ embeds: [Embeds.primary('💃 Dance', `${message.author} is dancing! ${Helpers.random(dances)}`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'coinflipfun',
    description: 'Heads or tails fun',
    category: 'fun',
    permission: 'everyone',
    async execute(client, message) {
      const result = Math.random() < 0.5 ? 'Heads 🪙' : 'Tails 🪙';
      return message.reply({ embeds: [Embeds.primary('Coin Flip', result)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'rate',
    description: 'Rate something',
    category: 'fun',
    permission: 'everyone',
    usage: '<thing>',
    async execute(client, message, args) {
      const thing = args.join(' ');
      if (!thing) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike rate <thing>`')], allowedMentions: { repliedUser: false } });
      const rate = Math.floor(Math.random() * 11);
      return message.reply({ embeds: [Embeds.primary('⭐ Rate', `I rate **${thing}** a ${rate}/10`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'reverse',
    description: 'Reverse text',
    category: 'fun',
    permission: 'everyone',
    usage: '<text>',
    async execute(client, message, args) {
      const text = args.join(' ');
      if (!text) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike reverse <text>`')], allowedMentions: { repliedUser: false } });
      return message.reply({ embeds: [Embeds.primary('🔄 Reversed', text.split('').reverse().join(''))], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'clap',
    description: 'Add 👏 claps 👏 between 👏 words',
    category: 'fun',
    permission: 'everyone',
    usage: '<text>',
    async execute(client, message, args) {
      const text = args.join(' ');
      if (!text) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike clap <text>`')], allowedMentions: { repliedUser: false } });
      return message.reply({ content: text.split(' ').join(' 👏 '), allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'vaporwave',
    description: 'Convert text to vaporwave',
    category: 'fun',
    permission: 'everyone',
    usage: '<text>',
    async execute(client, message, args) {
      const text = args.join(' ');
      if (!text) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike vaporwave <text>`')], allowedMentions: { repliedUser: false } });
      const vapor = text.split('').map(c => {
        const code = c.charCodeAt(0);
        if (code >= 33 && code <= 126) return String.fromCharCode(code + 65248);
        if (code === 32) return '　';
        return c;
      }).join('');
      return message.reply({ content: vapor, allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'binary',
    description: 'Convert text to binary',
    category: 'fun',
    permission: 'everyone',
    usage: '<text>',
    async execute(client, message, args) {
      const text = args.join(' ');
      if (!text) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike binary <text>`')], allowedMentions: { repliedUser: false } });
      const binary = text.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
      return message.reply({ embeds: [Embeds.primary('0️⃣ Binary', binary)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'morse',
    description: 'Convert text to morse code',
    category: 'fun',
    permission: 'everyone',
    usage: '<text>',
    async execute(client, message, args) {
      const text = args.join(' ').toUpperCase();
      if (!text) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike morse <text>`')], allowedMentions: { repliedUser: false } });
      const morseCode = {
        'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
        'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
        'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
        'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
        'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
        '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
        '8': '---..', '9': '----.', ' ': '/',
      };
      const morse = text.split('').map(c => morseCode[c] || c).join(' ');
      return message.reply({ embeds: [Embeds.primary('📡 Morse', morse)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'mock',
    description: 'Mock text (sPoNgEbOb style)',
    category: 'fun',
    permission: 'everyone',
    usage: '<text>',
    async execute(client, message, args) {
      const text = args.join(' ');
      if (!text) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike mock <text>`')], allowedMentions: { repliedUser: false } });
      const mocked = text.split('').map((c, i) => i % 2 ? c.toUpperCase() : c.toLowerCase()).join('');
      return message.reply({ content: mocked, allowedMentions: { repliedUser: false } });
    },
  },
];

module.exports = funCommands;
