import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Initialize the database connection.
 * @async
 * @function init
 * @returns {Promise<Object>} The database connection object.
 */
async function init() {
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database,
    verbose: true,
  });
  await db.migrate({ migrationsPath: './migrations-sqlite' });
  return db;
}

const dbConn = init();

/**
 * Create a new user account in the database.
 * @async
 * @function createUser
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @returns {Promise<Object>} The result of the database operation.
 */
export async function createUser(email, password, first_name, last_name, business_name) {
  const db = await dbConn;
  const result = await db.run(`
    INSERT INTO ACCOUNT (ACCOUNT_ID, EMAIL, PASSWORD, FIRST_NAME, LAST_NAME, BUSINESS_NAME) 
    VALUES (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-a' || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))), ?, ?, ?, ?, ?)
  `, email, password, first_name, last_name, business_name);
  return result;
}

/**
 * Get a user account from the database by email.
 * @async
 * @function getUser
 * @param {string} email - The user's email address.
 * @returns {Promise<Object>} The user account object, or null if not found.
 */
export async function getUser(email) {
  const db = await dbConn;
  const result = await db.get(`
    SELECT ACCOUNT_ID AS id, PASSWORD AS hashedPassword, FIRST_NAME AS firstName, LAST_NAME AS lastName, BUSINESS_NAME AS businessName
    FROM ACCOUNT
    WHERE EMAIL = ?`, email);
  return result;
}