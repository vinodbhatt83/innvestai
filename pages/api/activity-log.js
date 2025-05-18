// API endpoint for activity logging
import { withAuth } from '../../middleware/auth';
import { pool } from '../../lib/db';

// Create activity log table if it doesn't exist
async function ensureActivityLogTableExists() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        log_id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        action VARCHAR(50) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id INT NOT NULL,
        details TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
      )
    `);
  } catch (error) {
    console.error('Error ensuring activity log table exists:', error);
  } finally {
    client.release();
  }
}

// Handle logging an activity
async function logActivity(data) {
  const client = await pool.connect();
  try {
    // Ensure table exists
    await ensureActivityLogTableExists();
    
    // Insert activity log
    const result = await client.query(
      `INSERT INTO activity_logs 
       (user_id, action, entity_type, entity_id, details, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING log_id`,
      [
        data.user_id,
        data.action,
        data.entity_type,
        data.entity_id,
        data.details,
        data.timestamp || new Date()
      ]
    );
    
    return { success: true, log_id: result.rows[0].log_id };
  } catch (error) {
    console.error('Error logging activity:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Handle getting activity logs for an entity
async function getActivityLogs(entityType, entityId, limit = 100) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT al.*, u.username, u.email
       FROM activity_logs al
       JOIN users u ON al.user_id = u.user_id
       WHERE al.entity_type = $1 AND al.entity_id = $2
       ORDER BY al.timestamp DESC
       LIMIT $3`,
      [entityType, entityId, limit]
    );
    
    return result.rows;
  } catch (error) {
    console.error('Error getting activity logs:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const result = await logActivity(req.body);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ error: 'Error logging activity' });
    }
  } else if (req.method === 'GET') {
    try {
      const { entity_type, entity_id, limit } = req.query;
      
      if (!entity_type || !entity_id) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }
      
      const logs = await getActivityLogs(
        entity_type, 
        parseInt(entity_id), 
        limit ? parseInt(limit) : 100
      );
      
      return res.status(200).json({ logs });    } catch (error) {
      return res.status(500).json({ error: 'Error getting activity logs' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Export with auth middleware
export default withAuth(handler);
