import cron from 'node-cron';
import { pool } from './dbConnection.js';

// Run weekly snapshots every Sunday at 1:00 AM
export function initializeSnapshotJob() {
  cron.schedule('0 1 * * 0', async () => {
    console.log('Starting weekly inventory snapshot');
    await createSnapshot('weekly');
  });
}

// Function to create a snapshot
export async function createSnapshot(snapshotType = 'weekly', description = null) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get all businesses
    const businessResult = await client.query('SELECT business_id FROM business');
    
    for (const business of businessResult.rows) {
      const businessId = business.business_id;
      
      // Create snapshot record
      const snapshotResult = await client.query(
        `INSERT INTO inventory_snapshot (business_id, snapshot_type, description) 
         VALUES ($1, $2, $3)
         RETURNING snapshot_id`,
        [businessId, snapshotType, description]
      );
      
      const snapshotId = snapshotResult.rows[0].snapshot_id;
      
      // Capture item quantities
      await client.query(`
        INSERT INTO inventory_snapshot_item (snapshot_id, item_id, quantity_in_stock)
        SELECT $1, item_id, quantity_in_stock 
        FROM business_item
        WHERE business_id = $2
      `, [snapshotId, businessId]);
      
      // Capture location space utilization
      await client.query(`
        INSERT INTO inventory_snapshot_location (snapshot_id, location_id, used_space, capacity_rsu)
        SELECT $1, location_id, current_rsu_usage, capacity_rsu 
        FROM location
        WHERE business_id = $2
      `, [snapshotId, businessId]);
    }
    
    await client.query('COMMIT');
    console.log(`${snapshotType} snapshot completed successfully`);
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`Error creating ${snapshotType} snapshot:`, error);
    return false;
  } finally {
    client.release();
  }
}