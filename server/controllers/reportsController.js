import { pool } from '../dbConnection.js';

// Get low stock items report
export async function getLowStockReport(req, res) {
    try {
      const businessId = req.session.businessId;
      if (!businessId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
  
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
        items: result.rows
      });
    } catch (error) {
      console.error('Error getting low stock report:', error);
      res.status(500).json({ message: 'Error getting low stock report', error: error.message });
    }
  }

// Get space utilisation report
export async function getSpaceUtilisationReport(req, res) {
    try {
      const businessId = req.session.businessId;
      if (!businessId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
  
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
        locations: result.rows
      });
    } catch (error) {
      console.error('Error getting space utilisation report:', error);
      res.status(500).json({ message: 'Error getting space utilisation report', error: error.message });
    }
  }