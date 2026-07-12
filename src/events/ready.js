const { ActivityType, PresenceUpdateStatus } = require('discord.js');

module.exports = {
  // 'ready' still works in v14, 'clientReady' is the v15 name
  // Using 'ready' for backward compatibility — the deprecation warning is harmless
  name: 'ready',
  once: true,
  async execute(client) {
    console.log('\n');
    console.log('╔══════════════════════════════════════════╗');
    console.log('║                                          ║');
    console.log('║   ZIKE BOT - ONLINE                      ║');
    console.log('║   Built by Arsh (escapingdum)            ║');
    console.log('║                                          ║');
    console.log(`║   Logged in as: ${client.user.tag.padEnd(24)}║`);
    console.log(`║   Servers: ${String(client.guilds.cache.size).padEnd(31)}║`);
    console.log(`║   Users: ${String(client.users.cache.size).padEnd(33)}║`);
    console.log('║                                          ║');
    console.log('╚══════════════════════════════════════════╝');
    console.log('\n');

    // Load commands and verify all loaded
    try {
      await client.commandHandler.loadCommands();
    } catch (e) {
      console.error('❌ Failed to load commands:', e.message);
    }

    // Initialize Lavalink manager for music (non-fatal if it fails)
    try {
      if (client.lavalink && client.lavalink.initialize) {
        client.lavalink.initialize();
      }
    } catch (e) {
      console.error('⚠️  Lavalink init failed (music disabled):', e.message);
      console.error('   Bot will continue running without music features.');
    }

    // Set activity
    try {
      const activityType = ActivityType[client.config.activity.type] || ActivityType.Watching;
      client.user.setPresence({
        status: PresenceUpdateStatus[client.config.status.toLowerCase()] || PresenceUpdateStatus.Online,
        activities: [{
          name: client.config.activity.text,
          type: activityType,
        }],
      });

      // Update presence every 5 minutes with rotating activities
      const activities = [
        { name: client.config.activity.text, type: activityType },
        { name: `${client.guilds.cache.size} servers | @Zike help`, type: ActivityType.Watching },
        { name: 'with Arsh\'s commands | @Zike help', type: ActivityType.Playing },
        { name: 'over the server | @Zike help', type: ActivityType.Watching },
        { name: `${client.commandHandler.commands.size} commands | @Zike help`, type: ActivityType.Listening },
      ];

      let activityIndex = 0;
      setInterval(() => {
        try {
          const activity = activities[activityIndex % activities.length];
          client.user.setActivity(activity.name, { type: activity.type });
          activityIndex++;
        } catch (e) {
          // Silent fail for activity updates
        }
      }, 5 * 60 * 1000);
    } catch (e) {
      console.error('⚠️  Failed to set activity:', e.message);
    }

    console.log('✨ Zike is ready and online!');
    console.log(`   🤖 Logged in as: ${client.user.tag}`);
    console.log(`   🏠 Servers: ${client.guilds.cache.size}`);
    console.log(`   👥 Users: ${client.users.cache.size}`);
    console.log(`   📦 Commands: ${client.commandHandler.commands.size}`);
    console.log(`   🎵 Music: ${client.lavalink?.isAvailable() ? 'Available' : 'Disabled'}`);
    console.log(`   🤖 AI: ${client.ai?.client ? 'Available' : 'Disabled'}`);
    console.log('');
  },
};
