const fs = require('fs');
const path = require('path');

/**
 * Command Handler for Zike
 * Loads all command files from the commands directory
 * Each file exports an array of command objects
 */
class CommandHandler {
  constructor(client) {
    this.client = client;
    this.commands = new Map();
    this.categories = new Map();
  }

  async loadCommands() {
    const commandsDir = path.join(__dirname, '..', 'commands');
    if (!fs.existsSync(commandsDir)) return;

    const files = fs.readdirSync(commandsDir).filter(f => f.endsWith('.js'));
    let totalCommands = 0;

    for (const file of files) {
      try {
        const filePath = path.join(commandsDir, file);
        // Clear cache for hot reload
        delete require.cache[require.resolve(filePath)];
        const moduleExport = require(filePath);

        // Module can be a single command or array of commands
        const commands = Array.isArray(moduleExport) ? moduleExport : [moduleExport];

        for (const cmd of commands) {
          if (!cmd.name) continue;

          // Store command
          this.commands.set(cmd.name.toLowerCase(), cmd);

          // Store aliases
          if (cmd.aliases && Array.isArray(cmd.aliases)) {
            for (const alias of cmd.aliases) {
              this.commands.set(alias.toLowerCase(), { ...cmd, _isAlias: true });
            }
          }

          // Categorize
          const category = cmd.category || 'utility';
          if (!this.categories.has(category)) {
            this.categories.set(category, []);
          }
          this.categories.get(category).push(cmd);

          totalCommands++;
        }
      } catch (error) {
        console.error(`Error loading command file ${file}:`, error.message);
      }
    }

    console.log(`   ✅ Loaded ${totalCommands} commands across ${this.categories.size} categories`);
    const catList = [];
    for (const [cat, cmds] of this.categories.entries()) {
      catList.push(`${cat}(${cmds.length})`);
    }
    console.log(`   📦 Categories: ${catList.join(', ')}`);
  }

  get(name) {
    return this.commands.get(name.toLowerCase());
  }

  has(name) {
    return this.commands.has(name.toLowerCase());
  }

  getByCategory(category) {
    return this.categories.get(category) || [];
  }

  getAll() {
    const uniqueCommands = new Map();
    for (const [name, cmd] of this.commands.entries()) {
      if (!cmd._isAlias) {
        uniqueCommands.set(name, cmd);
      }
    }
    return Array.from(uniqueCommands.values());
  }

  getCategories() {
    return Array.from(this.categories.keys());
  }

  getCategoryStats() {
    const stats = {};
    for (const [category, commands] of this.categories.entries()) {
      stats[category] = commands.length;
    }
    return stats;
  }
}

module.exports = CommandHandler;
