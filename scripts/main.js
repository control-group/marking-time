import { MODULE_NAME } from './config.js';
import { SettingsManager } from './settings.js';
import { ControlsManager } from './ui/controls.js';
import { HookManager } from './hooks/base-hooks.js';
import { TimestampManager } from './core/timestamp-manager.js';

/**
 * Marking Time
 * A Foundry VTT module to automatically generate timestamp files marking noteworthy events
 * in a session to sync with Da Vinci Resolve
 */
export class MarkingTime {
  /**
   * Initialize the module
   */
  static init() {
    console.log(`${MODULE_NAME} | Initializing`);
    
    // Register module settings
    SettingsManager.registerSettings();
    
    // Setup UI
    ControlsManager.setupControls();
    
    // Register hooks
    HookManager.registerHooks();
    
    // Initialize timestamp manager when game is ready
    Hooks.once('ready', () => {
      TimestampManager.initialize();
    });
  }
}

// Initialize the module
Hooks.once('init', () => {
  MarkingTime.init();
});