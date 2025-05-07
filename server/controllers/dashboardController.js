import { pool } from '../dbConnection.js';

// Get dashboard metrics and data
export async function getDashboardData(req, res) {
    try {
      const businessId = req.session.businessId;
      if (!businessId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
  
      // Get total items count
      const itemCountResult = await pool.query(
        `SELECT COUNT(*) FROM business_item WHERE business_id = $1`,
        [businessId]
      );
      const totalItems = parseInt(itemCountResult.rows[0].count);
  
      // Get space utilization - FIXED column names
      const spaceResult = await pool.query(
        `SELECT 
          SUM(l.capacity_rsu) as total_capacity,
          SUM(l.current_rsu_usage) as total_used
         FROM location l
         WHERE l.business_id = $1`,
        [businessId]
      );
      
      const totalCapacity = parseFloat(spaceResult.rows[0].total_capacity) || 0;
      const totalUsed = parseFloat(spaceResult.rows[0].total_used) || 0;
      const spaceUtilization = totalCapacity > 0 
        ? Math.round((totalUsed / totalCapacity) * 100) 
        : 0;
  
      // Get low stock items count - FIXED column names
      const lowStockResult = await pool.query(
        `SELECT COUNT(*) FROM business_item bi
         WHERE bi.business_id = $1
         AND bi.quantity_in_stock <= bi.min_stock_level`,
        [businessId]
      );
      const lowStockItems = parseInt(lowStockResult.rows[0].count);
  
      // Get total inventory value - FIXED column names
      const valueResult = await pool.query(
        `SELECT SUM(bi.quantity_in_stock * bi.cost_price) as total_value
         FROM business_item bi
         WHERE bi.business_id = $1`,
        [businessId]
      );
      const totalValue = parseFloat(valueResult.rows[0].total_value) || 0;

      res.json({
        totalItems,
        spaceUtilization,
        lowStockItems,
        totalValue
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      res.status(500).json({ message: 'Error fetching dashboard data', error: error.message });
    }
  }