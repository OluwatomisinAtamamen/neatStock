import { pool } from '../dbConnection.js';
import bcrypt from 'bcrypt';

// Get business profile
export async function getBusinessProfile(req, res) {
  try {
    const businessId = req.session.businessId;
    if (!businessId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Check if user is admin
    if (!req.session.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const result = await pool.query(
      `SELECT 
        business_name as "businessName", 
        business_email as "businessEmail",
        add1,
        add2,
        city,
        postcode,
        country,
        rsu_reference
       FROM business 
       WHERE business_id = $1`,
      [businessId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Business not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching business profile:', error);
    res.status(500).json({ message: 'Error fetching business profile', error: error.message });
  }
}

// Update business profile
export async function updateBusinessProfile(req, res) {
  try {
    const businessId = req.session.businessId;
    if (!businessId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (!req.session.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { 
      businessName, 
      businessEmail, 
      add1, 
      add2, 
      city, 
      postcode, 
      country, 
      rsu_reference 
    } = req.body;

    if (!businessName || !businessEmail) {
      return res.status(400).json({ message: 'Business name and email are required' });
    }

    // Update all fields individually
    const result = await pool.query(
      `UPDATE business 
        SET business_name = $1,
            business_email = $2,
            add1 = $3,
            add2 = $4,
            city = $5,
            postcode = $6,
            country = $7,
            rsu_reference = $8
        WHERE business_id = $9
        RETURNING 
            business_name as "businessName", 
            business_email as "businessEmail",
            add1,
            add2,
            city,
            postcode,
            country,
            rsu_reference`,
      [
        businessName, 
        businessEmail, 
        add1 || '', 
        add2 || '', 
        city || '', 
        postcode || '', 
        country || '', 
        rsu_reference || '', 
        businessId
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Business not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating business profile:', error);
    res.status(500).json({ message: 'Error updating business profile', error: error.message });
  }
}

// Get all staff members for the business
export async function getStaff(req, res) {
  try {
    const businessId = req.session.businessId;
    if (!businessId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Check if user is admin
    if (!req.session.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const result = await pool.query(
      `SELECT user_id as id,
              CONCAT(first_name, ' ', last_name) as name,
              username,
              is_admin
       FROM app_user 
       WHERE business_id = $1
       ORDER BY name`,
      [businessId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ message: 'Error fetching staff', error: error.message });
  }
}

// Add a new staff member
export async function addStaff(req, res) {
  try {
    const businessId = req.session.businessId;
    if (!businessId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Check if user is admin
    if (!req.session.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { firstName, lastName, username, password, is_admin } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !username || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if username already exists
    const existingUser = await pool.query(
      `SELECT username FROM app_user WHERE username = $1`,
      [username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Add the staff member
    const result = await pool.query(
      `INSERT INTO app_user (
        business_id,
        username,
        password_hash,
        first_name,
        last_name,
        is_admin
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING user_id as id, 
                CONCAT(first_name, ' ', last_name) as name,
                username,
                is_admin`,
      [businessId, username, passwordHash, firstName, lastName, is_admin]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding staff:', error);
    res.status(500).json({ message: 'Error adding staff', error: error.message });
  }
}

// Update a staff member's admin status
export async function updateStaffAdmin(req, res) {
  try {
    const businessId = req.session.businessId;
    if (!businessId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Check if user is admin
    if (!req.session.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { staffId } = req.params;
    const { is_admin } = req.body;

    // Validate parameters
    if (is_admin === undefined) {
      return res.status(400).json({ message: 'Admin status is required' });
    }

    // Update the staff member
    const result = await pool.query(
      `UPDATE app_user 
       SET is_admin = $1
       WHERE user_id = $2 AND business_id = $3
       RETURNING user_id as id, 
                 CONCAT(first_name, ' ', last_name) as name,
                 username,
                 is_admin`,
      [is_admin, staffId, businessId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating staff:', error);
    res.status(500).json({ message: 'Error updating staff', error: error.message });
  }
}

// Delete a staff member
export async function deleteStaff(req, res) {
  try {
    const businessId = req.session.businessId;
    if (!businessId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Check if user is admin
    if (!req.session.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { staffId } = req.params;
    
    // Prevent deleting self
    if (parseInt(staffId) === parseInt(req.session.userId)) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    // Delete the staff member
    const result = await pool.query(
      `DELETE FROM app_user 
       WHERE user_id = $1 AND business_id = $2
       RETURNING user_id`,
      [staffId, businessId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    res.json({ message: 'Staff member deleted successfully', id: staffId });
  } catch (error) {
    console.error('Error deleting staff:', error);
    res.status(500).json({ message: 'Error deleting staff', error: error.message });
  }
}

// Get all categories for the business
export async function getCategories(req, res) {
  try {
    const businessId = req.session.businessId;
    if (!businessId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Check if user is admin for consistency
    if (!req.session.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
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

    // Check if user is admin
    if (!req.session.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
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
    
    // Check if user is admin
    if (!req.session.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
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
    
    // Check if user is admin
    if (!req.session.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
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