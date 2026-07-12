const Embeds = require('../utils/Embeds');
const Helpers = require('../utils/Helpers');

// ============================================
// MUSIC COMMANDS (20+ commands)
// Uses public free Lavalink nodes for playback
// ============================================

const musicCommands = [
  {
    name: 'play',
    description: 'Play a song from YouTube/Spotify',
    category: 'music',
    permission: 'everyone',
    usage: '<song name or URL>',
    aliases: ['p'],
    async execute(client, message, args) {
      const query = args.join(' ');
      if (!query) {
        return message.reply({ embeds: [Embeds.error('Usage', '`@Zike play <song name or URL>`')], allowedMentions: { repliedUser: false } });
      }

      // Check if Lavalink is available
      if (!client.lavalink?.isAvailable()) {
        return message.reply({ embeds: [Embeds.error('Music Unavailable', 'Music is currently disabled. This could be because:\n• No Lavalink nodes are connected\n• Lavalink failed to initialize\n\nTry again later, or ask Arsh to check the bot.')], allowedMentions: { repliedUser: false } });
      }

      if (!client.lavalink.hasConnectedNodes()) {
        return message.reply({ embeds: [Embeds.error('No Music Nodes', 'No Lavalink nodes are currently connected. The bot will keep trying to connect. Try again in a moment.')], allowedMentions: { repliedUser: false } });
      }

      // Check if user is in voice
      const voiceChannel = message.member.voice.channel;
      if (!voiceChannel) {
        return message.reply({ embeds: [Embeds.error('Not in Voice', 'You need to be in a voice channel to play music!')], allowedMentions: { repliedUser: false } });
      }

      // Check permissions
      const permissions = voiceChannel.permissionsFor(message.guild.members.me);
      if (!permissions.has(['Connect', 'Speak'])) {
        return message.reply({ embeds: [Embeds.error('No Permissions', 'I need `Connect` and `Speak` permissions in that voice channel.')], allowedMentions: { repliedUser: false } });
      }

      try {
        // Get or create player
        const player = await client.lavalink.getPlayer(message.guild, voiceChannel, message.channel);

        // If player exists but in different channel, switch
        if (player.voiceChannelId !== voiceChannel.id) {
          await player.setVoiceChannel(voiceChannel.id);
        }

        // Search for track
        const loadingMsg = await message.reply({ embeds: [Embeds.loading('Searching...', `Looking for: **${query}**`)] });

        const result = await client.lavalink.manager.search({ query, source: 'ytsearch' }, message.author);

        if (!result || result.loadType === 'empty' || (result.tracks && result.tracks.length === 0)) {
          return loadingMsg.edit({ embeds: [Embeds.error('No Results', `No tracks found for: **${query}**`)] });
        }

        let addedTracks = 0;
        let firstTrack = null;

        if (result.loadType === 'playlist') {
          // Add all tracks from playlist
          for (const track of result.tracks) {
            track.requester = message.author;
            player.queue.add(track);
            if (!firstTrack) firstTrack = track;
            addedTracks++;
          }
          await loadingMsg.edit({ embeds: [Embeds.success('📋 Playlist Added', `Added **${addedTracks}** tracks from playlist **${result.playlistName || 'Unknown'}**!`)] });
        } else if (result.loadType === 'track' || result.loadType === 'search') {
          const track = result.tracks[0];
          track.requester = message.author;
          player.queue.add(track);
          firstTrack = track;
          addedTracks = 1;
          await loadingMsg.edit({ embeds: [Embeds.success('🎵 Track Added', `**${track.info.title}** by ${track.info.author}\nDuration: ${Helpers.formatDuration(track.info.duration)}`)] });
        } else if (result.loadType === 'error') {
          return loadingMsg.edit({ embeds: [Embeds.error('Search Error', result.exception?.message || 'Failed to search for track.')] });
        }

        // Start playing if not already
        if (!player.playing && !player.paused) {
          await player.play();
        }

      } catch (error) {
        console.error('Play command error:', error);
        return message.reply({ embeds: [Embeds.error('Error', `Failed to play: ${error.message}`)], allowedMentions: { repliedUser: false } });
      }
    },
  },
  {
    name: 'pause',
    description: 'Pause the current song',
    category: 'music',
    permission: 'everyone',
    async execute(client, message) {
      const player = client.lavalink?.manager?.getPlayer(message.guild.id);
      if (!player || !player.playing) {
        return message.reply({ embeds: [Embeds.error('Nothing Playing', 'There is no song currently playing.')], allowedMentions: { repliedUser: false } });
      }
      await player.pause(true);
      return message.reply({ embeds: [Embeds.primary('⏸️ Paused', 'Music has been paused. Use `@Zike resume` to continue.')], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'resume',
    description: 'Resume the paused song',
    category: 'music',
    permission: 'everyone',
    aliases: ['unpause'],
    async execute(client, message) {
      const player = client.lavalink?.manager?.getPlayer(message.guild.id);
      if (!player || !player.paused) {
        return message.reply({ embeds: [Embeds.error('Not Paused', 'The music is not paused.')], allowedMentions: { repliedUser: false } });
      }
      await player.resume();
      return message.reply({ embeds: [Embeds.primary('▶️ Resumed', 'Music has been resumed!')], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'stop',
    description: 'Stop music and clear the queue',
    category: 'music',
    permission: 'everyone',
    aliases: ['destroy', 'dc', 'disconnect'],
    async execute(client, message) {
      const player = client.lavalink?.manager?.getPlayer(message.guild.id);
      if (!player) {
        return message.reply({ embeds: [Embeds.error('No Player', 'There is no active music player.')], allowedMentions: { repliedUser: false } });
      }
      await player.destroy();
      return message.reply({ embeds: [Embeds.success('⏹️ Stopped', 'Music stopped and queue cleared. Goodbye!')], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'skip',
    description: 'Skip the current song',
    category: 'music',
    permission: 'everyone',
    aliases: ['next', 'sk'],
    async execute(client, message) {
      const player = client.lavalink?.manager?.getPlayer(message.guild.id);
      if (!player || (!player.playing && !player.paused)) {
        return message.reply({ embeds: [Embeds.error('Nothing Playing', 'There is no song to skip.')], allowedMentions: { repliedUser: false } });
      }
      if (player.queue.tracks.length === 0) {
        await player.destroy();
        return message.reply({ embeds: [Embeds.success('⏭️ Skipped', 'Skipped the last song. Queue is now empty.')], allowedMentions: { repliedUser: false } });
      }
      await player.skip();
      return message.reply({ embeds: [Embeds.success('⏭️ Skipped', 'Skipped to the next song!')], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'queue',
    description: 'View the music queue',
    category: 'music',
    permission: 'everyone',
    aliases: ['q'],
    async execute(client, message) {
      const player = client.lavalink?.manager?.getPlayer(message.guild.id);
      if (!player || (!player.queue.current && player.queue.tracks.length === 0)) {
        return message.reply({ embeds: [Embeds.info('Empty Queue', 'The queue is empty. Use `@Zike play <song>` to add music!')], allowedMentions: { repliedUser: false } });
      }

      const current = player.queue.current;
      const upcoming = player.queue.tracks.slice(0, 15);

      let description = '';
      if (current) {
        description += `**🎵 Now Playing**\n**${current.info.title}** by ${current.info.author}\nDuration: ${Helpers.formatDuration(current.info.duration)}\n\n`;
      }
      if (upcoming.length > 0) {
        description += `**📋 Up Next (${player.queue.tracks.length} tracks)**\n`;
        upcoming.forEach((track, i) => {
          description += `**${i + 1}.** ${Helpers.truncate(track.info.title, 50)} — ${Helpers.formatDuration(track.info.duration)}\n`;
        });
        if (player.queue.tracks.length > 15) {
          description += `\n*...and ${player.queue.tracks.length - 15} more*`;
        }
      }

      const embed = Embeds.primary('🎵 Music Queue', description || 'Queue is empty');
      if (current?.info?.artworkUrl) embed.setThumbnail(current.info.artworkUrl);
      return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'nowplaying',
    description: 'Show the current song',
    category: 'music',
    permission: 'everyone',
    aliases: ['np', 'current'],
    async execute(client, message) {
      const player = client.lavalink?.manager?.getPlayer(message.guild.id);
      if (!player || !player.queue.current) {
        return message.reply({ embeds: [Embeds.error('Nothing Playing', 'There is no song currently playing.')], allowedMentions: { repliedUser: false } });
      }

      const track = player.queue.current;
      const position = player.position || 0;
      const duration = track.info.duration;
      const progress = duration > 0 ? Math.floor((position / duration) * 100) : 0;
      const progressBar = '█'.repeat(Math.floor(progress / 5)) + '░'.repeat(20 - Math.floor(progress / 5));

      const embed = Embeds.primary('🎵 Now Playing', `**${track.info.title}**\nBy: ${track.info.author}`)
        .addFields(
          { name: 'Duration', value: `${Helpers.formatDuration(position)} / ${Helpers.formatDuration(duration)}`, inline: true },
          { name: 'Progress', value: `${progressBar} ${progress}%`, inline: false },
          { name: 'Requested By', value: track.requester ? `<@${track.requester.id}>` : 'Unknown', inline: true },
          { name: 'Status', value: player.paused ? '⏸️ Paused' : '▶️ Playing', inline: true },
        );
      if (track.info.artworkUrl) embed.setThumbnail(track.info.artworkUrl);
      if (track.info.uri) embed.setURL(track.info.uri);
      return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'volume',
    description: 'Set the music volume',
    category: 'music',
    permission: 'everyone',
    usage: '<0-150>',
    aliases: ['vol', 'v'],
    async execute(client, message, args) {
      const player = client.lavalink?.manager?.getPlayer(message.guild.id);
      if (!player) {
        return message.reply({ embeds: [Embeds.error('No Player', 'There is no active music player.')], allowedMentions: { repliedUser: false } });
      }
      if (!args[0]) {
        return message.reply({ embeds: [Embeds.info('Current Volume', `Volume is currently at **${player.volume}%**`)], allowedMentions: { repliedUser: false } });
      }
      const vol = parseInt(args[0]);
      if (isNaN(vol) || vol < 0 || vol > 150) {
        return message.reply({ embeds: [Embeds.error('Usage', '`@Zike volume <0-150>`')], allowedMentions: { repliedUser: false } });
      }
      await player.setVolume(vol);
      return message.reply({ embeds: [Embeds.success('🔊 Volume', `Volume set to **${vol}%**`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'lyrics',
    description: 'Get AI-generated lyrics for a song',
    category: 'music',
    permission: 'everyone',
    usage: '<song name>',
    async execute(client, message, args) {
      const song = args.join(' ');
      if (!song) return message.reply({ embeds: [Embeds.error('Usage', '`@Zike lyrics <song name>`')], allowedMentions: { repliedUser: false } });
      await message.channel.sendTyping();
      const response = await client.ai.quick(`Write original song lyrics in the style of: ${song}`, 'You are Zike. Write creative, original song lyrics with verses and a chorus.');
      return message.reply({ embeds: [Embeds.primary('🎤 Lyrics', response || 'No lyrics generated.')], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'shuffle',
    description: 'Shuffle the music queue',
    category: 'music',
    permission: 'everyone',
    async execute(client, message) {
      const player = client.lavalink?.manager?.getPlayer(message.guild.id);
      if (!player || player.queue.tracks.length === 0) {
        return message.reply({ embeds: [Embeds.error('Empty Queue', 'The queue is empty.')], allowedMentions: { repliedUser: false } });
      }
      player.queue.shuffle();
      return message.reply({ embeds: [Embeds.success('🔀 Shuffled', `Shuffled **${player.queue.tracks.length}** tracks!`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'repeat',
    description: 'Repeat current song or queue',
    category: 'music',
    permission: 'everyone',
    usage: '[track|queue|off]',
    aliases: ['loop'],
    async execute(client, message, args) {
      const player = client.lavalink?.manager?.getPlayer(message.guild.id);
      if (!player) {
        return message.reply({ embeds: [Embeds.error('No Player', 'There is no active music player.')], allowedMentions: { repliedUser: false } });
      }
      const mode = args[0]?.toLowerCase();
      if (mode === 'track' || mode === 'song') {
        player.setRepeatMode('track');
        return message.reply({ embeds: [Embeds.success('🔁 Repeat', 'Now repeating the **current track**.')], allowedMentions: { repliedUser: false } });
      }
      if (mode === 'queue' || mode === 'all') {
        player.setRepeatMode('queue');
        return message.reply({ embeds: [Embeds.success('🔁 Repeat', 'Now repeating the **entire queue**.')], allowedMentions: { repliedUser: false } });
      }
      if (mode === 'off' || mode === 'stop') {
        player.setRepeatMode('off');
        return message.reply({ embeds: [Embeds.success('🔁 Repeat', 'Repeat is now **off**.')], allowedMentions: { repliedUser: false } });
      }
      // Toggle
      const current = player.repeatMode;
      if (current === 'off') {
        player.setRepeatMode('track');
        return message.reply({ embeds: [Embeds.success('🔁 Repeat', 'Now repeating the current **track**.')], allowedMentions: { repliedUser: false } });
      } else if (current === 'track') {
        player.setRepeatMode('queue');
        return message.reply({ embeds: [Embeds.success('🔁 Repeat', 'Now repeating the **queue**.')], allowedMentions: { repliedUser: false } });
      } else {
        player.setRepeatMode('off');
        return message.reply({ embeds: [Embeds.success('🔁 Repeat', 'Repeat is now **off**.')], allowedMentions: { repliedUser: false } });
      }
    },
  },
  {
    name: 'join',
    description: 'Join your voice channel',
    category: 'music',
    permission: 'everyone',
    aliases: ['connect'],
    async execute(client, message) {
      const voiceChannel = message.member.voice.channel;
      if (!voiceChannel) {
        return message.reply({ embeds: [Embeds.error('Not in Voice', 'You need to be in a voice channel first!')], allowedMentions: { repliedUser: false } });
      }
      if (!client.lavalink?.hasConnectedNodes()) {
        return message.reply({ embeds: [Embeds.error('No Nodes', 'No Lavalink nodes connected.')], allowedMentions: { repliedUser: false } });
      }
      const player = await client.lavalink.getPlayer(message.guild, voiceChannel, message.channel);
      return message.reply({ embeds: [Embeds.success('🔊 Joined', `Joined **${voiceChannel.name}**!`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'leave',
    description: 'Leave the voice channel',
    category: 'music',
    permission: 'everyone',
    aliases: ['disconnect'],
    async execute(client, message) {
      const player = client.lavalink?.manager?.getPlayer(message.guild.id);
      if (player) {
        await player.destroy();
      }
      return message.reply({ embeds: [Embeds.success('👋 Left', 'Left the voice channel.')], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'seek',
    description: 'Seek to a position in the song',
    category: 'music',
    permission: 'everyone',
    usage: '<seconds>',
    async execute(client, message, args) {
      const player = client.lavalink?.manager?.getPlayer(message.guild.id);
      if (!player || !player.queue.current) {
        return message.reply({ embeds: [Embeds.error('Nothing Playing', 'No song is currently playing.')], allowedMentions: { repliedUser: false } });
      }
      const seconds = parseInt(args[0]);
      if (isNaN(seconds)) {
        return message.reply({ embeds: [Embeds.error('Usage', '`@Zike seek <seconds>`')], allowedMentions: { repliedUser: false } });
      }
      await player.seek(seconds * 1000);
      return message.reply({ embeds: [Embeds.success('⏩ Seeked', `Seeked to ${Helpers.formatDuration(seconds * 1000)}`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'remove',
    description: 'Remove a song from the queue',
    category: 'music',
    permission: 'everyone',
    usage: '<position>',
    async execute(client, message, args) {
      const player = client.lavalink?.manager?.getPlayer(message.guild.id);
      if (!player || player.queue.tracks.length === 0) {
        return message.reply({ embeds: [Embeds.error('Empty Queue', 'The queue is empty.')], allowedMentions: { repliedUser: false } });
      }
      const pos = parseInt(args[0]);
      if (isNaN(pos) || pos < 1 || pos > player.queue.tracks.length) {
        return message.reply({ embeds: [Embeds.error('Invalid Position', `Position must be between 1 and ${player.queue.tracks.length}.`)], allowedMentions: { repliedUser: false } });
      }
      const track = player.queue.tracks[pos - 1];
      player.queue.remove(pos - 1);
      return message.reply({ embeds: [Embeds.success('🗑️ Removed', `Removed **${track.info.title}** from the queue.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'clearqueue',
    description: 'Clear the entire queue',
    category: 'music',
    permission: 'everyone',
    aliases: ['clearq', 'cq'],
    async execute(client, message) {
      const player = client.lavalink?.manager?.getPlayer(message.guild.id);
      if (!player || player.queue.tracks.length === 0) {
        return message.reply({ embeds: [Embeds.error('Empty Queue', 'The queue is already empty.')], allowedMentions: { repliedUser: false } });
      }
      const count = player.queue.tracks.length;
      player.queue.clear();
      return message.reply({ embeds: [Embeds.success('🧹 Cleared', `Cleared **${count}** tracks from the queue.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'movetrack',
    description: 'Move a track to a new position',
    category: 'music',
    permission: 'everyone',
    usage: '<from> <to>',
    aliases: ['move', 'swap'],
    async execute(client, message, args) {
      const player = client.lavalink?.manager?.getPlayer(message.guild.id);
      if (!player || player.queue.tracks.length < 2) {
        return message.reply({ embeds: [Embeds.error('Not Enough Tracks', 'Need at least 2 tracks in the queue.')], allowedMentions: { repliedUser: false } });
      }
      const from = parseInt(args[0]);
      const to = parseInt(args[1]);
      if (isNaN(from) || isNaN(to) || from < 1 || to < 1 || from > player.queue.tracks.length || to > player.queue.tracks.length) {
        return message.reply({ embeds: [Embeds.error('Usage', `\`@Zike movetrack <1-${player.queue.tracks.length}> <1-${player.queue.tracks.length}>\``)], allowedMentions: { repliedUser: false } });
      }
      player.queue.moveTrack(from - 1, to - 1);
      return message.reply({ embeds: [Embeds.success('↔️ Moved', `Moved track from position ${from} to ${to}.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'skipto',
    description: 'Skip to a specific track in the queue',
    category: 'music',
    permission: 'everyone',
    usage: '<position>',
    async execute(client, message, args) {
      const player = client.lavalink?.manager?.getPlayer(message.guild.id);
      if (!player || player.queue.tracks.length === 0) {
        return message.reply({ embeds: [Embeds.error('Empty Queue', 'The queue is empty.')], allowedMentions: { repliedUser: false } });
      }
      const pos = parseInt(args[0]);
      if (isNaN(pos) || pos < 1 || pos > player.queue.tracks.length) {
        return message.reply({ embeds: [Embeds.error('Invalid Position', `Position must be between 1 and ${player.queue.tracks.length}.`)], allowedMentions: { repliedUser: false } });
      }
      await player.skipTo(pos - 1);
      return message.reply({ embeds: [Embeds.success('⏭️ Skipped', `Skipped to position **${pos}**.`)], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'history',
    description: 'View recently played tracks',
    category: 'music',
    permission: 'everyone',
    aliases: ['recent'],
    async execute(client, message) {
      const player = client.lavalink?.manager?.getPlayer(message.guild.id);
      if (!player || player.queue.previous.length === 0) {
        return message.reply({ embeds: [Embeds.info('No History', 'No recently played tracks.')], allowedMentions: { repliedUser: false } });
      }
      const history = player.queue.previous.slice(-10).reverse();
      const list = history.map((track, i) => `**${i + 1}.** ${Helpers.truncate(track.info.title, 50)} — ${track.info.author}`).join('\n');
      return message.reply({ embeds: [Embeds.primary('📜 History', `Recently played tracks:`).addFields({ name: '\u200B', value: list })], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'playprevious',
    description: 'Play the previous track',
    category: 'music',
    permission: 'everyone',
    aliases: ['back', 'previous'],
    async execute(client, message) {
      const player = client.lavalink?.manager?.getPlayer(message.guild.id);
      if (!player || player.queue.previous.length === 0) {
        return message.reply({ embeds: [Embeds.error('No Previous', 'There is no previous track.')], allowedMentions: { repliedUser: false } });
      }
      await player.queue.previous();
      return message.reply({ embeds: [Embeds.success('⏮️ Previous', 'Playing the previous track!')], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'filters',
    description: 'View or toggle audio filters',
    category: 'music',
    permission: 'everyone',
    usage: '[filter]',
    async execute(client, message, args) {
      const player = client.lavalink?.manager?.getPlayer(message.guild.id);
      if (!player) {
        return message.reply({ embeds: [Embeds.error('No Player', 'There is no active music player.')], allowedMentions: { repliedUser: false } });
      }

      const availableFilters = ['nightcore', 'bassboost', 'vaporwave', 'tremolo', 'vibrato', 'karaoke', '8d', 'rotation'];

      if (!args[0]) {
        const active = player.filters ? Object.keys(player.filters).filter(k => player.filters[k]) : [];
        return message.reply({ embeds: [Embeds.primary('🎚️ Audio Filters', `**Available filters:** ${availableFilters.join(', ')}\n\n**Active:** ${active.length ? active.join(', ') : 'None'}\n\nUse \`@Zike filters <name>\` to toggle.`)], allowedMentions: { repliedUser: false } });
      }

      const filter = args[0].toLowerCase();
      if (!availableFilters.includes(filter)) {
        return message.reply({ embeds: [Embeds.error('Invalid Filter', `Available: ${availableFilters.join(', ')}`)], allowedMentions: { repliedUser: false } });
      }

      try {
        await player.filterManager.toggle(filter);
        return message.reply({ embeds: [Embeds.success('🎚️ Filter', `Toggled **${filter}** filter!`)], allowedMentions: { repliedUser: false } });
      } catch (e) {
        return message.reply({ embeds: [Embeds.error('Error', `Failed to toggle filter: ${e.message}`)], allowedMentions: { repliedUser: false } });
      }
    },
  },
  {
    name: 'clearfilters',
    description: 'Clear all audio filters',
    category: 'music',
    permission: 'everyone',
    async execute(client, message) {
      const player = client.lavalink?.manager?.getPlayer(message.guild.id);
      if (!player) {
        return message.reply({ embeds: [Embeds.error('No Player', 'There is no active music player.')], allowedMentions: { repliedUser: false } });
      }
      await player.filterManager.clearFilters();
      return message.reply({ embeds: [Embeds.success('🧹 Cleared', 'All filters cleared.')], allowedMentions: { repliedUser: false } });
    },
  },
  {
    name: 'speed',
    description: 'Set playback speed',
    category: 'music',
    permission: 'everyone',
    usage: '<0.5-2.0>',
    async execute(client, message, args) {
      const player = client.lavalink?.manager?.getPlayer(message.guild.id);
      if (!player) {
        return message.reply({ embeds: [Embeds.error('No Player', 'There is no active music player.')], allowedMentions: { repliedUser: false } });
      }
      const speed = parseFloat(args[0]);
      if (isNaN(speed) || speed < 0.5 || speed > 2) {
        return message.reply({ embeds: [Embeds.error('Usage', '`@Zike speed <0.5-2.0>`')], allowedMentions: { repliedUser: false } });
      }
      try {
        await player.setFilters({ timescale: { speed } });
        return message.reply({ embeds: [Embeds.success('⚡ Speed', `Playback speed set to **${speed}x**`)], allowedMentions: { repliedUser: false } });
      } catch (e) {
        return message.reply({ embeds: [Embeds.error('Error', e.message)], allowedMentions: { repliedUser: false } });
      }
    },
  },
  {
    name: 'nodes',
    description: 'View Lavalink node status',
    category: 'music',
    permission: 'everyone',
    async execute(client, message) {
      if (!client.lavalink?.manager) {
        return message.reply({ embeds: [Embeds.error('Not Initialized', 'Lavalink manager is not initialized.')], allowedMentions: { repliedUser: false } });
      }
      const nodes = client.lavalink.manager.nodeManager.nodes;
      const list = nodes.map(n => `${n.connected ? '🟢' : '🔴'} **${n.id}** — \`${n.options.host}:${n.options.port}\`${n.connected ? ` (${Math.round(n.stats?.players || 0)} players)` : ''}`).join('\n');
      const connected = nodes.filter(n => n.connected).length;
      return message.reply({ embeds: [Embeds.primary('🎵 Lavalink Nodes', `**${connected}/${nodes.size}** nodes connected`).addFields({ name: 'Nodes', value: list })], allowedMentions: { repliedUser: false } });
    },
  },
];

module.exports = musicCommands;
