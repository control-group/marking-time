/**
 * Marking Time
 * A Foundry VTT module to automatically generate timestamp files marking noteworthy events
 * in a session to sync with Da Vinci Resolve
 */

class MarkingTime {
    static MODULE_NAME = 'marking-time';
    static SESSION_START_TIME = 'sessionStartTime';
    static TIMESTAMPS = 'timestamps';
    static DEFAULT_SETTINGS = {
      trackCombat: true,
      trackSceneChanges: true,
      trackDiceRolls: true,
      trackSpellCasting: true,
      viewerUserId: '',
    };
  
    /**
     * Initialize the module
     */
    static init() {
      // Register module settings
      this.registerSettings();
      
      // Initialize core functionalities
      this.timestamps = [];
      this.isTracking = false;
      
      // Create UI for control panel
      this.setupUI();
      
      // Register hooks
      this.registerHooks();
      
      console.log(`${this.MODULE_NAME} | Initialized`);
    }
  
    /**
     * Register module settings
     */
    static registerSettings() {
      // Session start time (used for calculating elapsed time)
      game.settings.register(this.MODULE_NAME, this.SESSION_START_TIME, {
        name: "Session Start Time",
        hint: "The timestamp when the session tracking started",
        scope: "world",
        config: false,
        type: Number,
        default: 0
      });
      
      // Timestamps array storage
      game.settings.register(this.MODULE_NAME, this.TIMESTAMPS, {
        name: "Timestamps",
        hint: "Array of recorded timestamps",
        scope: "world",
        config: false,
        type: Object,
        default: []
      });
      
      // Event tracking options
      game.settings.register(this.MODULE_NAME, 'trackCombat', {
        name: "Track Combat",
        hint: "Record timestamps for combat start, end, and rounds",
        scope: "world",
        config: true,
        type: Boolean,
        default: true
      });
      
      game.settings.register(this.MODULE_NAME, 'trackSceneChanges', {
        name: "Track Scene Changes",
        hint: "Record timestamps when the active scene changes",
        scope: "world",
        config: true,
        type: Boolean,
        default: true
      });
      
      game.settings.register(this.MODULE_NAME, 'trackDiceRolls', {
        name: "Track Significant Dice Rolls",
        hint: "Record timestamps for critical hits, fumbles, and other significant rolls",
        scope: "world",
        config: true,
        type: Boolean,
        default: true
      });
      
      game.settings.register(this.MODULE_NAME, 'viewerUserId', {
        name: "Viewer User ID",
        hint: "The User ID of the 'Viewer' account used for recording (leave empty for no targeting)",
        scope: "world",
        config: true,
        type: String,
        default: ""
      });
    }
  
    /**
     * Set up the module's user interface
     */
    static setupUI() {
      // Add a button to the scene controls
      Hooks.on('getSceneControlButtons', (controls) => {
        controls.push({
          name: 'marking-time',
          title: 'Marking Time',
          icon: 'fas fa-clock',
          layer: 'controls',
          tools: [
            {
              name: 'start-tracking',
              title: this.isTracking ? 'Stop Tracking' : 'Start Tracking', 
              icon: this.isTracking ? 'fas fa-stop' : 'fas fa-play',
              onClick: () => this.toggleTracking(),
              button: true
            },
            {
              name: 'mark-moment',
              title: 'Mark Important Moment',
              icon: 'fas fa-bookmark',
              onClick: () => this.markImportantMoment(),
              button: true,
              active: this.isTracking
            },
            {
              name: 'export-timestamps',
              title: 'Export Timestamps',
              icon: 'fas fa-file-export',
              onClick: () => this.exportTimestamps(),
              button: true
            }
          ]
        });
      });
    }
  
    /**
     * Register hooks for various events
     */
    static registerHooks() {
      // Register hooks depending on settings
      if (game.settings.get(this.MODULE_NAME, 'trackCombat')) {
        Hooks.on('combatStart', this.onCombatStart.bind(this));
        Hooks.on('combatEnd', this.onCombatEnd.bind(this));
        Hooks.on('combatRound', this.onCombatRound.bind(this));
      }
      
      if (game.settings.get(this.MODULE_NAME, 'trackSceneChanges')) {
        Hooks.on('canvasReady', this.onSceneChange.bind(this));
      }
      
      if (game.settings.get(this.MODULE_NAME, 'trackDiceRolls')) {
        Hooks.on('createChatMessage', this.onChatMessage.bind(this));
      }
    }
  
    /**
     * Toggle timestamp tracking on/off
     */
    static toggleTracking() {
      if (this.isTracking) {
        this.stopTracking();
      } else {
        this.startTracking();
      }
      
      // Refresh the UI to update button states
      ui.controls.render();
    }
  
    /**
     * Start tracking session timestamps
     */
    static startTracking() {
      const startTime = new Date();
      
      // Store the start time
      game.settings.set(this.MODULE_NAME, this.SESSION_START_TIME, startTime.getTime());
      
      // Reset the timestamps array
      this.timestamps = [];
      game.settings.set(this.MODULE_NAME, this.TIMESTAMPS, this.timestamps);
      
      // Set tracking flag
      this.isTracking = true;
      
      // Create a visible marker in chat
      this.createSyncMarker(startTime);
      
      ui.notifications.info("Marking Time: Session tracking started");
    }
  
    /**
     * Create a sync marker in the chat that will be visible in the recording
     */
    static createSyncMarker(startTime) {
      // Format time for display: HH:MM:SS format
      const timeString = startTime.toLocaleTimeString();
      
      // Get the viewer user ID if specified
      const viewerUserId = game.settings.get(this.MODULE_NAME, 'viewerUserId');
      const whisperArray = viewerUserId ? [viewerUserId] : [];
      
      // Create a styled chat message
      ChatMessage.create({
        content: `<div class="marking-time-sync-marker" style="background-color: #ff6600; color: white; padding: 5px; border-radius: 5px;">
                    <h3>TIMESTAMP TRACKING STARTED</h3>
                    <p>Clock Time: ${timeString}</p>
                  </div>`,
        user: game.user.id,
        whisper: whisperArray
      });
      
      // Record this as the first timestamp
      this.recordTimestamp('SYNC_POINT', 'Session tracking started', 'Reference point for timeline sync');
    }
  
    /**
     * Stop tracking session timestamps
     */
    static stopTracking() {
      // Record the end timestamp
      this.recordTimestamp('SESSION_END', 'Session tracking ended', 'Final timestamp');
      
      // Set tracking flag
      this.isTracking = false;
      
      ui.notifications.info("Marking Time: Session tracking ended");
    }
  
    /**
     * Record a timestamp
     */
    static recordTimestamp(type, description, details = '') {
      // Only record if we're tracking
      if (!this.isTracking) return;
      
      const currentTime = new Date();
      const startTime = new Date(game.settings.get(this.MODULE_NAME, this.SESSION_START_TIME));
      
      // Calculate elapsed time since session start
      const elapsedMs = currentTime.getTime() - startTime.getTime();
      const elapsedTime = this.formatElapsedTime(elapsedMs);
      
      // Format the absolute time
      const absoluteTime = currentTime.toLocaleString();
      
      // Create the timestamp object
      const timestamp = {
        type,
        absoluteTime,
        elapsedTime,
        description,
        details
      };
      
      // Add to timestamps array
      this.timestamps.push(timestamp);
      
      // Update the stored timestamps
      game.settings.set(this.MODULE_NAME, this.TIMESTAMPS, this.timestamps);
      
      console.log(`${this.MODULE_NAME} | Recorded timestamp:`, timestamp);
    }
  
    /**
     * Format elapsed time in HH:MM:SS format
     */
    static formatElapsedTime(milliseconds) {
      let seconds = Math.floor(milliseconds / 1000);
      let minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      
      seconds = seconds % 60;
      minutes = minutes % 60;
      
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  
    /**
     * Mark an important moment manually
     */
    static markImportantMoment() {
      if (!this.isTracking) {
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
                this.recordTimestamp('MANUAL_MARKER', description, details);
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
  
    /**
     * Export timestamps to CSV
     */
    static exportTimestamps() {
      const timestamps = game.settings.get(this.MODULE_NAME, this.TIMESTAMPS);
      
      if (!timestamps || timestamps.length === 0) {
        ui.notifications.warn("Marking Time: No timestamps to export");
        return;
      }
      
      // Create CSV content
      let csv = "Type,AbsoluteTime,ElapsedTime,Description,Details\n";
      
      for (const ts of timestamps) {
        // Escape fields for CSV
        const description = ts.description.replace(/"/g, '""');
        const details = ts.details.replace(/"/g, '""');
        
        csv += `"${ts.type}","${ts.absoluteTime}","${ts.elapsedTime}","${description}","${details}"\n`;
      }
      
      // Create a blob and download link
      const blob = new Blob([csv], { type: 'text/csv' });
      const date = new Date().toISOString().split('T')[0];
      const filename = `marking-time-${date}.csv`;
      
      // Create a temporary download link
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(a.href);
      }, 100);
      
      ui.notifications.info(`Marking Time: Exported ${timestamps.length} timestamps to ${filename}`);
    }
  
    // Event handler methods
    
    /**
     * Handle combat start event
     */
    static onCombatStart(combat) {
      const combatants = combat.combatants.map(c => c.name).join(', ');
      this.recordTimestamp('COMBAT_START', `Combat started`, `Combatants: ${combatants}`);
    }
    
    /**
     * Handle combat end event
     */
    static onCombatEnd(combat) {
      this.recordTimestamp('COMBAT_END', `Combat ended`, `Duration: ${combat.round} rounds`);
    }
    
    /**
     * Handle combat round change
     */
    static onCombatRound(combat, updateData) {
      const round = updateData.round;
      if (round > 1) { // Don't log the first round as it's covered by combat start
        this.recordTimestamp('COMBAT_ROUND', `Combat round ${round}`, `New round started`);
      }
    }
    
    /**
     * Handle scene change event
     */
    static onSceneChange() {
      if (!canvas.scene) return;
      this.recordTimestamp('SCENE_CHANGE', `Scene changed to ${canvas.scene.name}`, `New scene activated`);
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
            this.recordTimestamp('CRITICAL_SUCCESS', `${speaker} rolled a natural 20`, `Roll: ${roll.formula} = ${roll.total}`);
          }
          // Check for natural 1
          else if (results.includes(1)) {
            const speaker = message.speaker.alias || "Someone";
            this.recordTimestamp('CRITICAL_FAILURE', `${speaker} rolled a natural 1`, `Roll: ${roll.formula} = ${roll.total}`);
          }
        }
      }
    }
  }
  
  // Initialize the module
  Hooks.once('init', () => {
    MarkingTime.init();
  });