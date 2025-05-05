import { pool } from '../dbConnection.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function getLocations(req, res) {
  try {
    const businessId = req.session.businessId;
    if (!businessId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const result = await pool.query(
      `SELECT * FROM location 
       WHERE business_id = $1
       ORDER BY location_name ASC`,
      [businessId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ message: 'Error fetching locations', error: error.message });
  }
}

export async function getLocationById(req, res) {
  try {
    const businessId = req.session.businessId;
    const { locationId } = req.params;

    if (!businessId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const result = await pool.query(
      `SELECT * FROM location 
       WHERE business_id = $1 AND location_id = $2`,
      [businessId, locationId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Location not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching location:', error);
    res.status(500).json({ message: 'Error fetching location', error: error.message });
  }
}

export async function createLocation(req, res) {
  try {
    const businessId = req.session.businessId;
    if (!businessId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { location_name, location_code, description, capacity_rsu, image_url } = req.body;

    // Validate required fields
    if (!location_name || !location_code || !capacity_rsu) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if location code already exists for this business
    const existingCheck = await pool.query(
      `SELECT * FROM location 
       WHERE business_id = $1 AND (location_name = $2 OR location_code = $3)`,
      [businessId, location_name, location_code]
    );

    if (existingCheck.rows.length > 0) {
      return res.status(400).json({ 
        message: 'A location with this name or code already exists' 
      });
    }

    // Insert new location
    const result = await pool.query(
      `INSERT INTO location 
       (business_id, location_name, location_code, description, image_url, capacity_rsu, current_rsu_usage) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [businessId, location_name, location_code, description, image_url, capacity_rsu, 0]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating location:', error);
    res.status(500).json({ message: 'Error creating location', error: error.message });
  }
}

export async function updateLocation(req, res) {
  try {
    const businessId = req.session.businessId;
    const { locationId } = req.params;

    if (!businessId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { location_name, location_code, description, capacity_rsu, image_url } = req.body;

    // Validate required fields
    if (!location_name || !location_code || !capacity_rsu) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if this location belongs to the business
    const existingLocation = await pool.query(
      `SELECT * FROM location 
       WHERE business_id = $1 AND location_id = $2`,
      [businessId, locationId]
    );

    if (existingLocation.rows.length === 0) {
      return res.status(404).json({ message: 'Location not found' });
    }

    // Check if the new name or code conflicts with another location
    const conflictCheck = await pool.query(
      `SELECT * FROM location 
       WHERE business_id = $1 AND (location_name = $2 OR location_code = $3) AND location_id != $4`,
      [businessId, location_name, location_code, locationId]
    );

    if (conflictCheck.rows.length > 0) {
      return res.status(400).json({ 
        message: 'Another location with this name or code already exists' 
      });
    }

    // Update the location
    const result = await pool.query(
      `UPDATE location 
       SET location_name = $1, location_code = $2, description = $3, capacity_rsu = $4, image_url = $5
       WHERE location_id = $6 AND business_id = $7
       RETURNING *`,
      [location_name, location_code, description, capacity_rsu, image_url, locationId, businessId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ message: 'Error updating location', error: error.message });
  }
}

export async function deleteLocation(req, res) {
  try {
    const businessId = req.session.businessId;
    const { locationId } = req.params;

    if (!businessId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Check if this location has items
    const itemsCheck = await pool.query(
      `SELECT COUNT(*) FROM item_location WHERE location_id = $1`,
      [locationId]
    );

    if (parseInt(itemsCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete a location that contains items. Please move or delete items first.' 
      });
    }

    // Delete the location image if it exists
    const locationResult = await pool.query(
      `SELECT image_url FROM location WHERE location_id = $1 AND business_id = $2`,
      [locationId, businessId]
    );

    if (locationResult.rows.length > 0 && locationResult.rows[0].image_url) {
      const imagePath = path.join(__dirname, '../uploads', path.basename(locationResult.rows[0].image_url));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Delete the location
    const result = await pool.query(
      `DELETE FROM location 
       WHERE location_id = $1 AND business_id = $2
       RETURNING *`,
      [locationId, businessId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Location not found' });
    }

    res.json({ message: 'Location deleted successfully', location: result.rows[0] });
  } catch (error) {
    console.error('Error deleting location:', error);
    res.status(500).json({ message: 'Error deleting location', error: error.message });
  }
}

export async function uploadLocationImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Generate URL for the uploaded file
    const imageUrl = `/data/uploads/${req.file.filename}`;

    res.json({ 
      message: 'File uploaded successfully', 
      imageUrl 
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ message: 'Error uploading image', error: error.message });
  }
}