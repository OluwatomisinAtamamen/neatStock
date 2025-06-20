import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  ssl: { rejectUnauthorized: false }
});

// function to create a new user and business
export async function createUser(businessEmail, username, hashedPassword, firstName, lastName, businessName) {
  try {
    // Create business record
    const businessResult = await pool.query(
      `INSERT INTO business (business_name, business_email) 
       VALUES ($1, $2) 
       RETURNING business_id`,
      [businessName, businessEmail]
    );
    const businessId = businessResult.rows[0].business_id;
    
    // Create user record with separate username field
    const userResult = await pool.query(
      `INSERT INTO app_user (username, password_hash, first_name, last_name, business_id, is_owner) 
       VALUES ($1, $2, $3, $4, $5, true) 
       RETURNING user_id`,
      [username, hashedPassword, firstName, lastName, businessId]
    );
    
    return {
      userId: userResult.rows[0].user_id,
      businessId
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// function to get user by username
export async function getUser(username) {
  try {
    const result = await pool.query(
      `SELECT u.user_id, u.password_hash as "hashedPassword", u.first_name as "firstName", 
              u.last_name as "lastName", u.is_admin, b.business_name as "businessName", u.business_id as "businessId"
       FROM app_user u
       JOIN business b ON u.business_id = b.business_id
       WHERE u.username = $1`,
      [username]
    );
    return result.rows[0]; // returns undefined if no user found
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
}

// function to check if business email already exists
export async function getBusinessByEmail(email) {
  try {
    const result = await pool.query(
      `SELECT business_id, business_name
       FROM business
       WHERE business_email = $1`,
      [email.trim()] // trim to avoid whitespace issues
    );
    return result.rows[0]; // returns undefined if no business found
  } catch (error) {
    console.error('Error checking business email:', error);
    throw error;
  }
}