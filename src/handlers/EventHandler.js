const fs = require('fs');
const path = require('path');

/**
 * Event Handler for Zike
 * Loads all event files from the events directory
 */
class EventHandler {
  constructor(client) {
    this.client = client;
    this.events = new Map();
  }

  async loadEvents() {
    const eventsDir = path.join(__dirname, '..', 'events');
    if (!fs.existsSync(eventsDir)) {
      console.warn('   ⚠️ Events directory not found!');
      return;
    }

    const files = fs.readdirSync(eventsDir).filter(f => f.endsWith('.js'));
    let loaded = 0;
    const loadedNames = [];

    for (const file of files) {
      try {
        const filePath = path.join(eventsDir, file);
        delete require.cache[require.resolve(filePath)];
        const event = require(filePath);

        if (!event.name || !event.execute) {
          console.warn(`   ⚠️ Skipping ${file}: missing name or execute`);
          continue;
        }

        const execute = (...args) => event.execute(this.client, ...args);

        if (event.once) {
          this.client.once(event.name, execute);
        } else {
          this.client.on(event.name, execute);
        }

        this.events.set(event.name, event);
        loadedNames.push(event.name);
        loaded++;
      } catch (error) {
        console.error(`   ❌ Error loading event ${file}:`, error.message);
      }
    }

    console.log(`   ✅ Loaded ${loaded} events: ${loadedNames.join(', ')}`);
  }
}

module.exports = EventHandler;
