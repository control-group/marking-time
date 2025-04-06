import { MODULE_NAME, TIMESTAMP_TYPES } from '../config.js';
import { TimestampManager } from '../core/timestamp-manager.js';

/**
 * Manages dice roll hooks
 */
export class RollHooks {
  /**
   * Register dice roll hooks
   */
  static register() {
    console.log(`${MODULE_NAME} | Registering dice roll hooks`);
    Hooks.on('createChatMessage', this.onChatMessage.bind(this));
  }

  /**
   * Handle chat message creation for dice rolls
   */
  static onChatMessage(message) {
    if (!message.isRoll) return;
    
    const roll = message.rolls[0];
    if (!roll) return;
    
    // Check for critical successes or failures
    if (roll.dice && roll.dice.length > 0) {
      const d20 = roll.dice.find(d => d.faces === 20);
      if (d20) {
        const results = d20.results.map(r => r.result);
        // Check for natural 20
        if (results.includes(20)) {
          const speaker = message.speaker.alias || "Someone";
          TimestampManager.recordTimestamp(TIMESTAMP_TYPES.CRITICAL_SUCCESS, `${speaker} rolled a natural 20`, `Roll: ${roll.formula} = ${roll.total}`);
        }
        // Check for natural 1
        else if (results.includes(1)) {
          const speaker = message.speaker.alias || "Someone";
          TimestampManager.recordTimestamp(TIMESTAMP_TYPES.CRITICAL_FAILURE, `${speaker} rolled a natural 1`, `Roll: ${roll.formula} = ${roll.total}`);
        }
      }
    }
  }
}