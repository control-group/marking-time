import { MODULE_NAME, TIMESTAMP_TYPES } from '../config.js';
import { TimestampManager } from '../core/timestamp-manager.js';

/**
 * Manages scene-related hooks
 */
export class SceneHooks {
  /**
   * Register scene-related hooks
   */
  static register() {
    console.log(`${MODULE_NAME} | Registering scene hooks`);
    Hooks.on('canvasReady', this.onSceneChange.bind(this));
  }

  /**
   * Handle scene change event
   */
  static onSceneChange() {
    if (!canvas.scene) return;
    TimestampManager.recordTimestamp(TIMESTAMP_TYPES.SCENE_CHANGE, `Scene changed to ${canvas.scene.name}`, `New scene activated`);
  }
}