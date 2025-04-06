/**
 * Configuration constants for the Marking Time module
 */
export const MODULE_NAME = 'marking-time';
export const SESSION_START_TIME = 'sessionStartTime';
export const TIMESTAMPS = 'timestamps';
export const IS_TRACKING = 'isTracking';

export const DEFAULT_SETTINGS = {
  trackCombat: true,
  trackSceneChanges: true,
  trackDiceRolls: true,
  viewerUserId: '',
};

export const TIMESTAMP_TYPES = {
  SYNC_POINT: 'SYNC_POINT',
  SESSION_END: 'SESSION_END',
  MANUAL_MARKER: 'MANUAL_MARKER',
  COMBAT_START: 'COMBAT_START',
  COMBAT_END: 'COMBAT_END',
  COMBAT_ROUND: 'COMBAT_ROUND',
  SCENE_CHANGE: 'SCENE_CHANGE',
  CRITICAL_SUCCESS: 'CRITICAL_SUCCESS',
  CRITICAL_FAILURE: 'CRITICAL_FAILURE'
};