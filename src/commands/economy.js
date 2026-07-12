const Embeds = require('../utils/Embeds');
const Helpers = require('../utils/Helpers');

// ============================================
// ECONOMY COMMANDS (40+ commands)
// ============================================

function getBalance(client, guildId, userId) {
  return client.db.get(`balance_${guildId}_${userId}`) || 0;
}

function setBalance(client, guildId, userId, amount) {
  client.db.set(`balance_${guildId}_${userId}`, amount);
  return amount;
}

const economyCommands = [
  {
    name: 'balance',
    description: 'Check your coin balance',
    category: 'economy',
    permission: 'everyone',
    usage: '[@user]',
    aliases: ['bal', 'coins', 'wallet'],
    async execute(client, message, args) {
      const target = message.mentions.users.first() || message.author;
      const balance = getBalance(client, message.guild.id, target.id);
      const bank = client.db.get(`bank_${message.guild.id}_${target.id}`) || 0;
      return message.reply({ embeds: [Embeds.primary('💰 Balance', `${target}'s wallet`).addFields(
        { name: '💵 Cash', value: `${balance} coins`, inline: true },
        { name: '🏦 Bank', value: `${bank} coins`, inline: true },
        { name: '💎 Total', value: `${balance + bank} coins`, inline: true },
      )], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'daily',
    description: 'Claim your daily reward',
    category: 'economy',
    permission: 'everyone',
    async execute(client, message) {
      const key = `daily_${message.guild.id}_${message.author.id}`;
      const lastClaim = client.db.get(key);
      const now = Date.now();
      if (lastClaim && now - lastClaim < 86400000) {
        const remaining = 86400000 - (now - lastClaim);
        return message.reply({ embeds: [Embeds.warning('Already Claimed', `Come back in ${Helpers.formatDuration(remaining)} to claim again.`)], allowedMentions: { repliedUser: false } });
      }
      const streak = client.db.get(`daily_streak_${message.guild.id}_${message.author.id}`) || 0;
      const newStreak = lastClaim && now - lastClaim < 172800000 ? streak + 1 : 1;
      const reward = 100 + (newStreak * 10);
      const balance = getBalance(client, message.guild.id, message.author.id);
      setBalance(client, message.guild.id, message.author.id, balance + reward);
      client.db.set(key, now);
      client.db.set(`daily_streak_${message.guild.id}_${message.author.id}`, newStreak);
      return message.reply({ embeds: [Embeds.success('🎁 Daily Claimed', `You got **${reward} coins**!\nStreak: ${newStreak} days`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'weekly',
    description: 'Claim your weekly reward',
    category: 'economy',
    permission: 'everyone',
    async execute(client, message) {
      const key = `weekly_${message.guild.id}_${message.author.id}`;
      const lastClaim = client.db.get(key);
      const now = Date.now();
      if (lastClaim && now - lastClaim < 604800000) {
        return message.reply({ embeds: [Embeds.warning('Already Claimed', `Come back in ${Helpers.formatDuration(604800000 - (now - lastClaim))}.`)], allowedMentions: { repliedUser: false } });
      }
      const reward = 500;
      const balance = getBalance(client, message.guild.id, message.author.id);
      setBalance(client, message.guild.id, message.author.id, balance + reward);
      client.db.set(key, now);
      return message.reply({ embeds: [Embeds.success('🎁 Weekly Claimed', `You got **${reward} coins**!`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'monthly',
    description: 'Claim your monthly reward',
    category: 'economy',
    permission: 'everyone',
    async execute(client, message) {
      const key = `monthly_${message.guild.id}_${message.author.id}`;
      const lastClaim = client.db.get(key);
      const now = Date.now();
      if (lastClaim && now - lastClaim < 2592000000) {
        return message.reply({ embeds: [Embeds.warning('Already Claimed', `Come back in ${Helpers.formatDuration(2592000000 - (now - lastClaim))}.`)], allowedMentions: { repliedUser: false } });
      }
      const reward = 2500;
      const balance = getBalance(client, message.guild.id, message.author.id);
      setBalance(client, message.guild.id, message.author.id, balance + reward);
      client.db.set(key, now);
      return message.reply({ embeds: [Embeds.success('🎁 Monthly Claimed', `You got **${reward} coins**!`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'work',
    description: 'Work for coins',
    category: 'economy',
    permission: 'everyone',
    async execute(client, message) {
      const key = `work_${message.guild.id}_${message.author.id}`;
      const lastWork = client.db.get(key);
      const now = Date.now();
      if (lastWork && now - lastWork < 3600000) {
        return message.reply({ embeds: [Embeds.warning('Cooldown', `Come back in ${Helpers.formatDuration(3600000 - (now - lastWork))}.`)], allowedMentions: { repliedUser: false } });
      }
      const jobs = ['programmer', 'chef', 'teacher', 'doctor', 'artist', 'musician', 'writer', 'engineer', 'pilot', 'detective'];
      const job = Helpers.random(jobs);
      const reward = Math.floor(Math.random() * 100) + 50;
      const balance = getBalance(client, message.guild.id, message.author.id);
      setBalance(client, message.guild.id, message.author.id, balance + reward);
      client.db.set(key, now);
      return message.reply({ embeds: [Embeds.success('💼 Work', `You worked as a ${job} and earned **${reward} coins**!`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'crime',
    description: 'Commit a crime (risky!)',
    category: 'economy',
    permission: 'everyone',
    async execute(client, message) {
      const key = `crime_${message.guild.id}_${message.author.id}`;
      const lastCrime = client.db.get(key);
      const now = Date.now();
      if (lastCrime && now - lastCrime < 3600000) {
        return message.reply({ embeds: [Embeds.warning('Cooldown', `Wait ${Helpers.formatDuration(3600000 - (now - lastCrime))}.`)], allowedMentions: { repliedUser: false } });
      }
      client.db.set(key, now);
      const success = Math.random() < 0.5;
      if (success) {
        const reward = Math.floor(Math.random() * 200) + 100;
        const balance = getBalance(client, message.guild.id, message.author.id);
        setBalance(client, message.guild.id, message.author.id, balance + reward);
        return message.reply({ embeds: [Embeds.success('🦹 Crime Success', `You got away with **${reward} coins**!`)], allowedMentions: { repliedUser: false } });
      } else {
        const fine = Math.floor(Math.random() * 100) + 50;
        const balance = getBalance(client, message.guild.id, message.author.id);
        setBalance(client, message.guild.id, message.author.id, Math.max(0, balance - fine));
        return message.reply({ embeds: [Embeds.error('🚔 Caught!', `You got caught and paid a fine of **${fine} coins**.`)], allowedMentions: { repliedUser: false } });
      }
    },
  },
  {
    name: 'rob',
    description: 'Rob another user',
    category: 'economy',
    permission: 'everyone',
    usage: '@user',
    async execute(client, message, args) {
      const target = message.mentions.users.first();
      if (!target || target.id === message.author.id) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike rob @user`')], allowedMentions: { repliedUser: false } });
      const key = `rob_${message.guild.id}_${message.author.id}`;
      const last = client.db.get(key);
      if (last && Date.now() - last < 3600000) return message.reply({ embeds: [Embeds.warning('Cooldown', `Wait ${Helpers.formatDuration(3600000 - (Date.now() - last))}.`)], allowedMentions: { repliedUser: false } });
      client.db.set(key, Date.now());
      const targetBal = getBalance(client, message.guild.id, target.id);
      if (targetBal < 100) return message.reply({ embeds: [Embeds.error('Too Poor', `${target.username} doesn't have enough to rob.`)], allowedMentions: { repliedUser: false } });
      const success = Math.random() < 0.4;
      if (success) {
        const amount = Math.floor(Math.random() * Math.min(targetBal, 500)) + 50;
        setBalance(client, message.guild.id, target.id, targetBal - amount);
        const authorBal = getBalance(client, message.guild.id, message.author.id);
        setBalance(client, message.guild.id, message.author.id, authorBal + amount);
        return message.reply({ embeds: [Embeds.success('💰 Robbed!', `You stole **${amount} coins** from ${target.username}!`)], allowedMentions: { repliedUser: false } });
      } else {
        const fine = 100;
        const bal = getBalance(client, message.guild.id, message.author.id);
        setBalance(client, message.guild.id, message.author.id, Math.max(0, bal - fine));
        return message.reply({ embeds: [Embeds.error('🚔 Failed', `You got caught! Paid ${fine} coins fine.`)], allowedMentions: { repliedUser: false } });
      }
    },
  },
  {
    name: 'gamble',
    description: 'Gamble your coins',
    category: 'economy',
    permission: 'everyone',
    usage: '<amount>',
    async execute(client, message, args) {
      const amount = parseInt(args[0]);
      if (!amount || amount < 10) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike gamble <amount>` (min 10)')], allowedMentions: { repliedUser: false } });
      const bal = getBalance(client, message.guild.id, message.author.id);
      if (bal < amount) return message.reply({ embeds: [Embeds.error('Insufficient', `You only have ${bal} coins.`)], allowedMentions: { repliedUser: false } });
      const win = Math.random() < 0.45;
      if (win) {
        setBalance(client, message.guild.id, message.author.id, bal + amount);
        return message.reply({ embeds: [Embeds.success('🎉 Won!', `You won **${amount} coins**!`)], allowedMentions: { repliedUser: false } });
      } else {
        setBalance(client, message.guild.id, message.author.id, bal - amount);
        return message.reply({ embeds: [Embeds.error('😔 Lost', `You lost **${amount} coins**.`)], allowedMentions: { repliedUser: false } });
      }
    },
  },
  {
    name: 'deposit',
    description: 'Deposit coins to bank',
    category: 'economy',
    permission: 'everyone',
    usage: '<amount|all>',
    aliases: ['dep'],
    async execute(client, message, args) {
      const bal = getBalance(client, message.guild.id, message.author.id);
      const amount = args[0]?.toLowerCase() === 'all' ? bal : parseInt(args[0]);
      if (!amount || amount < 1 || amount > bal) return message.reply({ embeds: [Embeds.error('Invalid', `You have ${bal} coins.`)], allowedMentions: { repliedUser: false } });
      setBalance(client, message.guild.id, message.author.id, bal - amount);
      const bank = client.db.get(`bank_${message.guild.id}_${message.author.id}`) || 0;
      client.db.set(`bank_${message.guild.id}_${message.author.id}`, bank + amount);
      return message.reply({ embeds: [Embeds.success('Deposited', `Deposited ${amount} coins to bank.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'withdraw',
    description: 'Withdraw coins from bank',
    category: 'economy',
    permission: 'everyone',
    usage: '<amount|all>',
    aliases: ['wd', 'with'],
    async execute(client, message, args) {
      const bank = client.db.get(`bank_${message.guild.id}_${message.author.id}`) || 0;
      const amount = args[0]?.toLowerCase() === 'all' ? bank : parseInt(args[0]);
      if (!amount || amount < 1 || amount > bank) return message.reply({ embeds: [Embeds.error('Invalid', `You have ${bank} coins in bank.`)], allowedMentions: { repliedUser: false } });
      client.db.set(`bank_${message.guild.id}_${message.author.id}`, bank - amount);
      const bal = getBalance(client, message.guild.id, message.author.id);
      setBalance(client, message.guild.id, message.author.id, bal + amount);
      return message.reply({ embeds: [Embeds.success('Withdrawn', `Withdrew ${amount} coins.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'pay',
    description: 'Pay another user',
    category: 'economy',
    permission: 'everyone',
    usage: '@user <amount>',
    async execute(client, message, args) {
      const target = message.mentions.users.first();
      const amount = parseInt(args[1]);
      if (!target || !amount || amount < 1) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike pay @user <amount>`')], allowedMentions: { repliedUser: false } });
      const bal = getBalance(client, message.guild.id, message.author.id);
      if (bal < amount) return message.reply({ embeds: [Embeds.error('Insufficient', `You only have ${bal} coins.`)], allowedMentions: { repliedUser: false } });
      setBalance(client, message.guild.id, message.author.id, bal - amount);
      const targetBal = getBalance(client, message.guild.id, target.id);
      setBalance(client, message.guild.id, target.id, targetBal + amount);
      return message.reply({ embeds: [Embeds.success('Paid', `You paid ${target.username} ${amount} coins.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'leaderboard',
    description: 'View the richest users',
    category: 'economy',
    permission: 'everyone',
    aliases: ['baltop', 'top', 'rich'],
    async execute(client, message) {
      const keys = client.db.keys(`balance_${message.guild.id}_*`);
      const data = keys.map(k => {
        const userId = k.replace(`balance_${message.guild.id}_`, '');
        return { userId, balance: client.db.get(k) || 0 };
      }).sort((a, b) => b.balance - a.balance).slice(0, 10);
      if (data.length === 0) return message.reply({ embeds: [Embeds.info('No Data', 'No balances yet.')], allowedMentions: { repliedUser: false } });
      const medals = ['🥇', '🥈', '🥉'];
      const list = data.map((d, i) => `${medals[i] || `**${i + 1}.**`} <@${d.userId}> — ${Helpers.formatNumber(d.balance)} coins`).join('\n');
      return message.reply({ embeds: [Embeds.primary('💰 Richest Users', list)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'shop',
    description: 'View the shop',
    category: 'economy',
    permission: 'everyone',
    async execute(client, message) {
      const shop = [
        { id: 'vip', name: 'VIP Role', price: 5000, desc: 'Get a special VIP role' },
        { id: 'color', name: 'Custom Color', price: 2000, desc: 'Custom colored role' },
        { id: 'nickname', name: 'Custom Nickname', price: 1000, desc: 'Change your nickname' },
        { id: 'lottery', name: 'Lottery Ticket', price: 500, desc: 'Try your luck' },
        { id: 'mystery', name: 'Mystery Box', price: 1500, desc: 'Random reward' },
      ];
      const list = shop.map(item => `**${item.name}** — ${item.price} coins\n${item.desc}`).join('\n\n');
      return message.reply({ embeds: [Embeds.primary('🛒 Shop', list).setFooter({ text: 'Use @Zike buy <item> to purchase' })], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'buy',
    description: 'Buy an item from the shop',
    category: 'economy',
    permission: 'everyone',
    usage: '<item>',
    async execute(client, message, args) {
      const item = args[0]?.toLowerCase();
      const shop = { vip: 5000, color: 2000, nickname: 1000, lottery: 500, mystery: 1500 };
      if (!shop[item]) return message.reply({ embeds: [Embeds.error('Not Found', 'Item not in shop. Use `@Zike shop` to see items.')], allowedMentions: { repliedUser: false } });
      const bal = getBalance(client, message.guild.id, message.author.id);
      if (bal < shop[item]) return message.reply({ embeds: [Embeds.error('Insufficient', `You need ${shop[item]} coins, you have ${bal}.`)], allowedMentions: { repliedUser: false } });
      setBalance(client, message.guild.id, message.author.id, bal - shop[item]);
      return message.reply({ embeds: [Embeds.success('Purchased', `You bought **${item}** for ${shop[item]} coins! Contact an admin to claim.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'inventory',
    description: 'View your inventory',
    category: 'economy',
    permission: 'everyone',
    async execute(client, message) {
      const inv = client.db.get(`inventory_${message.guild.id}_${message.author.id}`) || [];
      if (inv.length === 0) return message.reply({ embeds: [Embeds.info('Empty', 'Your inventory is empty.')], allowedMentions: { repliedUser: false } });
      return message.reply({ embeds: [Embeds.primary('🎒 Inventory', inv.map(i => `**${i.name}** x${i.qty}`).join('\n'))], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'lottery',
    description: 'Buy a lottery ticket (500 coins)',
    category: 'economy',
    permission: 'everyone',
    async execute(client, message) {
      const bal = getBalance(client, message.guild.id, message.author.id);
      if (bal < 500) return message.reply({ embeds: [Embeds.error('Insufficient', 'You need 500 coins.')], allowedMentions: { repliedUser: false } });
      setBalance(client, message.guild.id, message.author.id, bal - 500);
      const win = Math.random() < 0.1;
      if (win) {
        const reward = 5000;
        setBalance(client, message.guild.id, message.author.id, getBalance(client, message.guild.id, message.author.id) + reward);
        return message.reply({ embeds: [Embeds.success('🎉 JACKPOT!', `You won ${reward} coins!`)], allowedMentions: { repliedUser: false } });
      }
      return message.reply({ embeds: [Embeds.info('😔 No Luck', 'Better luck next time!')], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'coinflipbet',
    description: 'Bet on a coin flip',
    category: 'economy',
    permission: 'everyone',
    usage: '<heads|tails> <amount>',
    async execute(client, message, args) {
      const choice = args[0]?.toLowerCase();
      const amount = parseInt(args[1]);
      if (!['heads', 'tails'].includes(choice) || !amount) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike coinflipbet <heads|tails> <amount>`')], allowedMentions: { repliedUser: false } });
      const bal = getBalance(client, message.guild.id, message.author.id);
      if (bal < amount) return message.reply({ embeds: [Embeds.error('Insufficient', `You have ${bal} coins.`)], allowedMentions: { repliedUser: false } });
      const result = Math.random() < 0.5 ? 'heads' : 'tails';
      if (result === choice) {
        setBalance(client, message.guild.id, message.author.id, bal + amount);
        return message.reply({ embeds: [Embeds.success('🎉 Won!', `Coin: ${result}. You won ${amount * 2} coins!`)], allowedMentions: { repliedUser: false } });
      } else {
        setBalance(client, message.guild.id, message.author.id, bal - amount);
        return message.reply({ embeds: [Embeds.error('😔 Lost', `Coin: ${result}. You lost ${amount} coins.`)], allowedMentions: { repliedUser: false } });
      }
    },
  },
  {
    name: 'setbalance',
    description: 'Set a user\'s balance (admin only)',
    category: 'economy',
    permission: 'admin',
    usage: '@user <amount>',
    async execute(client, message, args) {
      const target = message.mentions.users.first();
      const amount = parseInt(args[1]);
      if (!target || isNaN(amount)) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike setbalance @user <amount>`')], allowedMentions: { repliedUser: false } });
      setBalance(client, message.guild.id, target.id, amount);
      return message.reply({ embeds: [Embeds.success('Set', `${target.username}'s balance is now ${amount} coins.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'addcoins',
    description: 'Add coins to a user',
    category: 'economy',
    permission: 'admin',
    usage: '@user <amount>',
    async execute(client, message, args) {
      const target = message.mentions.users.first();
      const amount = parseInt(args[1]);
      if (!target || isNaN(amount)) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike addcoins @user <amount>`')], allowedMentions: { repliedUser: false } });
      const bal = getBalance(client, message.guild.id, target.id);
      setBalance(client, message.guild.id, target.id, bal + amount);
      return message.reply({ embeds: [Embeds.success('Added', `Added ${amount} coins to ${target.username}.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'removecoins',
    description: 'Remove coins from a user',
    category: 'economy',
    permission: 'admin',
    usage: '@user <amount>',
    async execute(client, message, args) {
      const target = message.mentions.users.first();
      const amount = parseInt(args[1]);
      if (!target || isNaN(amount)) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike removecoins @user <amount>`')], allowedMentions: { repliedUser: false } });
      const bal = getBalance(client, message.guild.id, target.id);
      setBalance(client, message.guild.id, target.id, Math.max(0, bal - amount));
      return message.reply({ embeds: [Embeds.success('Removed', `Removed ${amount} coins from ${target.username}.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'economyreset',
    description: 'Reset all economy data',
    category: 'economy',
    permission: 'admin',
    async execute(client, message) {
      const keys = client.db.keys(`balance_${message.guild.id}_*`);
      const bankKeys = client.db.keys(`bank_${message.guild.id}_*`);
      for (const k of [...keys, ...bankKeys]) client.db.delete(k);
      return message.reply({ embeds: [Embeds.warning('Reset', 'All economy data has been reset.')], allowedMentions: { repliedUser: false } });
    },
  },
];

module.exports = economyCommands;
