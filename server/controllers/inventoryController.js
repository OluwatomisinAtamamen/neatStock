import { pool } from '../dbConnection.js';

// Add a new item to inventory
export async function addItem(req, res) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
  
    const businessId = req.session.businessId;
    const itemData = req.body;
    let catalogId = itemData.catalogId;

    // If item is completely new (not in catalog yet)
    if (itemData.isNewCatalogItem) {
      // Create entry in product_catalog first
      const catalogResult = await client.query(`
        INSERT INTO product_catalog (name, description, barcode, pack_size)
        VALUES ($1, $2, $3, $4)
        RETURNING catalog_id
      `, [
        itemData.name,
        itemData.description || null,
        itemData.barcode,
        parseInt(itemData.packSize) || 1
      ]);
      
      // Get the new catalog ID
      catalogId = catalogResult.rows[0].catalog_id;
    } else if (catalogId) {
      // Verify that the catalog item exists if catalogId is provided
      const catalogCheck = await client.query(`
        SELECT catalog_id FROM product_catalog 
        WHERE catalog_id = $1
      `, [catalogId]);

      if (catalogCheck.rows.length === 0) {
        throw new Error('Invalid catalog item. Please select a valid item from the catalog or create a new one.');
      }
    } else {
      throw new Error('Must either create a new catalog item or select an existing one.');
    }

    // First check if this item already exists in this location
    const locationCheck = await client.query(`
      SELECT il.quantity 
      FROM business_item bi
      JOIN item_location il ON bi.item_id = il.item_id
      WHERE bi.business_id = $1 
      AND il.location_id = $2
      AND bi.catalog_id = $3
    `, [businessId, itemData.locationId, catalogId]);

    if (locationCheck.rows.length > 0) {
      throw new Error('This item already exists in the selected location. Please use the stocktake section to update its quantity.');
    }

    let itemId;
    
    const existingItemResult = await client.query(`
      SELECT item_id 
      FROM business_item 
      WHERE business_id = $1 
      AND catalog_id = $2
    `, [businessId, catalogId]);
    
    if (existingItemResult.rows.length > 0) {
      itemId = existingItemResult.rows[0].item_id;
    } else {
      const newItemResult = await client.query(`
        INSERT INTO business_item (
          business_id, catalog_id, category_id, item_name, sku, 
          unit_price, cost_price, rsu_value, min_stock_level, image_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING item_id
      `, [
        businessId, 
        catalogId,
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
    `, [
      itemData.locationId, 
      itemId, 
      parseInt(itemData.quantity) || 0
    ]);
    
    await client.query('COMMIT');
    
    res.status(201).json({ 
      message: 'Item added successfully',
      itemId,
      catalogId
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
  const client = await pool.connect();
  
  try {
    const businessId = req.session.businessId;
    if (!businessId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const { locationId, items } = req.body;
    
    if (!locationId) {
      return res.status(400).json({ message: 'Location ID is required' });
    }
    
    if (!items || Object.keys(items).length === 0) {
      return res.status(400).json({ message: 'No items to update' });
    }
    
    await client.query('BEGIN');
    
    // Process each item - simpler approach
    const updatedItems = [];
    
    for (const itemId in items) {
      const { count } = items[itemId];
      
      if (count === undefined || count === null) {
        continue;
      }
      
      // Use UPSERT pattern - insert if not exists, update if exists
      const upsertQuery = `
        INSERT INTO item_location (location_id, item_id, quantity)
        VALUES ($1, $2, $3)
        ON CONFLICT (location_id, item_id) 
        DO UPDATE SET quantity = $3
        RETURNING item_id
      `;
      
      const result = await client.query(upsertQuery, [
        locationId,
        itemId,
        parseInt(count)
      ]);
      
      if (result.rows.length > 0) {
        updatedItems.push(itemId);
      }
    }
    
    await client.query('COMMIT');
    
    res.status(200).json({ 
      message: 'Stocktake saved successfully',
      updatedItems,
      updatedCount: updatedItems.length
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error saving stocktake:', error);
    res.status(500).json({ message: 'Error saving stocktake', error: error.message });
  } finally {
    client.release();
  }
}