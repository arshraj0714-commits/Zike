const fs = require('fs');
const path = require('path');
const config = require('../config');

/**
 * Simple JSON-based database for persistent storage
 * Works perfectly on Railway (uses volume or ephemeral)
 */
class Database {
  constructor() {
    this.dataDir = path.resolve(config.dataDir);
    this.cache = new Map();
    this.ensureDir();
    // Load all existing data files
    this.loadAll();
  }

  ensureDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  getFilePath(key) {
    // Group keys by namespace (first part before _)
    const namespace = key.split('_')[0] || 'misc';
    return path.join(this.dataDir, `${namespace}.json`);
  }

  loadAll() {
    if (!fs.existsSync(this.dataDir)) return;
    const files = fs.readdirSync(this.dataDir).filter(f => f.endsWith('.json'));
    for (const file of files) {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(this.dataDir, file), 'utf8'));
        for (const [key, value] of Object.entries(data)) {
          this.cache.set(key, value);
        }
      } catch (e) {
        console.error(`Error loading ${file}:`, e.message);
      }
    }
  }

  saveToDisk() {
    // Group by namespace
    const grouped = {};
    for (const [key, value] of this.cache.entries()) {
      const namespace = key.split('_')[0] || 'misc';
      if (!grouped[namespace]) grouped[namespace] = {};
      grouped[namespace][key] = value;
    }
    // Write each namespace file
    for (const [namespace, data] of Object.entries(grouped)) {
      const filePath = path.join(this.dataDir, `${namespace}.json`);
      try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      } catch (e) {
        console.error(`Error saving ${namespace}:`, e.message);
      }
    }
  }

  get(key, defaultValue = null) {
    if (this.cache.has(key)) return this.cache.get(key);
    return defaultValue;
  }

  set(key, value) {
    this.cache.set(key, value);
    this.saveToDisk();
    return value;
  }

  delete(key) {
    const deleted = this.cache.delete(key);
    this.saveToDisk();
    return deleted;
  }

  has(key) {
    return this.cache.has(key);
  }

  all() {
    const result = {};
    for (const [key, value] of this.cache.entries()) {
      result[key] = value;
    }
    return result;
  }

  /**
   * Get all keys matching a pattern
   */
  keys(pattern) {
    const allKeys = Array.from(this.cache.keys());
    if (!pattern) return allKeys;
    // Convert glob to regex
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return allKeys.filter(k => regex.test(k));
  }

  /**
   * Increment a numeric value
   */
  increment(key, amount = 1) {
    const current = this.get(key, 0);
    const newValue = (typeof current === 'number' ? current : 0) + amount;
    this.set(key, newValue);
    return newValue;
  }

  /**
   * Push to an array
   */
  push(key, value) {
    const arr = this.get(key, []);
    arr.push(value);
    this.set(key, arr);
    return arr;
  }

  /**
   * Remove from array
   */
  pull(key, value) {
    const arr = this.get(key, []);
    const filtered = arr.filter(v => v !== value);
    this.set(key, filtered);
    return filtered;
  }

  /**
   * Add to a set
   */
  addToSet(key, value) {
    const arr = this.get(key, []);
    if (!arr.includes(value)) {
      arr.push(value);
      this.set(key, arr);
    }
    return arr;
  }
}

// Singleton instance
const instance = new Database();
module.exports = instance;
