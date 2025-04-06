import { MODULE_NAME, TIMESTAMP_TYPES } from '../config.js';
import { TimestampManager } from '../core/timestamp-manager.js';

/**
 * Manages combat-related hooks
 */
export class CombatHooks {
  /**
   * Register combat-related hooks
   */
  static register() {
    console.log(`${MODULE_NAME} | Registering combat hooks`);
    Hooks.on('combatStart', this.onCombatStart.bind(this));
    Hooks.on('combatEnd', this.onCombatEnd.bind(this));
    Hooks.on('combatRound', this.onCombatRound.bind(this));
  }

  /**
   * Handle combat start event
   */
  static onCombatStart(combat) {
    const combatants = combat.combatants.map(c => c.name).join(', ');
    TimestampManager.recordTimestamp(TIMESTAMP_TYPES.COMBAT_START, `Combat started`, `Combatants: ${combatants}`);
  }
  
  /**
   * Handle combat end event
   */
  static onCombatEnd(combat) {
    TimestampManager.recordTimestamp(TIMESTAMP_TYPES.COMBAT_END, `Combat ended`, `Duration: ${combat.round} rounds`);
  }
  
  /**
   * Handle combat round change
   */
  static onCombatRound(combat, updateData) {
    const round = updateData.round;
    if (round > 1) { // Don't log the first round as it's covered by combat start
      TimestampManager.recordTimestamp(TIMESTAMP_TYPES.COMBAT_ROUND, `Combat round ${round}`, `New round started`);
    }
  }
}