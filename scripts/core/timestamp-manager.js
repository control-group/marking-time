import { MODULE_NAME, SESSION_START_TIME, TIMESTAMPS, IS_TRACKING, TIMESTAMP_TYPES } from '../config.js';
import { SettingsManager } from '../settings.js';

/**
 * Manages recording and storing timestamps
 */
export class TimestampManager {
    static timestamps = [];
    static isTracking = false;

    /**
     * Initialize the timestamp manager
     */
    static initialize() {
        // Only initialize if the game is ready
        if (!game.ready) return;

        this.timestamps = SettingsManager.getSetting(TIMESTAMPS) || [];
        this.isTracking = SettingsManager.getSetting(IS_TRACKING);

        console.log(`${MODULE_NAME} | TimestampManager initialized, tracking state:`, this.isTracking);
    }

    /**
     * Start tracking session timestamps
     */
    static async startTracking() {
        if (!game.ready) {
            ui.notifications.error("Marking Time: Cannot start tracking until game is fully loaded");
            return false;
        }

        try {
            const startTime = new Date();

            // Store the start time
            await SettingsManager.setSetting(SESSION_START_TIME, startTime.getTime());

            // Reset the timestamps array
            this.timestamps = [];
            await SettingsManager.setSetting(TIMESTAMPS, this.timestamps);

            // Set tracking flag
            this.isTracking = true;
            await SettingsManager.setSetting(IS_TRACKING, true);

            // Create a visible marker in chat
            this.createSyncMarker(startTime);

            // Explicitly record the sync point timestamp
            await this.recordTimestamp(TIMESTAMP_TYPES.SYNC_POINT, 'Session tracking started', 'Reference point for timeline sync');

            ui.notifications.info("Marking Time: Session tracking started");
            return true;
        } catch (error) {
            console.error(`${MODULE_NAME} | Error starting tracking:`, error);
            ui.notifications.error("Marking Time: Error starting session tracking");
            return false;
        }
    }

    /**
     * Stop tracking session timestamps
     */
    static async stopTracking() {
        if (!game.ready) {
            ui.notifications.error("Marking Time: Cannot stop tracking until game is fully loaded");
            return false;
        }

        try {
            // Record the end timestamp
            await this.recordTimestamp(TIMESTAMP_TYPES.SESSION_END, 'Session tracking ended', 'Final timestamp');

            // Set tracking flag
            this.isTracking = false;
            await SettingsManager.setSetting(IS_TRACKING, false);

            ui.notifications.info("Marking Time: Session tracking ended");
            return true;
        } catch (error) {
            console.error(`${MODULE_NAME} | Error stopping tracking:`, error);
            ui.notifications.error("Marking Time: Error stopping session tracking");
            return false;
        }
    }

    /**
     * Create a sync marker in the chat that will be visible in the recording
     */
    static createSyncMarker(startTime) {
        // Format time for display: HH:MM:SS format
        const timeString = startTime.toLocaleTimeString();

        // Get the viewer user ID if specified
        const viewerUserId = SettingsManager.getSetting('viewerUserId');
        const whisperArray = viewerUserId ? [viewerUserId] : [];

        // Create a styled chat message
        ChatMessage.create({
            content: `<div class="marking-time-sync-marker">
                  <h3>TIMESTAMP TRACKING STARTED</h3>
                  <p>Clock Time: ${timeString}</p>
                </div>`,
            user: game.user.id,
            whisper: whisperArray
        });
    }

    /**
     * Record a timestamp
     */
    static async recordTimestamp(type, description, details = '') {
        // Only record if we're tracking and the game is ready
        if (!this.isTracking || !game.ready) return;

        const currentTime = new Date();
        const startTime = new Date(SettingsManager.getSetting(SESSION_START_TIME));

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
        await SettingsManager.setSetting(TIMESTAMPS, this.timestamps);

        console.log(`${MODULE_NAME} | Recorded timestamp:`, timestamp);
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
     * Toggle tracking state
     */
    static async toggleTracking() {
        if (!game.ready) {
            ui.notifications.error("Marking Time: Cannot toggle tracking until game is fully loaded");
            return;
        }

        const currentState = SettingsManager.getSetting(IS_TRACKING);
        console.log(`${MODULE_NAME} | Current tracking state before toggle:`, currentState);

        try {
            if (currentState) {
                await this.stopTracking();
            } else {
                await this.startTracking();
            }

            // Update UI after a small delay to ensure settings are updated
            setTimeout(() => {
                const newState = SettingsManager.getSetting(IS_TRACKING);
                console.log(`${MODULE_NAME} | New tracking state after toggle:`, newState);
                ui.controls.initialize();
            }, 100);
        } catch (error) {
            console.error(`${MODULE_NAME} | Error toggling tracking:`, error);
            ui.notifications.error("Marking Time: Error toggling tracking state");
        }
    }
}