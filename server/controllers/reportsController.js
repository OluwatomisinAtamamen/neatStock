import { pool } from '../dbConnection.js';

// Get all snapshots for the authenticated business
export async function getSnapshots(req, res) {
  try {
    const businessId = req.session.businessId;
    if (!businessId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const result = await pool.query(`
      SELECT 
        snapshot_id, 
        snapshot_date, 
        snapshot_type,
        description
      FROM inventory_snapshot
      WHERE business_id = $1
      ORDER BY snapshot_date DESC
      LIMIT 52  -- Last year of weekly snapshots
    `, [businessId]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting snapshots:', error);
    res.status(500).json({ message: 'Error getting snapshots', error: error.message });
  }
}

// Create a new snapshot
export async function createSnapshot(req, res) {
  try {
    const businessId = req.session.businessId;
    if (!businessId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const { description } = req.body;
    const snapshotType = 'manual'; // Manual snapshot created by user
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Create snapshot record
      const snapshotResult = await client.query(
        `INSERT INTO inventory_snapshot (business_id, snapshot_type, description) 
         VALUES ($1, $2, $3)
         RETURNING snapshot_id, snapshot_date`,
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
      
      await client.query('COMMIT');
      
      res.status(201).json({
        message: 'Snapshot created successfully',
        snapshot_id: snapshotId,
        snapshot_date: snapshotResult.rows[0].snapshot_date
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating snapshot:', error);
    res.status(500).json({ message: 'Error creating snapshot', error: error.message });
  }
}

// Get Low stock report - with support for historical snapshots
export async function getLowStockReport(req, res) {
  try {
    const businessId = req.session.businessId;
    const { snapshotId } = req.query;
    
    if (!businessId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // If viewing a historical snapshot
    if (snapshotId) {
      // Verify this snapshot belongs to this business
      const snapshotCheck = await pool.query(
        `SELECT snapshot_id FROM inventory_snapshot 
         WHERE snapshot_id = $1 AND business_id = $2`,
        [snapshotId, businessId]
      );
      
      if (snapshotCheck.rows.length === 0) {
        return res.status(404).json({ message: 'Snapshot not found' });
      }
      
      // Get snapshot info
      const snapshotInfo = await pool.query(
        `SELECT snapshot_id, snapshot_date, snapshot_type, description
         FROM inventory_snapshot WHERE snapshot_id = $1`,
        [snapshotId]
      );
      
      // Get snapshot items with low stock
      const result = await pool.query(`
        SELECT 
          bi.item_id,
          bi.item_name,
          c.category_name,
          si.quantity_in_stock as total_quantity,
          CASE 
            WHEN si.quantity_in_stock = 0 THEN 'out_of_stock'
            WHEN si.quantity_in_stock <= bi.min_stock_level THEN 'below_minimum'
            WHEN si.quantity_in_stock <= bi.min_stock_level * 1.5 THEN 'near_minimum'
            ELSE 'sufficient'
          END as stock_status
        FROM 
          inventory_snapshot_item si
        JOIN
          business_item bi ON si.item_id = bi.item_id
        LEFT JOIN
          category c ON bi.category_id = c.category_id
        JOIN
          inventory_snapshot s ON si.snapshot_id = s.snapshot_id
        WHERE 
          s.snapshot_id = $1
          AND bi.business_id = $2
          AND si.quantity_in_stock <= bi.min_stock_level * 1.5
        ORDER BY 
          CASE 
            WHEN si.quantity_in_stock = 0 THEN 1
            WHEN si.quantity_in_stock <= bi.min_stock_level THEN 2
            ELSE 3
          END,
          si.quantity_in_stock ASC
      `, [snapshotId, businessId]);
      
      const summary = {
        total_low_stock: result.rows.length,
        out_of_stock: result.rows.filter(item => item.stock_status === 'out_of_stock').length,
        below_minimum: result.rows.filter(item => item.stock_status === 'below_minimum').length,
        near_minimum: result.rows.filter(item => item.stock_status === 'near_minimum').length
      };
      
      return res.json({
        summary,
        items: result.rows,
        snapshot_info: snapshotInfo.rows[0]
      });
    }
    
    // Otherwise show current data (regular report)
    const result = await pool.query(`
      SELECT 
        bi.item_id,
        bi.item_name,
        c.category_name,
        bi.quantity_in_stock as total_quantity,
        CASE 
          WHEN bi.quantity_in_stock = 0 THEN 'out_of_stock'
          WHEN bi.quantity_in_stock <= bi.min_stock_level THEN 'below_minimum'
          WHEN bi.quantity_in_stock <= bi.min_stock_level * 1.5 THEN 'near_minimum'
          ELSE 'sufficient'
        END as stock_status
      FROM 
        business_item bi
      LEFT JOIN
        category c ON bi.category_id = c.category_id
      WHERE 
        bi.business_id = $1
        AND bi.quantity_in_stock <= bi.min_stock_level * 1.5
      ORDER BY 
        CASE 
          WHEN bi.quantity_in_stock = 0 THEN 1
          WHEN bi.quantity_in_stock <= bi.min_stock_level THEN 2
          ELSE 3
        END,
        bi.quantity_in_stock ASC
    `, [businessId]);

    const summary = {
      total_low_stock: result.rows.length,
      out_of_stock: result.rows.filter(item => item.stock_status === 'out_of_stock').length,
      below_minimum: result.rows.filter(item => item.stock_status === 'below_minimum').length,
      near_minimum: result.rows.filter(item => item.stock_status === 'near_minimum').length
    };

    res.json({
      summary,
      items: result.rows,
      is_current: true
    });
  } catch (error) {
    console.error('Error getting low stock report:', error);
    res.status(500).json({ message: 'Error getting low stock report', error: error.message });
  }
}

// Get space utilisation report - with support for historical snapshots
export async function getSpaceUtilisationReport(req, res) {
  try {
    const businessId = req.session.businessId;
    const { snapshotId } = req.query;
    
    if (!businessId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // If viewing a historical snapshot
    if (snapshotId) {
      // Verify this snapshot belongs to this business
      const snapshotCheck = await pool.query(
        `SELECT snapshot_id FROM inventory_snapshot 
         WHERE snapshot_id = $1 AND business_id = $2`,
        [snapshotId, businessId]
      );
      
      if (snapshotCheck.rows.length === 0) {
        return res.status(404).json({ message: 'Snapshot not found' });
      }
      
      // Get snapshot info
      const snapshotInfo = await pool.query(
        `SELECT snapshot_id, snapshot_date, snapshot_type, description
         FROM inventory_snapshot WHERE snapshot_id = $1`,
        [snapshotId]
      );
      
      // Get locations with their historical utilization data
      const result = await pool.query(`
        SELECT 
          l.location_id,
          l.location_name,
          sl.capacity_rsu,
          sl.used_space,
          sl.capacity_rsu - sl.used_space as available_space,
          CASE 
            WHEN sl.capacity_rsu = 0 THEN 0
            ELSE ROUND((sl.used_space / sl.capacity_rsu) * 100, 1)
          END as utilisation_percentage,
          CASE 
            WHEN sl.capacity_rsu = 0 THEN 'no_capacity'
            WHEN (sl.used_space / sl.capacity_rsu) >= 0.9 THEN 'critical'
            WHEN (sl.used_space / sl.capacity_rsu) >= 0.75 THEN 'warning'
            ELSE 'good'
          END as utilisation_status
        FROM 
          inventory_snapshot_location sl
        JOIN
          location l ON sl.location_id = l.location_id
        WHERE 
          sl.snapshot_id = $1
          AND l.business_id = $2
        ORDER BY 
          utilisation_percentage DESC
      `, [snapshotId, businessId]);
      
      // Calculate overall statistics from snapshot data
      let totalCapacity = 0;
      let totalUsed = 0;
      let mostFullLocation = { name: 'None', percentage: 0 };

      result.rows.forEach(loc => {
        totalCapacity += parseFloat(loc.capacity_rsu);
        totalUsed += parseFloat(loc.used_space);
        
        if (parseFloat(loc.utilisation_percentage) > mostFullLocation.percentage) {
          mostFullLocation = {
            name: loc.location_name,
            percentage: parseFloat(loc.utilisation_percentage)
          };
        }
      });

      const overallPercentage = totalCapacity > 0 
        ? Math.round((totalUsed / totalCapacity) * 100) 
        : 0;

      const summary = {
        overall_usage: overallPercentage,
        most_full_location: mostFullLocation,
        total_capacity: totalCapacity,
        total_used: totalUsed,
        total_available: totalCapacity - totalUsed
      };
      
      return res.json({
        summary,
        locations: result.rows,
        snapshot_info: snapshotInfo.rows[0]
      });
    }

    // Otherwise show current data (regular report)
    // First, ensure all current_rsu_usage values are up-to-date
    await pool.query(`
      UPDATE location l
      SET current_rsu_usage = COALESCE(sq.total_usage, 0)
      FROM (
        SELECT 
          il.location_id,
          SUM(il.quantity * bi.rsu_value) as total_usage
        FROM 
          item_location il
        JOIN 
          business_item bi ON il.item_id = bi.item_id
        GROUP BY 
          il.location_id
      ) sq
      WHERE l.location_id = sq.location_id AND l.business_id = $1
    `, [businessId]);

    // Then fetch the updated data
    const result = await pool.query(`
      SELECT 
        location_id,
        location_name,
        capacity_rsu,
        current_rsu_usage as used_space,
        capacity_rsu - current_rsu_usage as available_space,
        CASE 
          WHEN capacity_rsu = 0 THEN 0
          ELSE ROUND((current_rsu_usage / capacity_rsu) * 100, 1)
        END as utilisation_percentage,
        CASE 
          WHEN capacity_rsu = 0 THEN 'no_capacity'
          WHEN (current_rsu_usage / capacity_rsu) >= 0.9 THEN 'critical'
          WHEN (current_rsu_usage / capacity_rsu) >= 0.75 THEN 'warning'
          ELSE 'good'
        END as utilisation_status
      FROM location
      WHERE business_id = $1
      ORDER BY utilisation_percentage DESC
    `, [businessId]);

    // Calculate overall statistics
    let totalCapacity = 0;
    let totalUsed = 0;
    let mostFullLocation = { name: 'None', percentage: 0 };

    result.rows.forEach(loc => {
      totalCapacity += parseFloat(loc.capacity_rsu);
      totalUsed += parseFloat(loc.used_space);
      
      if (parseFloat(loc.utilisation_percentage) > mostFullLocation.percentage) {
        mostFullLocation = {
          name: loc.location_name,
          percentage: parseFloat(loc.utilisation_percentage)
        };
      }
    });

    const overallPercentage = totalCapacity > 0 
      ? Math.round((totalUsed / totalCapacity) * 100) 
      : 0;

    const summary = {
      overall_usage: overallPercentage,
      most_full_location: mostFullLocation,
      total_capacity: totalCapacity,
      total_used: totalUsed,
      total_available: totalCapacity - totalUsed
    };

    res.json({
      summary,
      locations: result.rows,
      is_current: true
    });
  } catch (error) {
    console.error('Error getting space utilisation report:', error);
    res.status(500).json({ message: 'Error getting space utilisation report', error: error.message });
  }
}

//  Delete snapshot
export async function deleteSnapshot(req, res) {
  try {
    const businessId = req.session.businessId;
    const { snapshotId } = req.params;
    
    if (!businessId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Verify this snapshot belongs to this business
    const snapshotCheck = await pool.query(
      `SELECT snapshot_id FROM inventory_snapshot 
       WHERE snapshot_id = $1 AND business_id = $2`,
      [snapshotId, businessId]
    );
    
    if (snapshotCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Snapshot not found' });
    }
    
    // Delete snapshot (cascade will delete related records)
    await pool.query(
      `DELETE FROM inventory_snapshot WHERE snapshot_id = $1`,
      [snapshotId]
    );
    
    res.json({ message: 'Snapshot deleted successfully' });
  } catch (error) {
    console.error('Error deleting snapshot:', error);
    res.status(500).json({ message: 'Error deleting snapshot', error: error.message });
  }
}