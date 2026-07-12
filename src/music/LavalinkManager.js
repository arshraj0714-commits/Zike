const { LavalinkManager } = require('lavalink-client');

/**
 * Lavalink Manager for Zike
 * Uses public free Lavalink nodes for music playback
 *
 * Public nodes are community-provided and may be unstable.
 * You can replace these with your own Lavalink node or other public ones.
 *
 * Find more public nodes at:
 * - https://lavalink.darrennathanael.com/
 * - https://lavalink-list.benoi.fr/
 */
class ZikeLavalinkManager {
  constructor(client) {
    this.client = client;
    this.manager = null;
    this.initialized = false;
    this.enabled = process.env.MUSIC_ENABLED !== 'false'; // Music on by default
    this.nodes = this.parseNodes();
  }

  /**
   * Parse Lavalink nodes from environment variables
   * Format: LAVALINK_NODES="name|host|port|password|secure,name2|host2|port2|password2|secure2"
   * Or use default public nodes
   *
   * IMPORTANT: lavalink-client v2.x uses 'authorization' NOT 'password'
   */
  parseNodes() {
    const envNodes = process.env.LAVALINK_NODES;
    if (envNodes && envNodes.trim()) {
      try {
        const parsed = envNodes.split(',').map(nodeStr => {
          const parts = nodeStr.split('|');
          const [name, host, port, password, secure] = parts;
          return {
            id: name?.trim() || `node-${Math.random().toString(36).slice(2, 8)}`,
            host: host?.trim(),
            port: parseInt(port) || 2333,
            authorization: password?.trim() || 'youshallnotpass',
            secure: secure?.trim() === 'true' || false,
          };
        }).filter(n => n.host); // Only keep nodes with a host
        if (parsed.length > 0) {
          console.log(`   📡 Parsed ${parsed.length} custom Lavalink node(s) from env`);
          return parsed;
        }
      } catch (e) {
        console.warn('   ⚠️ Failed to parse LAVALINK_NODES, using defaults:', e.message);
      }
    }

    // Default public free Lavalink nodes
    // These are community-provided nodes. They may go down or change credentials.
    // Check https://lavalink.darrennathanael.com/ for updated working nodes.
    // Note: field is 'authorization' (NOT 'password') in lavalink-client v2.x
    // Note: if secure=true, port MUST be 443 (lavalink-client v2.x validation)
    return [
      {
        id: 'node1',
        host: 'lavalink.islantay.tk',
        port: 8880,
        authorization: 'iswa()lavalink4293',
        secure: false,
      },
      {
        id: 'node2',
        host: 'lavalink2.devz.cloud',
        port: 443,
        authorization: 'devzcloud',
        secure: true,
      },
      {
        id: 'node3',
        host: 'lava.devytplabs.xyz',
        port: 443,
        authorization: 'devytplabs.xyz',
        secure: true,
      },
      {
        id: 'node4',
        host: 'lavalink.jommy.co.in',
        port: 443,
        authorization: 'jommylavalink',
        secure: true,
      },
      {
        id: 'node5',
        host: 'lavalink.somethinghaha.com',
        port: 443,
        authorization: 'somethinghaha',
        secure: true,
      },
    ];
  }

  /**
   * Initialize the Lavalink manager
   * Wrapped in try/catch so music failures don't crash the bot
   */
  initialize() {
    if (!this.enabled) {
      console.log('   ⏭️  Music disabled (MUSIC_ENABLED=false)');
      return null;
    }

    if (this.nodes.length === 0) {
      console.warn('   ⚠️ No Lavalink nodes configured. Music commands will not work.');
      return null;
    }

    try {
      this.manager = new LavalinkManager({
        nodes: this.nodes,
        sendToShard: (guildId, payload) => {
          const guild = this.client.guilds.cache.get(guildId);
          if (guild) guild.shard.send(payload);
        },
        autoSkip: true,
        client: {
          id: this.client.user.id,
          username: 'Zike',
        },
        playerOptions: {
          defaultVolume: 50,
          maxVolume: 150,
        },
        queueOptions: {
          maxPreviousTracks: 25,
        },
      });

      // Event listeners
      this.setupEventListeners();

      this.initialized = true;
      console.log(`   ✅ Lavalink manager initialized with ${this.nodes.length} node(s)`);
      return this.manager;
    } catch (error) {
      console.error('   ❌ Failed to initialize Lavalink manager:', error.message);
      console.error('   ⚠️  Music features will be disabled. Bot will continue running without music.');
      this.manager = null;
      this.initialized = false;
      return null;
    }
  }

  /**
   * Setup all Lavalink event listeners
   */
  setupEventListeners() {
    if (!this.manager) return;

    this.manager.on('trackStart', async (player, track) => {
      try {
        const channel = this.client.channels.cache.get(player.textChannelId);
        if (channel) {
          const Embeds = require('../utils/Embeds');
          const Helpers = require('../utils/Helpers');
          const requester = track.requester ? `<@${track.requester.id}>` : 'Unknown';
          channel.send({
            embeds: [Embeds.primary('🎵 Now Playing', `**${track.info.title}**\nBy: ${track.info.author}\nDuration: ${Helpers.formatDuration(track.info.duration)}\nRequested by: ${requester}`)
              .setThumbnail(track.info.artworkUrl || null)],
          }).catch(() => {});
        }
      } catch (e) {
        console.error('trackStart event error:', e.message);
      }
    });

    this.manager.on('queueEnd', async (player) => {
      try {
        const channel = this.client.channels.cache.get(player.textChannelId);
        if (channel) {
          const Embeds = require('../utils/Embeds');
          channel.send({
            embeds: [Embeds.info('📋 Queue Ended', 'The queue has ended. Use `@Zike play <song>` to add more!')],
          }).catch(() => {});
        }
      } catch (e) {
        console.error('queueEnd event error:', e.message);
      }
    });

    this.manager.on('playerDisconnect', async (player) => {
      try {
        if (player) player.destroy();
      } catch (e) {
        console.error('playerDisconnect error:', e.message);
      }
    });

    this.manager.on('nodeConnect', (node) => {
      console.log(`   ✅ Lavalink node connected: ${node.options.id} (${node.options.host}:${node.options.port})`);
    });

    this.manager.on('nodeDisconnect', (node, reason) => {
      console.warn(`   ⚠️ Lavalink node disconnected: ${node.options.id} - ${reason?.reason || 'Unknown'}`);
    });

    this.manager.on('nodeError', (node, error) => {
      console.error(`   ❌ Lavalink node error [${node.options.id}]:`, error.message);
    });
  }

  /**
   * Get the player for a guild, or create one
   */
  async getPlayer(guild, voiceChannel, textChannel) {
    if (!this.manager) throw new Error('Lavalink manager not initialized');
    let player = this.manager.getPlayer(guild.id);
    if (!player) {
      player = await this.manager.createPlayer({
        guildId: guild.id,
        voiceChannelId: voiceChannel.id,
        textChannelId: textChannel.id,
        selfDeaf: true,
      });
    }
    return player;
  }

  /**
   * Check if any nodes are connected
   */
  hasConnectedNodes() {
    if (!this.manager) return false;
    try {
      return this.manager.nodeManager.nodes.some(n => n.connected);
    } catch {
      return false;
    }
  }

  /**
   * Check if music is available
   */
  isAvailable() {
    return this.manager !== null && this.initialized;
  }
}

module.exports = ZikeLavalinkManager;
