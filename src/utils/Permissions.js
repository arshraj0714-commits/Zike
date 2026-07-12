const config = require('../config');

/**
 * Permission system for Zike bot
 * Hierarchy: Owner > Staff Role > Whitelisted > Everyone
 */
class Permissions {
  constructor(database) {
    this.db = database;
  }

  /**
   * Check if user is the bot owner (Arsh)
   */
  isOwner(userId) {
    return userId === config.owner.id;
  }

  /**
   * Check if user has the staff role (set in .env or DB)
   */
  isStaff(member) {
    if (!member || !member.roles) return false;
    // Owner is always staff
    if (this.isOwner(member.id)) return true;
    // Check configured staff role
    if (config.staffRoleId && member.roles.cache.has(config.staffRoleId)) return true;
    // Check DB-configured staff roles per guild
    const guildStaffRoles = this.db.get(`staff_roles_${member.guild.id}`) || [];
    return member.roles.cache.some(role => guildStaffRoles.includes(role.id));
  }

  /**
   * Check if user is admin (has administrator permission or is staff)
   */
  isAdmin(member) {
    if (!member || !member.permissions) return false;
    if (this.isOwner(member.id)) return true;
    return member.permissions.has('Administrator');
  }

  /**
   * Check if user is moderator (has mod permissions)
   */
  isModerator(member) {
    if (!member || !member.permissions) return false;
    if (this.isOwner(member.id)) return true;
    return member.permissions.has(['ManageMessages', 'KickMembers', 'BanMembers']);
  }

  /**
   * Check if user can use AI chat (whitelisted)
   */
  canUseAI(userId) {
    if (this.isOwner(userId)) return true;
    return config.ai.whitelist.includes(userId);
  }

  /**
   * Check if user can use a specific command
   * Returns { allowed: boolean, reason?: string }
   */
  canUseCommand(member, command, guildId) {
    const userId = member?.id || member;

    // Owner can use everything
    if (this.isOwner(userId)) {
      return { allowed: true };
    }

    // Check command permission level
    switch (command.permission) {
      case 'owner':
        return { allowed: false, reason: 'This command is restricted to the bot owner only.' };

      case 'staff':
        if (!this.isStaff(member)) {
          return { allowed: false, reason: 'You need the staff role to use this command.' };
        }
        return { allowed: true };

      case 'admin':
        if (!this.isAdmin(member)) {
          return { allowed: false, reason: 'You need Administrator permissions to use this command.' };
        }
        return { allowed: true };

      case 'moderator':
        if (!this.isModerator(member)) {
          return { allowed: false, reason: 'You need moderation permissions to use this command.' };
        }
        return { allowed: true };

      case 'everyone':
      default:
        return { allowed: true };
    }
  }

  /**
   * Set a staff role for a guild
   */
  setStaffRole(guildId, roleId) {
    const roles = this.db.get(`staff_roles_${guildId}`) || [];
    if (!roles.includes(roleId)) {
      roles.push(roleId);
      this.db.set(`staff_roles_${guildId}`, roles);
    }
  }

  /**
   * Remove a staff role from a guild
   */
  removeStaffRole(guildId, roleId) {
    const roles = this.db.get(`staff_roles_${guildId}`) || [];
    const filtered = roles.filter(r => r !== roleId);
    this.db.set(`staff_roles_${guildId}`, filtered);
  }

  /**
   * Get all staff roles for a guild
   */
  getStaffRoles(guildId) {
    return this.db.get(`staff_roles_${guildId}`) || [];
  }
}

module.exports = Permissions;
