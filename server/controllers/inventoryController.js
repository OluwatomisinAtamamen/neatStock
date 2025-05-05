import { pool } from '../dbConnection.js';

// Add a new item to inventory
export async function addItem(req, res) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
  
    const businessId = req.session.businessId;
    const itemData = req.body;

    // First check if this item already exists in this location
    const locationCheck = await client.query(`
      SELECT il.quantity 
      FROM business_item bi
      JOIN item_location il ON bi.item_id = il.item_id
      WHERE bi.business_id = $1 
      AND il.location_id = $2
      AND bi.catalog_id = $3
    `, [businessId, itemData.locationId, itemData.catalogId]);

    if (locationCheck.rows.length > 0) {
      // Item already exists in this location
      throw new Error('This item already exists in the selected location. Please use the stocktake section to update its quantity.');
    }

    let itemId;
    
    // Check if the item already exists in the business's inventory
    const existingItemQuery = `
      SELECT item_id 
      FROM business_item 
      WHERE business_id = $1 
      AND catalog_id = $2`;
    
    const existingItemResult = await client.query(
      existingItemQuery, 
      [businessId, itemData.catalogId]
    );
    
    if (existingItemResult.rows.length > 0) {
      // Item exists, use its ID
      itemId = existingItemResult.rows[0].item_id;
    } else {
      // Create a new business_item
      const newItemResult = await client.query(`
        INSERT INTO business_item (
          business_id, catalog_id, category_id, item_name, sku, 
          unit_price, cost_price, rsu_value, min_stock_level, image_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING item_id
      `, [
        businessId, 
        itemData.catalogId,
        itemData.categoryId || null,
        itemData.name,
        itemData.sku || null,
        parseFloat(itemData.unitPrice) || 0,
        parseFloat(itemData.costPrice) || 0,
        parseFloat(itemData.rsuValue) || 1,
        parseInt(itemData.minStockLevel) || 0,
        itemData.imageUrl || null
      ]);
      
      itemId = newItemResult.rows[0].item_id;
    }
    
    // Add the item_location record
    await client.query(`
      INSERT INTO item_location (location_id, item_id, quantity)
      VALUES ($1, $2, $3)
      ON CONFLICT (location_id, item_id) 
      DO UPDATE SET quantity = item_location.quantity + EXCLUDED.quantity
    `, [
      itemData.locationId, 
      itemId, 
      parseInt(itemData.quantity) || 0
    ]);
    
    await client.query('COMMIT');
    
    res.status(201).json({ 
      message: 'Item added successfully',
      itemId 
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding item:', error);
    res.status(400).json({ 
      message: error.message || 'Error adding item',
      error: error.message 
    });
  } finally {
    client.release();
  }
}

// Update an item
export async function updateItem(req, res) {
  try {
    const businessId = req.session.businessId;
    if (!businessId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const { id } = req.params;
    const { 
      name, 
      sku, 
      categoryId, 
      minStockLevel, 
      rsuValue,
      costPrice,
      unitPrice
    } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Item name is required' });
    }
    
    // Update the item
    const query = `
      UPDATE business_item
      SET 
        item_name = $1,
        sku = $2,
        category_id = $3,
        min_stock_level = $4,
        rsu_value = $5,
        cost_price = $6,
        unit_price = $7,
        updated_at = NOW()
      WHERE item_id = $8 AND business_id = $9
      RETURNING *
    `;
    
    const params = [
      name,
      sku || null,
      categoryId || null,
      minStockLevel || 0,
      rsuValue || 1,
      costPrice || null,
      unitPrice || null,
      id,
      businessId
    ];
    
    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Get the updated item with all its details
    const getItemQuery = `
      SELECT 
        bi.item_id, bi.item_name as name, bi.sku, bi.quantity_in_stock, 
        bi.min_stock_level, bi.cost_price, bi.unit_price, bi.image_url,
        bi.rsu_value, c.category_id, c.category_name,
        COALESCE(
          (SELECT json_agg(json_build_object(
            'location_id', l.location_id, 
            'location_name', l.location_name,
            'quantity', il.quantity
          ))
          FROM item_location il
          JOIN location l ON il.location_id = l.location_id
          WHERE il.item_id = bi.item_id
          GROUP BY il.item_id), 
          '[]'
        ) as locations
      FROM business_item bi
      LEFT JOIN category c ON bi.category_id = c.category_id
      WHERE bi.item_id = $1
    `;
    
    const updatedItem = await pool.query(getItemQuery, [id]);
    res.json(updatedItem.rows[0]);
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ message: 'Error updating item', error: error.message });
  }
}

// Delete an item
export async function deleteItem(req, res) {
  try {
    const businessId = req.session.businessId;
    if (!businessId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const { id } = req.params;
    
    // Delete the item
    const query = `
      DELETE FROM business_item
      WHERE item_id = $1 AND business_id = $2
      RETURNING item_id
    `;
    
    const result = await pool.query(query, [id, businessId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ message: 'Error deleting item', error: error.message });
  }
}

// Save stocktake counts
export async function saveStocktake(req, res) {
  try {
    const businessId = req.session.businessId;
    if (!businessId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const { locationId, items } = req.body;
    
    if (!items || Object.keys(items).length === 0) {
      return res.status(400).json({ message: 'No items to update' });
    }
    
    // Start a transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Create stocktake record
      const stocktakeQuery = `
        INSERT INTO stocktake (business_id, location_id, created_by)
        VALUES ($1, $2, $3)
        RETURNING stocktake_id
      `;
      
      const stocktakeResult = await client.query(stocktakeQuery, [
        businessId, 
        locationId, 
        req.session.userId
      ]);
      
      const stocktakeId = stocktakeResult.rows[0].stocktake_id;
      
      // Process each item
      for (const itemId in items) {
        const { count, note } = items[itemId];
        
        // Record the stocktake entry
        const entryQuery = `
          INSERT INTO stocktake_entry (stocktake_id, item_id, counted_quantity, note)
          VALUES ($1, $2, $3, $4)
        `;
        
        await client.query(entryQuery, [stocktakeId, itemId, count, note || null]);
        
        // Update the item quantity in the specified location or globally
        if (locationId) {
          // Update in specific location
          const locationUpdateQuery = `
            UPDATE item_location
            SET quantity = $1
            WHERE item_id = $2 AND location_id = $3
          `;
          
          await client.query(locationUpdateQuery, [count, itemId, locationId]);
        } else {
          // Get current locations for the item
          const locationsQuery = `
            SELECT location_id, quantity
            FROM item_location
            WHERE item_id = $1
          `;
          
          const locationsResult = await client.query(locationsQuery, [itemId]);
          
          if (locationsResult.rows.length === 0) {
            // No locations exist yet, create a default one
            const defaultLocationQuery = `
              INSERT INTO item_location (item_id, location_id, quantity)
              VALUES ($1, 
                (SELECT location_id FROM location WHERE business_id = $2 ORDER BY created_at ASC LIMIT 1),
                $3
              )
            `;
            
            await client.query(defaultLocationQuery, [itemId, businessId, count]);
          } else if (locationsResult.rows.length === 1) {
            // Only one location exists, update it
            const singleLocationUpdate = `
              UPDATE item_location
              SET quantity = $1
              WHERE item_id = $2 AND location_id = $3
            `;
            
            await client.query(singleLocationUpdate, [
              count, 
              itemId, 
              locationsResult.rows[0].location_id
            ]);
          }
          // If multiple locations exist, we can't update them all without location context
        }
      }
      
      // Commit the transaction
      await client.query('COMMIT');
      
      res.status(200).json({ 
        message: 'Stocktake saved successfully',
        stocktakeId
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error saving stocktake:', error);
    res.status(500).json({ message: 'Error saving stocktake', error: error.message });
  }
}
