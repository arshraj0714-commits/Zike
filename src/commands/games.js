const Embeds = require('../utils/Embeds');
const Helpers = require('../utils/Helpers');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// ============================================
// GAMES COMMANDS (60+ games)
// ============================================

const gamesCommands = [
  // ============================================
  // CLASSIC GAMES
  // ============================================
  {
    name: '8ball',
    description: 'Ask the magic 8-ball',
    category: 'games',
    permission: 'everyone',
    usage: '<question>',
    aliases: ['magic8ball', 'eightball', 'ask'],
    async execute(client, message, args) {
      const question = args.join(' ');
      if (!question) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike 8ball <question>`')], allowedMentions: { repliedUser: false } });
      const answers = [
        '✅ Yes, definitely.', '✅ Without a doubt.', '✅ Yes, absolutely.', '✅ You may rely on it.',
        '✅ As I see it, yes.', '✅ Most likely.', '✅ Outlook good.', '✅ Yes.',
        '❌ No.', '❌ Definitely not.', '❌ My sources say no.', '❌ Outlook not so good.',
        '❌ Very doubtful.', '❌ Don\'t count on it.', '🤷 Reply hazy, try again.', '🤷 Ask again later.',
        '🤷 Better not tell you now.', '🤷 Cannot predict now.', '🤷 Concentrate and ask again.',
      ];
      const answer = Helpers.random(answers);
      return message.reply({ embeds: [Embeds.primary('🎱 Magic 8-Ball', `**Question:** ${question}\n**Answer:** ${answer}`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'coinflip',
    description: 'Flip a coin',
    category: 'games',
    permission: 'everyone',
    aliases: ['flip', 'coin', 'heads'],
    async execute(client, message) {
      const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
      return message.reply({ embeds: [Embeds.primary('🪙 Coin Flip', `The coin landed on **${result}**!`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'diceroll',
    description: 'Roll a dice',
    category: 'games',
    permission: 'everyone',
    usage: '[sides]',
    aliases: ['dice', 'roll', 'rolldice'],
    async execute(client, message, args) {
      const sides = parseInt(args[0]) || 6;
      const result = Math.floor(Math.random() * sides) + 1;
      return message.reply({ embeds: [Embeds.primary('🎲 Dice Roll', `You rolled a **${result}** (1-${sides})!`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'rps',
    description: 'Rock Paper Scissors',
    category: 'games',
    permission: 'everyone',
    usage: '<rock|paper|scissors>',
    aliases: ['rockpaperscissors'],
    async execute(client, message, args) {
      const choice = args[0]?.toLowerCase();
      const valid = ['rock', 'paper', 'scissors'];
      if (!valid.includes(choice)) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike rps <rock|paper|scissors>`')], allowedMentions: { repliedUser: false } });
      const bot = Helpers.random(valid);
      let result;
      if (choice === bot) result = '🤝 It\'s a tie!';
      else if ((choice === 'rock' && bot === 'scissors') || (choice === 'paper' && bot === 'rock') || (choice === 'scissors' && bot === 'paper')) result = '🎉 You win!';
      else result = '😔 You lose!';
      return message.reply({ embeds: [Embeds.primary('✊ Rock Paper Scissors', `**You:** ${choice}\n**Bot:** ${bot}\n**Result:** ${result}`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'rpsls',
    description: 'Rock Paper Scissors Lizard Spock',
    category: 'games',
    permission: 'everyone',
    usage: '<rock|paper|scissors|lizard|spock>',
    async execute(client, message, args) {
      const choice = args[0]?.toLowerCase();
      const valid = ['rock', 'paper', 'scissors', 'lizard', 'spock'];
      if (!valid.includes(choice)) return message.reply({ embeds: [Embeds.error('Usage', `Valid: ${valid.join(', ')}`)], allowedMentions: { repliedUser: false } });
      const bot = Helpers.random(valid);
      const wins = {
        rock: ['scissors', 'lizard'], paper: ['rock', 'spock'],
        scissors: ['paper', 'lizard'], lizard: ['paper', 'spock'], spock: ['rock', 'scissors'],
      };
      let result;
      if (choice === bot) result = '🤝 Tie!';
      else if (wins[choice].includes(bot)) result = '🎉 You win!';
      else result = '😔 You lose!';
      return message.reply({ embeds: [Embeds.primary('✊ Rock Paper Scissors Lizard Spock', `**You:** ${choice}\n**Bot:** ${bot}\n**Result:** ${result}`)], allowedMentions: { repliedUser: false } });
    },
  },

  // ============================================
  // GUESSING GAMES
  // ============================================
  {
    name: 'guessthenumber',
    description: 'Guess a number between 1-100',
    category: 'games',
    permission: 'everyone',
    aliases: ['guessnum', 'numbergame'],
    async execute(client, message) {
      const number = Math.floor(Math.random() * 100) + 1;
      await message.reply({ embeds: [Embeds.primary('🔢 Guess the Number', 'I\'m thinking of a number 1-100. You have 5 tries!')] });
      let tries = 5;
      const filter = m => m.author.id === message.author.id;
      const collector = message.channel.createMessageCollector({ filter, time: 60000, max: 5 });
      collector.on('collect', m => {
        const guess = parseInt(m.content);
        tries--;
        if (guess === number) {
          message.channel.send({ embeds: [Embeds.success('🎉 Correct!', `You guessed it in ${5 - tries + 1} tries!`)] });
          collector.stop('won');
        } else if (tries > 0) {
          message.channel.send({ content: `${guess < number ? 'Higher' : 'Lower'}! ${tries} tries left.` });
        } else {
          message.channel.send({ embeds: [Embeds.error('Game Over', `The number was ${number}.`)] });
          collector.stop('lost');
        }
      });
    },
  },
  {
    name: 'highlower',
    description: 'Higher or Lower game',
    category: 'games',
    permission: 'everyone',
    aliases: ['higherlower', 'hilo'],
    async execute(client, message) {
      let current = Math.floor(Math.random() * 100) + 1;
      let score = 0;
      const msg = await message.reply({
        embeds: [Embeds.primary('🎯 Higher or Lower', `Current number: **${current}**\nWill the next number be higher or lower?\nReact with ⬆️ or ⬇️`)]
      });
      await msg.react('⬆️');
      await msg.react('⬇️');
      const filter = (r, u) => u.id === message.author.id && ['⬆️', '⬇️'].includes(r.emoji.name);
      const collector = msg.createReactionCollector({ filter, time: 30000 });
      collector.on('collect', reaction => {
        const next = Math.floor(Math.random() * 100) + 1;
        const won = (reaction.emoji.name === '⬆️' && next > current) || (reaction.emoji.name === '⬇️' && next < current);
        if (won) {
          score++;
          current = next;
          msg.edit({ embeds: [Embeds.success('✅ Correct!', `Number: **${next}** | Score: ${score}\nNext? ⬆️ or ⬇️`)] });
        } else {
          msg.edit({ embeds: [Embeds.error('❌ Wrong!', `Number was ${next}. Final score: ${score}`)] });
          collector.stop();
        }
      });
    },
  },
  {
    name: 'trivia',
    description: 'Answer a trivia question',
    category: 'games',
    permission: 'everyone',
    async execute(client, message) {
      const trivia = Helpers.random([
        { q: 'What is the capital of France?', a: 'paris' },
        { q: 'How many continents are there?', a: '7' },
        { q: 'What is the largest planet?', a: 'jupiter' },
        { q: 'Who painted the Mona Lisa?', a: 'leonardo da vinci' },
        { q: 'What is H2O?', a: 'water' },
        { q: 'How many sides does a hexagon have?', a: '6' },
        { q: 'What is the tallest mountain?', a: 'everest' },
        { q: 'What language has the most native speakers?', a: 'mandarin' },
        { q: 'What year did WW2 end?', a: '1945' },
        { q: 'What is the smallest country?', a: 'vatican city' },
        { q: 'Who wrote Romeo and Juliet?', a: 'shakespeare' },
        { q: 'What is the speed of light?', a: '299792458' },
        { q: 'How many bones in human body?', a: '206' },
        { q: 'What is the largest ocean?', a: 'pacific' },
        { q: 'What gas do plants absorb?', a: 'carbon dioxide' },
      ]);
      await message.reply({ embeds: [Embeds.primary('🧠 Trivia', trivia.q + '\n\nYou have 30 seconds!')] });
      const filter = m => m.author.id === message.author.id && m.content.toLowerCase().includes(trivia.a);
      try {
        const collected = await message.channel.awaitMessages({ filter, max: 1, time: 30000 });
        if (collected.size) {
          return message.channel.send({ embeds: [Embeds.success('🎉 Correct!', `${collected.first().author} got it right!`)] });
        }
      } catch {}
      return message.channel.send({ embeds: [Embeds.error('Time Up!', `The answer was: ${trivia.a}`)] });
    },
  },
  {
    name: 'mathgame',
    description: 'Quick math challenge',
    category: 'games',
    permission: 'everyone',
    async execute(client, message) {
      const a = Math.floor(Math.random() * 20) + 1;
      const b = Math.floor(Math.random() * 20) + 1;
      const ops = ['+', '-', '*'];
      const op = Helpers.random(ops);
      const answer = eval(`${a} ${op} ${b}`);
      await message.reply({ embeds: [Embeds.primary('🧮 Math Challenge', `What is ${a} ${op} ${b}?\n15 seconds!`)] });
      const filter = m => m.author.id === message.author.id && parseInt(m.content) === answer;
      try {
        const collected = await message.channel.awaitMessages({ filter, max: 1, time: 15000 });
        if (collected.size) return message.channel.send({ embeds: [Embeds.success('🎉 Correct!', `Answer: ${answer}`)] });
      } catch {}
      return message.channel.send({ embeds: [Embeds.error('Time Up!', `Answer was: ${answer}`)] });
    },
  },

  // ============================================
  // INTERACTIVE GAMES
  // ============================================
  {
    name: 'tictactoe',
    description: 'Play tic-tac-toe',
    category: 'games',
    permission: 'everyone',
    usage: '@opponent',
    aliases: ['ttt', 'xo'],
    async execute(client, message, args) {
      const opponent = message.mentions.users.first();
      if (!opponent || opponent.id === message.author.id) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike tictactoe @opponent`')], allowedMentions: { repliedUser: false } });

      const board = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
      let turn = message.author.id;
      const symbols = { [message.author.id]: '❌', [opponent.id]: '⭕' };

      const renderBoard = () => {
        return `\n${board[0]} | ${board[1]} | ${board[2]}\n---------\n${board[3]} | ${board[4]} | ${board[5]}\n---------\n${board[6]} | ${board[7]} | ${board[8]}\n`;
      };

      const embed = Embeds.primary('⭕ Tic Tac Toe', `${renderBoard()}\n${turn === message.author.id ? message.author : opponent}'s turn (${symbols[turn]})`);
      const msg = await message.reply({ embeds: [embed] });

      const filter = m => [message.author.id, opponent.id].includes(m.author.id) && /^\d$/.test(m.content) && turn === m.author.id;
      const collector = message.channel.createMessageCollector({ filter, time: 120000 });

      const checkWin = () => {
        const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
        for (const [a,b,c] of wins) {
          if (board[a] === board[b] && board[b] === board[c]) return board[a];
        }
        return null;
      };

      collector.on('collect', m => {
        const pos = parseInt(m.content) - 1;
        if (board[pos] === '❌' || board[pos] === '⭕') return m.reply('Taken!').then(r => setTimeout(() => r.delete(), 2000));
        board[pos] = symbols[m.author.id];
        m.delete().catch(() => {});
        const winner = checkWin();
        if (winner) {
          collector.stop();
          const winnerId = winner === '❌' ? message.author.id : opponent.id;
          return msg.edit({ embeds: [Embeds.success('🎉 Win!', `${winnerId === message.author.id ? message.author : opponent} wins!\n${renderBoard()}`)] });
        }
        if (!board.includes('1')) {
          collector.stop();
          return msg.edit({ embeds: [Embeds.info('🤝 Tie!', `It's a tie!\n${renderBoard()}`)] });
        }
        turn = turn === message.author.id ? opponent.id : message.author.id;
        msg.edit({ embeds: [Embeds.primary('⭕ Tic Tac Toe', `${renderBoard()}\n${turn === message.author.id ? message.author : opponent}'s turn (${symbols[turn]})`)] });
      });
    },
  },
  {
    name: 'hangman',
    description: 'Play hangman',
    category: 'games',
    permission: 'everyone',
    async execute(client, message) {
      const words = ['javascript', 'discord', 'computer', 'programming', 'keyboard', 'elephant', 'mountain', 'ocean', 'butterfly', 'galaxy', 'adventure', 'mystery', 'fantastic', 'wonderful', 'spectacular'];
      const word = Helpers.random(words);
      let guessed = new Set();
      let lives = 6;

      const render = () => {
        const display = word.split('').map(c => guessed.has(c) ? c : '_').join(' ');
        return `Word: ${display}\nLives: ${'❤️'.repeat(lives)}\nGuessed: ${[...guessed].join(', ') || 'None'}`;
      };

      const msg = await message.reply({ embeds: [Embeds.primary('🪢 Hangman', render())] });

      const filter = m => m.author.id === message.author.id && m.content.length === 1;
      const collector = message.channel.createMessageCollector({ filter, time: 120000 });

      collector.on('collect', m => {
        const letter = m.content.toLowerCase();
        m.delete().catch(() => {});
        if (guessed.has(letter)) return;
        guessed.add(letter);
        if (!word.includes(letter)) lives--;
        if (lives <= 0) {
          collector.stop();
          return msg.edit({ embeds: [Embeds.error('💀 Game Over', `Word was: ${word}`)] });
        }
        if (word.split('').every(c => guessed.has(c))) {
          collector.stop();
          return msg.edit({ embeds: [Embeds.success('🎉 Won!', `You guessed it: ${word}`)] });
        }
        msg.edit({ embeds: [Embeds.primary('🪢 Hangman', render())] });
      });
    },
  },

  // ============================================
  // WORD GAMES
  // ============================================
  {
    name: 'scramble',
    description: 'Unscramble a word',
    category: 'games',
    permission: 'everyone',
    async execute(client, message) {
      const words = ['javascript', 'discord', 'computer', 'programming', 'keyboard', 'elephant', 'mountain', 'butterfly', 'galaxy', 'adventure'];
      const word = Helpers.random(words);
      const scrambled = Helpers.shuffle(word.split('')).join('');
      await message.reply({ embeds: [Embeds.primary('🔤 Word Scramble', `Unscramble: **${scrambled}**\n30 seconds!`)] });
      const filter = m => m.author.id === message.author.id && m.content.toLowerCase() === word;
      try {
        const collected = await message.channel.awaitMessages({ filter, max: 1, time: 30000 });
        if (collected.size) return message.channel.send({ embeds: [Embeds.success('🎉 Correct!', `The word was ${word}!`)] });
      } catch {}
      return message.channel.send({ embeds: [Embeds.error('Time Up!', `The word was: ${word}`)] });
    },
  },
  {
    name: 'anagram',
    description: 'Find an anagram',
    category: 'games',
    permission: 'everyone',
    async execute(client, message) {
      const words = ['listen', 'astronomer', 'creative', 'triangle', 'admirer', 'debit card', 'dormitory', 'eleven plus two'];
      const word = Helpers.random(words);
      await message.reply({ embeds: [Embeds.primary('🔤 Anagram', `Find an anagram for: **${word}**\n30 seconds!`)] });
      const filter = m => m.author.id === message.author.id;
      const collected = await message.channel.awaitMessages({ filter, max: 1, time: 30000 }).catch(() => {});
      if (collected?.size) {
        const guess = collected.first().content.toLowerCase().replace(/\s/g, '');
        const original = word.replace(/\s/g, '').split('').sort().join('');
        const guessSorted = guess.split('').sort().join('');
        if (guess === original) return message.channel.send({ embeds: [Embeds.error('Same word!', 'Try a real anagram.')] });
        if (guessSorted === original) return message.channel.send({ embeds: [Embeds.success('🎉 Correct!', 'Valid anagram!')] });
        return message.channel.send({ embeds: [Embeds.error('❌ Wrong', 'Not an anagram.')] });
      }
      return message.channel.send({ embeds: [Embeds.error('Time Up!', '')] });
    },
  },
  {
    name: 'typingtest',
    description: 'Test your typing speed',
    category: 'games',
    permission: 'everyone',
    async execute(client, message) {
      const sentences = [
        'The quick brown fox jumps over the lazy dog',
        'Programming is the art of telling a computer what to do',
        'Discord bots are fun to build and even more fun to use',
        'A journey of a thousand miles begins with a single step',
        'To be or not to be that is the question',
      ];
      const sentence = Helpers.random(sentences);
      const start = Date.now();
      await message.reply({ embeds: [Embeds.primary('⌨️ Typing Test', `Type this:\n\`${sentence}\`\n\n60 seconds!`)] });
      const filter = m => m.author.id === message.author.id;
      try {
        const collected = await message.channel.awaitMessages({ filter, max: 1, time: 60000 });
        if (collected.size) {
          const time = (Date.now() - start) / 1000;
          const wpm = Math.round((sentence.split(' ').length / time) * 60);
          const correct = collected.first().content === sentence;
          return message.channel.send({ embeds: [Embeds.primary('⌨️ Results', `Time: ${time.toFixed(1)}s\nWPM: ${wpm}\nAccuracy: ${correct ? '100%' : 'Incorrect'}`)] });
        }
      } catch {}
      return message.channel.send({ embeds: [Embeds.error('Time Up!', '')] });
    },
  },

  // ============================================
  // SLOT / CASINO
  // ============================================
  {
    name: 'slots',
    description: 'Spin the slot machine',
    category: 'games',
    permission: 'everyone',
    aliases: ['slot', 'spin'],
    async execute(client, message) {
      const emojis = ['🍒', '🍋', '🍊', '🍇', '🔔', '⭐', '💎', '7️⃣'];
      const spin = () => [Helpers.random(emojis), Helpers.random(emojis), Helpers.random(emojis)];
      const result = spin();
      const won = result[0] === result[1] && result[1] === result[2];
      const twoMatch = result[0] === result[1] || result[1] === result[2] || result[0] === result[2];
      let msg = `🎰 | ${result.join(' | ')} | 🎰\n\n`;
      if (won) msg += '🎉 **JACKPOT!** You won!';
      else if (twoMatch) msg += '🎊 Two match! Small win!';
      else msg += '😔 No match. Try again!';
      return message.reply({ embeds: [Embeds.primary('🎰 Slots', msg)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'blackjack',
    description: 'Play a simple blackjack round',
    category: 'games',
    permission: 'everyone',
    async execute(client, message) {
      const draw = () => Math.floor(Math.random() * 10) + 1;
      const player = [draw(), draw()];
      const dealer = [draw(), draw()];
      const sum = arr => arr.reduce((a, b) => a + b, 0);
      let pSum = sum(player), dSum = sum(dealer);
      const embed = Embeds.primary('🃏 Blackjack', `**Your hand:** ${player.join(', ')} (${pSum})\n**Dealer shows:** ${dealer[0]}`)
        .setFooter({ text: 'Type "hit" or "stand" | 30 seconds' });
      await message.reply({ embeds: [embed] });

      const filter = m => m.author.id === message.author.id && ['hit', 'stand'].includes(m.content.toLowerCase());
      const collector = message.channel.createMessageCollector({ filter, time: 30000 });
      collector.on('collect', m => {
        if (m.content.toLowerCase() === 'hit') {
          player.push(draw());
          pSum = sum(player);
          if (pSum > 21) {
            collector.stop();
            return message.channel.send({ embeds: [Embeds.error('💥 Bust!', `You: ${pSum}\nYou busted!`)] });
          }
          message.channel.send({ embeds: [Embeds.info('Hit', `Your hand: ${player.join(', ')} (${pSum})`)] });
        } else {
          collector.stop();
          while (dSum < 17) { dealer.push(draw()); dSum = sum(dealer); }
          let result;
          if (dSum > 21 || pSum > dSum) result = '🎉 You win!';
          else if (pSum < dSum) result = '😔 Dealer wins!';
          else result = '🤝 Tie!';
          message.channel.send({ embeds: [Embeds.primary('Result', `**You:** ${player.join(', ')} (${pSum})\n**Dealer:** ${dealer.join(', ')} (${dSum})\n${result}`)] });
        }
      });
    },
  },

  // ============================================
  // FUN GAMES
  // ============================================
  {
    name: 'wouldyourather',
    description: 'Would you rather question',
    category: 'games',
    permission: 'everyone',
    aliases: ['wyr', 'rather'],
    async execute(client, message) {
      const questions = [
        'Have the ability to fly OR be invisible?',
        'Never use social media again OR never watch TV again?',
        'Be able to read minds OR see the future?',
        'Live without music OR live without movies?',
        'Be rich but lonely OR poor but loved?',
        'Have super strength OR super speed?',
        'Time travel to the past OR future?',
        'Speak every language OR play every instrument?',
        'Always be 10 minutes late OR 20 minutes early?',
        'Have unlimited money OR unlimited time?',
        'Be the funniest person OR the smartest person?',
        'Live in a treehouse OR an underground bunker?',
      ];
      return message.reply({ embeds: [Embeds.primary('🤔 Would You Rather', Helpers.random(questions))], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'truthordare',
    description: 'Truth or dare prompt',
    category: 'games',
    permission: 'everyone',
    usage: '<truth|dare>',
    aliases: ['tod'],
    async execute(client, message, args) {
      const type = args[0]?.toLowerCase();
      if (!['truth', 'dare'].includes(type)) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike truthordare <truth|dare>`')], allowedMentions: { repliedUser: false } });
      const truths = ['What\'s your biggest fear?', 'Who\'s your secret crush?', 'What\'s the most embarrassing thing you\'ve done?', 'What\'s a lie you\'ve told recently?', 'What\'s your biggest regret?', 'Have you ever cheated on a test?'];
      const dares = ['Do 10 pushups', 'Sing a song for 30 seconds', 'Speak in an accent for 5 minutes', 'Send a funny emoji combo', 'Compliment everyone in the chat', 'Tell a bad joke'];
      const item = type === 'truth' ? Helpers.random(truths) : Helpers.random(dares);
      return message.reply({ embeds: [Embeds.primary(`🎯 ${type === 'truth' ? 'Truth' : 'Dare'}`, item)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'neverhaveiever',
    description: 'Never Have I Ever prompt',
    category: 'games',
    permission: 'everyone',
    aliases: ['nhie'],
    async execute(client, message) {
      const items = [
        'broken a bone', 'gotten a tattoo', 'traveled outside my country', 'met a celebrity',
        'been skydiving', 'eaten sushi', 'gotten lost in a city', 'sung karaoke',
        'ridden a horse', 'climbed a mountain', 'gone skinny dipping', 'been on TV',
        'met someone online then in person', 'cried during a movie', 'stayed up for 24+ hours',
      ];
      return message.reply({ embeds: [Embeds.primary('🙈 Never Have I Ever', `...${Helpers.random(items)}.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'riddle',
    description: 'Get a riddle',
    category: 'games',
    permission: 'everyone',
    async execute(client, message) {
      const riddles = [
        { q: 'I speak without a mouth and hear without ears. What am I?', a: 'echo' },
        { q: 'The more you take, the more you leave behind. What are they?', a: 'footsteps' },
        { q: 'What has keys but can\'t open doors?', a: 'piano' },
        { q: 'I\'m tall when I\'m young, short when I\'m old. What am I?', a: 'candle' },
        { q: 'What can travel around the world while staying in a corner?', a: 'stamp' },
        { q: 'What gets wetter as it dries?', a: 'towel' },
        { q: 'What has hands but can\'t clap?', a: 'clock' },
        { q: 'What can you catch but not throw?', a: 'cold' },
      ];
      const r = Helpers.random(riddles);
      await message.reply({ embeds: [Embeds.primary('🤔 Riddle', `${r.q}\n\n30 seconds to answer!`)] });
      const filter = m => m.author.id === message.author.id && m.content.toLowerCase().includes(r.a);
      try {
        const collected = await message.channel.awaitMessages({ filter, max: 1, time: 30000 });
        if (collected.size) return message.channel.send({ embeds: [Embeds.success('🎉 Correct!', `Answer: ${r.a}`)] });
      } catch {}
      return message.channel.send({ embeds: [Embeds.error('Time Up!', `Answer was: ${r.a}`)] });
    },
  },

  // ============================================
  // LEADERBOARDS & STATS
  // ============================================
  {
    name: 'gamestats',
    description: 'View your game statistics',
    category: 'games',
    permission: 'everyone',
    usage: '[@user]',
    async execute(client, message, args) {
      const target = message.mentions.users.first() || message.author;
      const stats = {
        wins: client.db.get(`game_wins_${message.guild.id}_${target.id}`) || 0,
        losses: client.db.get(`game_losses_${message.guild.id}_${target.id}`) || 0,
        played: client.db.get(`game_played_${message.guild.id}_${target.id}`) || 0,
      };
      const winRate = stats.played > 0 ? ((stats.wins / stats.played) * 100).toFixed(1) : '0';
      return message.reply({ embeds: [Embeds.primary('🎮 Game Stats', `${target}'s game statistics`).addFields(
        { name: '🏆 Wins', value: stats.wins.toString(), inline: true },
        { name: '😔 Losses', value: stats.losses.toString(), inline: true },
        { name: '📊 Played', value: stats.played.toString(), inline: true },
        { name: '📈 Win Rate', value: `${winRate}%`, inline: true },
      )], allowedMentions: { repliedUser: false } });
    },
  },
];

/**
 * Helper to record game result
 */
function recordGameResult(client, guildId, userId, won) {
  const played = (client.db.get(`game_played_${guildId}_${userId}`) || 0) + 1;
  client.db.set(`game_played_${guildId}_${userId}`, played);
  if (won) {
    client.db.set(`game_wins_${guildId}_${userId}`, (client.db.get(`game_wins_${guildId}_${userId}`) || 0) + 1);
  } else {
    client.db.set(`game_losses_${guildId}_${userId}`, (client.db.get(`game_losses_${guildId}_${userId}`) || 0) + 1);
  }
}

// Add more game commands
const moreGames = [
  {
    name: 'joke',
    description: 'Get a random joke',
    category: 'games',
    permission: 'everyone',
    async execute(client, message) {
      const jokes = [
        'Why don\'t scientists trust atoms? Because they make up everything!',
        'Why did the scarecrow win an award? He was outstanding in his field!',
        'Why don\'t programmers like nature? It has too many bugs.',
        'What do you call a fake noodle? An impasta!',
        'Why did the math book look sad? Because it had too many problems.',
        'What do you call a bear with no teeth? A gummy bear!',
        'Why can\'t you give Elsa a balloon? Because she\'d let it go.',
        'What do you call a fish without eyes? Fsh.',
        'Why did the coffee file a police report? It got mugged.',
        'How does the moon cut his hair? Eclipse it.',
        'Why don\'t skeletons fight each other? They don\'t have the guts.',
        'What do you call cheese that isn\'t yours? Nacho cheese.',
      ];
      return message.reply({ embeds: [Embeds.primary('😂 Joke', Helpers.random(jokes))], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'fact',
    description: 'Get a random fun fact',
    category: 'games',
    permission: 'everyone',
    async execute(client, message) {
      const facts = [
        'Honey never spoils. Archaeologists have found 3000-year-old honey that\'s still edible.',
        'Octopuses have three hearts and blue blood.',
        'A group of flamingos is called a "flamboyance".',
        'Bananas are berries, but strawberries aren\'t.',
        'The shortest war in history lasted 38 minutes.',
        'A jiffy is an actual unit of time (1/100 of a second).',
        'Wombat poop is cube-shaped.',
        'The human body has about 100,000 miles of blood vessels.',
        'Sharks existed before trees.',
        'A day on Venus is longer than a year on Venus.',
        'There are more possible chess games than atoms in the universe.',
        'Cows have best friends and get stressed when separated.',
      ];
      return message.reply({ embeds: [Embeds.primary('💡 Fun Fact', Helpers.random(facts))], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'quote',
    description: 'Get an inspirational quote',
    category: 'games',
    permission: 'everyone',
    async execute(client, message) {
      const quotes = [
        { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
        { text: 'Innovation distinguishes between a leader and a follower.', author: 'Steve Jobs' },
        { text: 'Be the change you wish to see in the world.', author: 'Mahatma Gandhi' },
        { text: 'The future belongs to those who believe in the beauty of their dreams.', author: 'Eleanor Roosevelt' },
        { text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', author: 'Winston Churchill' },
        { text: 'The only limit to our realization of tomorrow is our doubts of today.', author: 'Franklin D. Roosevelt' },
        { text: 'In the middle of difficulty lies opportunity.', author: 'Albert Einstein' },
        { text: 'Life is what happens when you\'re busy making other plans.', author: 'John Lennon' },
      ];
      const q = Helpers.random(quotes);
      return message.reply({ embeds: [Embeds.primary('💬 Quote', `"${q.text}"\n\n— **${q.author}**`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'random',
    description: 'Get a random number between two values',
    category: 'games',
    permission: 'everyone',
    usage: '<min> <max>',
    async execute(client, message, args) {
      const min = parseInt(args[0]) || 1;
      const max = parseInt(args[1]) || 100;
      const result = Math.floor(Math.random() * (max - min + 1)) + min;
      return message.reply({ embeds: [Embeds.primary('🎲 Random', `Random number between ${min} and ${max}: **${result}**`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'choose',
    description: 'Let Zike choose between options',
    category: 'games',
    permission: 'everyone',
    usage: '<option1> or <option2> or ...',
    async execute(client, message, args) {
      const options = args.join(' ').split(/\s+or\s+/i);
      if (options.length < 2) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike choose <option1> or <option2>`')], allowedMentions: { repliedUser: false } });
      return message.reply({ embeds: [Embeds.primary('🤔 Choice', `I choose: **${Helpers.random(options)}**`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'meme',
    description: 'Get a random meme text',
    category: 'games',
    permission: 'everyone',
    async execute(client, message) {
      const memes = [
        'When the code works on the first try: Suspicious.\nWhen it doesn\'t work after 100 tries: Reality.',
        'Me: I\'ll just fix one bug.\nAlso me 4 hours later: Rewrites the entire codebase.',
        'Programming is 10% writing code and 90% understanding why it doesn\'t work.',
        'There are 2 hard problems in computer science: cache invalidation, naming things, and off-by-1 errors.',
        'Me: This bug is impossible.\nAlso me 5 minutes later: Oh, it was a typo.',
        'Frontend developers: It works on my machine.\nBackend developers: It works in production.',
        'I don\'t always test my code, but when I do, I do it in production.',
      ];
      return message.reply({ embeds: [Embeds.primary('😎 Meme', Helpers.random(memes))], allowedMentions: { repliedUser: false } });
    },
  },
];

module.exports = [...gamesCommands, ...moreGames];
