// Utility for logging user activities
import axios from 'axios';

/**
 * Save an activity log entry
 * @param {Object} logData - The activity data to log
 * @param {string} logData.user_id - The ID of the user performing the action
 * @param {string} logData.action - The type of action (e.g., CREATE_DEAL, UPDATE_DEAL, etc.)
 * @param {string} logData.entity_type - The type of entity being acted upon (e.g., DEAL, PROPERTY, etc.)
 * @param {string} logData.entity_id - The ID of the entity being acted upon
 * @param {string} logData.details - Additional details about the action
 * @returns {Promise} - A promise that resolves to the API response
 */
export const saveActivityLog = async (logData) => {
  try {
    const { user_id, action, entity_type, entity_id, details } = logData;
    
    // Basic validation
    if (!user_id || !action || !entity_type || !entity_id) {
      throw new Error('Missing required fields for activity log');
    }
    
    // Log to database
    const response = await fetch('/api/activity-log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id,
        action,
        entity_type,
        entity_id,
        details,
        timestamp: new Date().toISOString()
      })
    });
    
    return response.data;
  } catch (error) {
    // Just log the error but don't fail the main operation
    console.error('Error logging activity:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get activity logs for a specific entity
 * @param {string} entityType - The type of entity (e.g., DEAL, PROPERTY)
 * @param {string} entityId - The ID of the entity
 * @returns {Promise} - A promise that resolves to the activity logs
 */
export const getEntityActivityLogs = async (entityType, entityId) => {
  try {
    const response = await fetch(`/api/activity-log?entity_type=${entityType}&entity_id=${entityId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch activity logs');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    throw error;
  }
};
