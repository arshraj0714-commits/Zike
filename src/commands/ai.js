const Embeds = require('../utils/Embeds');
const Helpers = require('../utils/Helpers');

// ============================================
// AI COMMANDS (25+ commands)
// ============================================

const aiCommands = [
  {
    name: 'ask',
    description: 'Ask Zike AI a question',
    category: 'ai',
    permission: 'everyone',
    usage: '<question>',
    async execute(client, message, args) {
      const question = args.join(' ');
      if (!question) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike ask <question>`')], allowedMentions: { repliedUser: false } });
      await message.channel.sendTyping();
      const response = await client.ai.quick(question, 'You are Zike, an AI assistant. Answer questions clearly and helpfully. Be concise but thorough.');
      return message.reply({ embeds: [Embeds.primary('🤖 AI Response', response || 'No response generated.')], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'aistory',
    description: 'Generate a short story',
    category: 'ai',
    permission: 'everyone',
    usage: '<topic>',
    async execute(client, message, args) {
      const topic = args.join(' ');
      if (!topic) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike aistory <topic>`')], allowedMentions: { repliedUser: false } });
      await message.channel.sendTyping();
      const response = await client.ai.quick(`Write a short creative story about: ${topic}`, 'You are Zike, a creative AI. Write engaging, vivid short stories.');
      return message.reply({ embeds: [Embeds.primary('📖 AI Story', response || 'No story generated.')], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'aipoem',
    description: 'Generate a poem',
    category: 'ai',
    permission: 'everyone',
    usage: '<topic>',
    async execute(client, message, args) {
      const topic = args.join(' ');
      if (!topic) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike aipoem <topic>`')], allowedMentions: { repliedUser: false } });
      await message.channel.sendTyping();
      const response = await client.ai.quick(`Write a beautiful poem about: ${topic}`, 'You are Zike, a poetic AI. Write beautiful, emotional poems.');
      return message.reply({ embeds: [Embeds.primary('📜 AI Poem', response || 'No poem generated.')], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'aijoke',
    description: 'Get an AI-generated joke',
    category: 'ai',
    permission: 'everyone',
    usage: '[topic]',
    async execute(client, message, args) {
      const topic = args.join(' ') || 'programming';
      await message.channel.sendTyping();
      const response = await client.ai.quick(`Tell me a funny joke about ${topic}.`, 'You are Zike. Tell one funny, clean joke. Keep it short.');
      return message.reply({ embeds: [Embeds.primary('😄 AI Joke', response || 'No joke generated.')], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'aifood',
    description: 'Get a recipe recommendation',
    category: 'ai',
    permission: 'everyone',
    usage: '<dish or ingredient>',
    async execute(client, message, args) {
      const query = args.join(' ');
      if (!query) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike aifood <dish>`')], allowedMentions: { repliedUser: false } });
      await message.channel.sendTyping();
      const response = await client.ai.quick(`Suggest a recipe with: ${query}. Include ingredients and steps.`, 'You are Zike, a culinary AI. Provide clear, easy recipes.');
      return message.reply({ embeds: [Embeds.primary('🍳 AI Recipe', response || 'No recipe generated.')], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'aicode',
    description: 'Get help with code',
    category: 'ai',
    permission: 'everyone',
    usage: '<question>',
    async execute(client, message, args) {
      const question = args.join(' ');
      if (!question) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike aicode <question>`')], allowedMentions: { repliedUser: false } });
      await message.channel.sendTyping();
      const response = await client.ai.quick(question, 'You are Zike, an expert programming AI. Provide clear code examples with explanations. Use proper markdown code blocks.');
      const chunks = Helpers.chunkText(response, 1900);
      for (const chunk of chunks) {
        await message.channel.send({ content: chunk, allowedMentions: { repliedUser: false, parse: [] } });
      }
    },
  },
  {
    name: 'aiexplain',
    description: 'Have AI explain something',
    category: 'ai',
    permission: 'everyone',
    usage: '<topic>',
    async execute(client, message, args) {
      const topic = args.join(' ');
      if (!topic) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike aiexplain <topic>`')], allowedMentions: { repliedUser: false } });
      await message.channel.sendTyping();
      const response = await client.ai.quick(`Explain: ${topic}. Make it easy to understand.`, 'You are Zike, an educational AI. Explain concepts clearly with examples.');
      return message.reply({ embeds: [Embeds.primary('📚 AI Explanation', response || 'No explanation generated.')], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'aisummarize',
    description: 'Summarize text',
    category: 'ai',
    permission: 'everyone',
    usage: '<text>',
    async execute(client, message, args) {
      const text = args.join(' ');
      if (!text) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike aisummarize <text>`')], allowedMentions: { repliedUser: false } });
      await message.channel.sendTyping();
      const response = await client.ai.quick(`Summarize this:\n${text}`, 'You are Zike. Provide a concise summary.');
      return message.reply({ embeds: [Embeds.primary('📝 Summary', response || 'No summary generated.')], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'aitranslate',
    description: 'Translate text',
    category: 'ai',
    permission: 'everyone',
    usage: '<language> <text>',
    async execute(client, message, args) {
      const lang = args[0];
      const text = args.slice(1).join(' ');
      if (!lang || !text) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike aitranslate <language> <text>`')], allowedMentions: { repliedUser: false } });
      await message.channel.sendTyping();
      const response = await client.ai.quick(`Translate to ${lang}: ${text}`, 'You are Zike, a translation AI. Translate accurately.');
      return message.reply({ embeds: [Embeds.primary('🌐 Translation', response || 'No translation generated.')], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'aisentiment',
    description: 'Analyze sentiment of text',
    category: 'ai',
    permission: 'everyone',
    usage: '<text>',
    async execute(client, message, args) {
      const text = args.join(' ');
      if (!text) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike aisentiment <text>`')], allowedMentions: { repliedUser: false } });
      await message.channel.sendTyping();
      const response = await client.ai.quick(`Analyze sentiment: "${text}". Reply with: sentiment (positive/negative/neutral), confidence %, and brief explanation.`, 'You are Zike. Analyze sentiment accurately and concisely.');
      return message.reply({ embeds: [Embeds.primary('💭 Sentiment Analysis', response || 'No analysis generated.')], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'aifact',
    description: 'Get an AI-generated fact',
    category: 'ai',
    permission: 'everyone',
    usage: '[topic]',
    async execute(client, message, args) {
      const topic = args.join(' ') || 'random';
      await message.channel.sendTyping();
      const response = await client.ai.quick(`Tell me an interesting fact about ${topic}.`, 'You are Zike. Tell one fascinating, accurate fact. Keep it short.');
      return message.reply({ embeds: [Embeds.primary('💡 AI Fact', response || 'No fact generated.')], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'aiadvice',
    description: 'Get AI advice',
    category: 'ai',
    permission: 'everyone',
    usage: '<situation>',
    async execute(client, message, args) {
      const situation = args.join(' ');
      if (!situation) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike aiadvice <situation>`')], allowedMentions: { repliedUser: false } });
      await message.channel.sendTyping();
      const response = await client.ai.quick(`Give thoughtful advice for this situation: ${situation}`, 'You are Zike, a wise advisor. Give practical, empathetic advice.');
      return message.reply({ embeds: [Embeds.primary('🎯 AI Advice', response || 'No advice generated.')], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'aiquote',
    description: 'Generate an inspirational quote',
    category: 'ai',
    permission: 'everyone',
    usage: '[topic]',
    async execute(client, message, args) {
      const topic = args.join(' ') || 'life';
      await message.channel.sendTyping();
      const response = await client.ai.quick(`Write an inspirational quote about ${topic}. Just the quote, no author.`, 'You are Zike. Write one powerful, original quote.');
      return message.reply({ embeds: [Embeds.primary('💬 AI Quote', response || 'No quote generated.')], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'aiidea',
    description: 'Generate creative ideas',
    category: 'ai',
    permission: 'everyone',
    usage: '<topic>',
    async execute(client, message, args) {
      const topic = args.join(' ');
      if (!topic) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike aiidea <topic>`')], allowedMentions: { repliedUser: false } });
      await message.channel.sendTyping();
      const response = await client.ai.quick(`Give me 5 creative ideas for: ${topic}`, 'You are Zike, a creative AI. Provide innovative, actionable ideas.');
      return message.reply({ embeds: [Embeds.primary('💡 AI Ideas', response || 'No ideas generated.')], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'aichat',
    description: 'Start a focused AI conversation',
    category: 'ai',
    permission: 'everyone',
    usage: '<message>',
    async execute(client, message, args) {
      const msg = args.join(' ');
      if (!msg) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike aichat <message>`')], allowedMentions: { repliedUser: false } });
      await message.channel.sendTyping();
      const response = await client.ai.generateResponse(msg, message.author, true);
      if (response.length > 2000) {
        const chunks = Helpers.chunkText(response, 2000);
        for (const chunk of chunks) await message.channel.send({ content: chunk, allowedMentions: { repliedUser: false, parse: [] } });
      } else {
        await message.reply({ content: response, allowedMentions: { repliedUser: false, parse: [] } });
      }
    },
  },
  {
    name: 'clearai',
    description: 'Clear your AI conversation history',
    category: 'ai',
    permission: 'everyone',
    async execute(client, message) {
      client.ai.clearHistory(message.author.id);
      return message.reply({ embeds: [Embeds.success('Cleared', 'Your AI conversation history has been cleared.')], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'aiimage',
    description: 'Generate an image description',
    category: 'ai',
    permission: 'everyone',
    usage: '<description>',
    async execute(client, message, args) {
      const desc = args.join(' ');
      if (!desc) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike aiimage <description>`')], allowedMentions: { repliedUser: false } });
      await message.channel.sendTyping();
      const response = await client.ai.quick(`Vividly describe an image of: ${desc}. Include colors, mood, and details.`, 'You are Zike. Describe images vividly and creatively.');
      return message.reply({ embeds: [Embeds.primary('🎨 Image Description', response || 'No description generated.')], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'aipersonality',
    description: 'Chat with AI as a specific personality',
    category: 'ai',
    permission: 'everyone',
    usage: '<personality> <message>',
    async execute(client, message, args) {
      const personality = args[0];
      const msg = args.slice(1).join(' ');
      if (!personality || !msg) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike aipersonality <pirate|robot|shakespeare|...> <message>`')], allowedMentions: { repliedUser: false } });
      await message.channel.sendTyping();
      const response = await client.ai.quick(msg, `You are Zike, but speak as a ${personality}. Stay in character.`);
      return message.reply({ content: response || 'No response.', allowedMentions: { repliedUser: false, parse: [] } });
    },
  },
  {
    name: 'aithink',
    description: 'Have AI think through a problem step by step',
    category: 'ai',
    permission: 'everyone',
    usage: '<problem>',
    async execute(client, message, args) {
      const problem = args.join(' ');
      if (!problem) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike aithink <problem>`')], allowedMentions: { repliedUser: false } });
      await message.channel.sendTyping();
      const response = await client.ai.quick(`Think step by step about: ${problem}`, 'You are Zike. Break down problems step by step, showing your reasoning.');
      return message.reply({ embeds: [Embeds.primary('🧠 AI Thinking', response || 'No response generated.')], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'aibiography',
    description: 'Generate a fictional biography',
    category: 'ai',
    permission: 'everyone',
    usage: '<name> <details>',
    async execute(client, message, args) {
      const text = args.join(' ');
      if (!text) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike aibiography <name> <details>`')], allowedMentions: { repliedUser: false } });
      await message.channel.sendTyping();
      const response = await client.ai.quick(`Write a fictional biography for: ${text}`, 'You are Zike. Write engaging fictional biographies.');
      return message.reply({ embeds: [Embeds.primary('📖 AI Biography', response || 'No biography generated.')], allowedMentions: { repliedUser: false } });
    },
  },
];

module.exports = aiCommands;
