import { pool } from '../dbConnection.js';

// Get all categories for the business
export async function getCategories(req, res) {
  try {
    const businessId = req.session.businessId;
    if (!businessId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const result = await pool.query(
      `SELECT category_id, category_name, description 
       FROM category 
       WHERE business_id = $1
       ORDER BY category_name`,
      [businessId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
}

// Create a new category
export async function createCategory(req, res) {
  try {
    const businessId = req.session.businessId;
    if (!businessId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { category_name, description } = req.body;
    
    if (!category_name) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    
    // Check if category with same name already exists
    const existingCheck = await pool.query(
      `SELECT * FROM category 
       WHERE business_id = $1 AND LOWER(category_name) = LOWER($2)`,
      [businessId, category_name]
    );
    
    if (existingCheck.rows.length > 0) {
      return res.status(400).json({ message: 'A category with this name already exists' });
    }
    
    // Create the category
    const result = await pool.query(
      `INSERT INTO category (business_id, category_name, description) 
       VALUES ($1, $2, $3)
       RETURNING category_id, category_name, description`,
      [businessId, category_name, description]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Error creating category', error: error.message });
  }
}

// Update a category
export async function updateCategory(req, res) {
  try {
    const businessId = req.session.businessId;
    if (!businessId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const { categoryId } = req.params;
    const { category_name, description } = req.body;
    
    if (!category_name) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    
    // Check if this category belongs to the business
    const existingCheck = await pool.query(
      `SELECT * FROM category 
       WHERE business_id = $1 AND category_id = $2`,
      [businessId, categoryId]
    );
    
    if (existingCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Check if another category with the same name exists
    const nameCheck = await pool.query(
      `SELECT * FROM category 
       WHERE business_id = $1 AND LOWER(category_name) = LOWER($2) AND category_id != $3`,
      [businessId, category_name, categoryId]
    );
    
    if (nameCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Another category with this name already exists' });
    }
    
    // Update the category
    const result = await pool.query(
      `UPDATE category 
       SET category_name = $1, description = $2
       WHERE category_id = $3 AND business_id = $4
       RETURNING category_id, category_name, description`,
      [category_name, description, categoryId, businessId]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Error updating category', error: error.message });
  }
}

// Delete a category
export async function deleteCategory(req, res) {
  try {
    const businessId = req.session.businessId;
    if (!businessId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const { categoryId } = req.params;
    
    // Check if category is in use
    const usageCheck = await pool.query(
      `SELECT COUNT(*) FROM business_item
       WHERE business_id = $1 AND category_id = $2`,
      [businessId, categoryId]
    );
    
    if (parseInt(usageCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        message: 'This category is currently in use by one or more items and cannot be deleted' 
      });
    }
    
    // Delete the category
    const result = await pool.query(
      `DELETE FROM category 
       WHERE category_id = $1 AND business_id = $2
       RETURNING category_id`,
      [categoryId, businessId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Error deleting category', error: error.message });
  }
}