import { MODULE_NAME, IS_TRACKING } from '../config.js';
import { SettingsManager } from '../settings.js';
import { TimestampManager } from '../core/timestamp-manager.js';
import { ExportManager } from '../core/export-manager.js';

/**
 * Manages UI controls for the module
 */
export class ControlsManager {
  /**
   * Set up the module's user interface
   */
  static setupControls() {
    // Add a button to the scene controls
    Hooks.on('getSceneControlButtons', (controls) => {
      // Always fetch the current tracking state from settings
      const isCurrentlyTracking = SettingsManager.getSetting(IS_TRACKING);
      console.log(`${MODULE_NAME} | Setting up UI, tracking state:`, isCurrentlyTracking);
      
      controls.push({
        name: 'marking-time',
        title: 'Marking Time',
        icon: 'fas fa-clock',
        layer: 'controls',
        tools: [
          {
            name: 'start-tracking',
            title: isCurrentlyTracking ? 'Stop Tracking' : 'Start Tracking', 
            icon: isCurrentlyTracking ? 'fas fa-stop' : 'fas fa-play',
            onClick: () => TimestampManager.toggleTracking(),
            button: true
          },
          {
            name: 'mark-moment',
            title: 'Mark Important Moment',
            icon: 'fas fa-bookmark',
            onClick: () => this.openMarkerForm(),
            button: true,
            active: isCurrentlyTracking,
            disabled: !isCurrentlyTracking // Disable if not tracking
          },
          {
            name: 'export-timestamps',
            title: 'Export Timestamps',
            icon: 'fas fa-file-export',
            onClick: () => ExportManager.exportTimestamps(),
            button: true
          }
        ]
      });
    });
  }

  /**
   * Open the marker form dialog
   */
  static openMarkerForm() {
    if (!SettingsManager.getSetting(IS_TRACKING)) {
      ui.notifications.warn("Marking Time: Cannot mark moment - tracking is not active");
      return;
    }
    
    // Get additional details via dialog
    new Dialog({
      title: "Mark Important Moment",
      content: `
        <form>
          <div class="form-group">
            <label>Description:</label>
            <input type="text" name="description" placeholder="Brief description" autofocus>
          </div>
          <div class="form-group">
            <label>Details (optional):</label>
            <textarea name="details" placeholder="Additional details"></textarea>
          </div>
        </form>
      `,
      buttons: {
        submit: {
          icon: '<i class="fas fa-check"></i>',
          label: "Mark",
          callback: (html) => {
            const description = html.find('[name="description"]').val();
            const details = html.find('[name="details"]').val();
            
            if (description) {
              TimestampManager.recordTimestamp('MANUAL_MARKER', description, details);
              ui.notifications.info(`Marking Time: Moment marked - "${description}"`);
            } else {
              ui.notifications.warn("Marking Time: Description is required");
            }
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: "Cancel"
        }
      },
      default: "submit"
    }).render(true);
  }
}