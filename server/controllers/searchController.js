import { pool } from '../dbConnection.js';

// Search for items in the business inventory and catalog
export async function searchItems(req, res) {
  try {
    const businessId = req.session.businessId;
    if (!businessId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const {
      query = '',
      category = '',
      location = '',
      stockStatus = 'all',
      sortBy = 'name',
      sortDir = 'asc',
      page = 1,
      limit = 20
    } = req.query;

    const offset = (page - 1) * limit;
    const params = [businessId, `%${query}%`, `%${query}%`];
    let paramIndex = 3;

    // Main CTE query
    let sqlQuery = `
      WITH inventory_items AS (
        SELECT 
          bi.item_id AS id,
          bi.item_name AS name,
          bi.sku,
          NULL AS barcode,
          bi.quantity_in_stock AS quantity,
          bi.rsu_value,
          bi.min_stock_level,
          bi.image_url,
          bi.cost_price,
          bi.unit_price,
          c.category_name,
          NULL AS default_category,
          COALESCE(ARRAY_AGG(DISTINCT l.location_name) FILTER (WHERE l.location_name IS NOT NULL), ARRAY[]::text[]) as locations,
          COALESCE(ARRAY_AGG(DISTINCT il.quantity) FILTER (WHERE il.quantity IS NOT NULL), ARRAY[]::int[]) as location_quantities,
          TRUE AS in_inventory
        FROM business_item bi
        LEFT JOIN category c ON bi.category_id = c.category_id
        LEFT JOIN item_location il ON bi.item_id = il.item_id
        LEFT JOIN location l ON il.location_id = l.location_id
        WHERE bi.business_id = $1
          AND (LOWER(bi.item_name) LIKE LOWER($2) OR LOWER(bi.sku) LIKE LOWER($3))
        GROUP BY bi.item_id, c.category_name
      ),
      catalog_items AS (
        SELECT
          pc.catalog_id AS id,
          pc.name,
          NULL AS sku,
          pc.barcode,
          0::int AS quantity,
          NULL::numeric AS rsu_value,
          NULL::int AS min_stock_level,
          NULL AS image_url,
          NULL::numeric AS cost_price,
          NULL::numeric AS unit_price,
          NULL AS category_name,
          pc.default_category,
          ARRAY[]::text[] AS locations,
          ARRAY[]::int[] AS location_quantities,
          FALSE AS in_inventory
        FROM product_catalog pc
        WHERE (LOWER(pc.name) LIKE LOWER($2) OR LOWER(pc.barcode) LIKE LOWER($3))
          AND NOT EXISTS (
            SELECT 1 FROM business_item bi
            WHERE bi.business_id = $1 AND bi.catalog_id = pc.catalog_id
          )
      ),
      combined_results AS (
        SELECT * FROM inventory_items
        UNION ALL
        SELECT * FROM catalog_items
      )
    `;

    // Filtering
    let whereClause = '';
    if (category) {
      whereClause += ` AND (category_name = $${++paramIndex} OR default_category = $${paramIndex})`;
      params.push(category);
    }
    if (location) {
      whereClause += ` AND (in_inventory = FALSE OR (
        in_inventory = TRUE AND $${++paramIndex} = ANY(locations)
      ))`;
      params.push(location);
    }
    if (stockStatus === 'in-stock') {
      whereClause += ` AND in_inventory = TRUE AND quantity > 0`;
    } else if (stockStatus === 'low-stock') {
      whereClause += ` AND in_inventory = TRUE AND quantity <= min_stock_level AND quantity > 0`;
    } else if (stockStatus === 'out-of-stock') {
      whereClause += ` AND in_inventory = TRUE AND quantity = 0`;
    } else if (stockStatus === 'catalog-only') {
      whereClause += ` AND in_inventory = FALSE`;
    }

    // Final SELECT
    sqlQuery += `
      SELECT * FROM combined_results
      WHERE 1=1 ${whereClause}
    `;

    // Sorting
    if (sortBy === 'name') {
      sqlQuery += ` ORDER BY name ${sortDir === 'desc' ? 'DESC' : 'ASC'}`;
    } else if (sortBy === 'category') {
      sqlQuery += ` ORDER BY COALESCE(category_name, default_category) ${sortDir === 'desc' ? 'DESC' : 'ASC'}`;
    } else if (sortBy === 'stock') {
      sqlQuery += ` ORDER BY in_inventory DESC, quantity ${sortDir === 'desc' ? 'DESC' : 'ASC'}`;
    }

    // Pagination
    sqlQuery += ` LIMIT $${++paramIndex} OFFSET $${++paramIndex}`;
    params.push(limit, offset);

    // Query execution
    const result = await pool.query(sqlQuery, params);

    // Count query for pagination
    const countParams = params.slice(0, params.length - 2);
    let countWhereClause = whereClause.replace(/\$\d+/g, (match) => {
      // Adjust param indexes for count query
      const idx = parseInt(match.slice(1));
      return `$${idx}`;
    });
    const countQuery = `
      WITH inventory_items AS (
        SELECT 
          bi.item_id AS id,
          c.category_name,
          NULL AS default_category
        FROM business_item bi
        LEFT JOIN category c ON bi.category_id = c.category_id
        WHERE bi.business_id = $1
          AND (LOWER(bi.item_name) LIKE LOWER($2) OR LOWER(bi.sku) LIKE LOWER($3))
      ),
      catalog_items AS (
        SELECT
          pc.catalog_id AS id,
          NULL AS category_name,
          pc.default_category
        FROM product_catalog pc
        WHERE (LOWER(pc.name) LIKE LOWER($2) OR LOWER(pc.barcode) LIKE LOWER($3))
          AND NOT EXISTS (
            SELECT 1 FROM business_item bi
            WHERE bi.business_id = $1 AND bi.catalog_id = pc.catalog_id
          )
      ),
      combined_results AS (
        SELECT * FROM inventory_items
        UNION ALL
        SELECT * FROM catalog_items
      )
      SELECT COUNT(*) as total_items FROM combined_results
      WHERE 1=1 ${countWhereClause}
    `;
    const countResult = await pool.query(countQuery, countParams);
    const totalItems = parseInt(countResult.rows[0].total_items);
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      items: result.rows,
      pagination: {
        totalItems,
        totalPages,
        currentPage: parseInt(page),
        hasMore: parseInt(page) < totalPages
      }
    });
  } catch (error) {
    console.error('Error searching items:', error);
    res.status(500).json({ message: 'Error searching items', error: error.message });
  }
}

// Get all categories for the business
export async function getCategories(req, res) {
  try {
    const businessId = req.session.businessId;
    if (!businessId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const query = `
      SELECT category_id, category_name 
      FROM category 
      WHERE business_id = $1
      ORDER BY category_name
    `;

    const result = await pool.query(query, [businessId]);
    res.json(result.rows);
    console.log(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
}

// Get all locations for the business
export async function getLocations(req, res) {
  try {
    const businessId = req.session.businessId;
    if (!businessId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const query = `
      SELECT location_id, location_name 
      FROM location 
      WHERE business_id = $1
      ORDER BY location_name
    `;

    const result = await pool.query(query, [businessId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ message: 'Error fetching locations', error: error.message });
  }
}