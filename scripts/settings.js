import { MODULE_NAME, SESSION_START_TIME, TIMESTAMPS, IS_TRACKING } from './config.js';

/**
 * Register and manage module settings
 */
export class SettingsManager {
  /**
   * Register all module settings
   */
  static registerSettings() {
    // Session start time (used for calculating elapsed time)
    game.settings.register(MODULE_NAME, SESSION_START_TIME, {
      name: "Session Start Time",
      hint: "The timestamp when the session tracking started",
      scope: "world",
      config: false,
      type: Number,
      default: 0
    });
    
    // Timestamps array storage
    game.settings.register(MODULE_NAME, TIMESTAMPS, {
      name: "Timestamps",
      hint: "Array of recorded timestamps",
      scope: "world",
      config: false,
      type: Object,
      default: []
    });
    
    // Tracking state
    game.settings.register(MODULE_NAME, IS_TRACKING, {
      name: "Tracking Active",
      hint: "Whether timestamp tracking is currently active",
      scope: "world",
      config: false,
      type: Boolean,
      default: false
    });
    
    // Event tracking options
    game.settings.register(MODULE_NAME, 'trackCombat', {
      name: "Track Combat",
      hint: "Record timestamps for combat start, end, and rounds",
      scope: "world",
      config: true,
      type: Boolean,
      default: true
    });
    
    game.settings.register(MODULE_NAME, 'trackSceneChanges', {
      name: "Track Scene Changes",
      hint: "Record timestamps when the active scene changes",
      scope: "world",
      config: true,
      type: Boolean,
      default: true
    });
    
    game.settings.register(MODULE_NAME, 'trackDiceRolls', {
      name: "Track Significant Dice Rolls",
      hint: "Record timestamps for critical hits, fumbles, and other significant rolls",
      scope: "world",
      config: true,
      type: Boolean,
      default: true
    });
    
    game.settings.register(MODULE_NAME, 'viewerUserId', {
      name: "Viewer User ID",
      hint: "The User ID of the 'Viewer' account used for recording (leave empty for no targeting)",
      scope: "world",
      config: true,
      type: String,
      default: ""
    });

    console.log(`${MODULE_NAME} | Settings registered`);
  }

  /**
   * Get a module setting
   * @param {string} key - The setting key
   * @returns {any} The setting value
   */
  static getSetting(key) {
    return game.settings.get(MODULE_NAME, key);
  }

  /**
   * Set a module setting
   * @param {string} key - The setting key
   * @param {any} value - The value to set
   * @returns {Promise} Promise that resolves when the setting is updated
   */
  static async setSetting(key, value) {
    return await game.settings.set(MODULE_NAME, key, value);
  }
}