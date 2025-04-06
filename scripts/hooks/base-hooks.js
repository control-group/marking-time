import { SettingsManager } from '../settings.js';
import { CombatHooks } from './combat-hooks.js';
import { SceneHooks } from './scene-hooks.js';
import { RollHooks } from './roll-hooks.js';

/**
 * Manages hook registration for the module
 */
export class HookManager {
  /**
   * Register all hooks based on settings
   */
  static registerHooks() {
    // Wait for the game to be ready before registering event hooks
    Hooks.once('ready', () => {
      console.log(`Marking Time | Registering hooks based on settings`);
      
      // Register hooks depending on settings
      if (SettingsManager.getSetting('trackCombat')) {
        CombatHooks.register();
      }
      
      if (SettingsManager.getSetting('trackSceneChanges')) {
        SceneHooks.register();
      }
      
      if (SettingsManager.getSetting('trackDiceRolls')) {
        RollHooks.register();
      }
    });
  }
}