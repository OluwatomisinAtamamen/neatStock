-- Create the business table
CREATE TABLE business (
    business_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name VARCHAR(255) NOT NULL,
    business_email VARCHAR(255) UNIQUE,
    setup_complete BOOLEAN DEFAULT FALSE,
    add1 VARCHAR(60),
    add2 VARCHAR(60),
    city VARCHAR(60),
    postcode CHARACTER(10),
    country VARCHAR(60),
    rsu_reference VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the user table
CREATE TABLE app_user (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES business(business_id),
    username VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(35) NOT NULL,
    last_name VARCHAR(35) NOT NULL,
    is_admin BOOLEAN DEFAULT TRUE,
    is_owner BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP,
    CONSTRAINT unique_email_per_business UNIQUE(business_id, username)
);

-- Create product catalog (global reference table)
CREATE TABLE product_catalog (
    catalog_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    barcode VARCHAR(100) UNIQUE NOT NULL,
    pack_size INTEGER NOT NULL
);

-- Create the category table
CREATE TABLE category (
    category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES business(business_id),
    category_name VARCHAR(100) NOT NULL,
    description TEXT,
    CONSTRAINT unique_category_name_per_business UNIQUE(business_id, category_name)
);

-- Create the location table
CREATE TABLE location (
    location_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES business(business_id),
    location_name VARCHAR(100) NOT NULL,
    location_code VARCHAR(50) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    capacity_rsu INTEGER NOT NULL,
    current_rsu_usage INTEGER DEFAULT 0,
    CONSTRAINT unique_location_name_per_business UNIQUE(business_id, location_name),
    CONSTRAINT unique_location_code_per_business UNIQUE(business_id, location_code)
);

-- Create the business_item table (items specific to each business)
CREATE TABLE business_item (
    item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES business(business_id),
    catalog_id UUID REFERENCES product_catalog(catalog_id),
    category_id UUID REFERENCES category(category_id),
    item_name VARCHAR(255) NOT NULL,
    sku VARCHAR(50),
    unit_price DECIMAL(10,2) DEFAULT 0 NOT NULL,
    cost_price DECIMAL(10,2) DEFAULT 0 NOT NULL,
    quantity_in_stock INTEGER DEFAULT 0 NOT NULL,
    rsu_value DECIMAL(5,2) DEFAULT 1.0 NOT NULL,
    min_stock_level INTEGER DEFAULT 0 NOT NULL,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the item_location junction table
CREATE TABLE item_location (
    location_id UUID NOT NULL REFERENCES location(location_id),
    item_id UUID NOT NULL REFERENCES business_item(item_id),
    quantity INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (location_id, item_id)
);

-- Create the session table
CREATE TABLE sessions (
  sid VARCHAR(255) PRIMARY KEY,
  sess JSON NOT NULL,
  expire TIMESTAMP NOT NULL
);

-- Add tables to track historical inventory state

-- Main snapshots table
CREATE TABLE inventory_snapshot (
  snapshot_id SERIAL PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES business(business_id),
  snapshot_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  snapshot_type VARCHAR(50) NOT NULL,
  description VARCHAR(255)
);

-- Item quantities at snapshot time
CREATE TABLE inventory_snapshot_item (
  snapshot_id INTEGER REFERENCES inventory_snapshot(snapshot_id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES business_item(item_id),
  quantity_in_stock INTEGER NOT NULL,
  PRIMARY KEY (snapshot_id, item_id)
);

-- Location usage at snapshot time
CREATE TABLE inventory_snapshot_location (
  snapshot_id INTEGER REFERENCES inventory_snapshot(snapshot_id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES location(location_id),
  used_space DECIMAL(10,2) NOT NULL,
  capacity_rsu DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (snapshot_id, location_id)
);

-- Create trigger function to update location Relative Space Unit(RSU) usage
CREATE OR REPLACE FUNCTION update_location_rsu_usage()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the current RSU usage for the affected location
    -- RSU tracks how much capacity is being used in a location
    UPDATE location
    SET current_rsu_usage = (
        -- Calculate total RSU usage by multiplying each item's quantity by its RSU value
        -- COALESCE ensures we return 0 if there are no items in the location (rather than NULL)
        SELECT COALESCE(SUM(il.quantity * bi.rsu_value), 0)
        FROM item_location il
        JOIN business_item bi ON il.item_id = bi.item_id
        -- Only consider items in the location that triggered this function
        WHERE il.location_id = NEW.location_id
    )
    WHERE location_id = NEW.location_id;
    
    -- Return the NEW record to complete the trigger operation
    -- This allows the original INSERT/UPDATE operation to proceed
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update RSU usage when items are added/modified
CREATE TRIGGER update_rsu_after_item_location_change
AFTER INSERT OR UPDATE OR DELETE ON item_location
FOR EACH ROW EXECUTE FUNCTION update_location_rsu_usage();


-- Create trigger function to synchronize item quantities between locations and master inventory
CREATE OR REPLACE FUNCTION sync_item_total_quantity()
RETURNS TRIGGER AS $$
BEGIN
    -- After any change to item_location, recalculate total quantity for the affected item
    UPDATE business_item
    SET quantity_in_stock = (
        SELECT COALESCE(SUM(quantity), 0)
        FROM item_location
        WHERE item_id = COALESCE(NEW.item_id, OLD.item_id)
    )
    WHERE item_id = COALESCE(NEW.item_id, OLD.item_id);
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update total quantity when item quantities change in any location
CREATE TRIGGER sync_total_quantity_after_location_change
AFTER INSERT OR UPDATE OR DELETE ON item_location
FOR EACH ROW EXECUTE FUNCTION sync_item_total_quantity();




-- Test data
-- Start a transaction to ensure everything is created together
BEGIN;

-- Insert a business and get its ID
WITH new_business AS (
  INSERT INTO business (business_name, business_email, setup_complete, add1, add2, city, postcode, country, rsu_reference)
  VALUES 
  ('African Foods Ltd', 'contact@africanfoods.co.uk', TRUE, '123 High Street', 'Suite 4', 'London', 'E1 6AN    ', 'United Kingdom', 'Standard Can of Beans (400g)')
  RETURNING business_id
)
-- Insert the admin user with the newly created business_id
INSERT INTO app_user (
    business_id, 
    username, 
    password_hash, 
    first_name, 
    last_name, 
    is_admin,
    is_owner,
    last_login_at
)
SELECT 
    business_id, 
    'Tomi', 
    '$2b$10$N1bXtViY2DXyftPZ3s5DNehTnot0qhVaVNR3.fZS4qWB3AatHP1O2',
    'Tomi',
    'Atamamen',
    TRUE,
    TRUE,
    CURRENT_TIMESTAMP
FROM new_business;

COMMIT;

-- Now insert the categories, locations, and products
DO $$
DECLARE
    business_id_val UUID;
BEGIN
    SELECT business_id INTO business_id_val FROM business WHERE business_name = 'African Foods Ltd';

    -- Insert categories
    INSERT INTO category (business_id, category_name, description)
    VALUES
        (business_id_val, 'Grains & Rice', 'All types of rice, wheat, millet and other grains'),
        (business_id_val, 'Canned Goods', 'Preserved items in cans and jars'),
        (business_id_val, 'Spices', 'Herbs, seasonings and spice mixes'),
        (business_id_val, 'Beverages', 'Drinks, juices and water'),
        (business_id_val, 'Snacks', 'Chips, biscuits and other snack items'),
        (business_id_val, 'Meat & Fish', 'Frozen and dried meat and fish products'),
        (business_id_val, 'Oils & Sauces', 'Cooking oils, condiments and sauces'),
        (business_id_val, 'Fresh Produce', 'Vegetables, fruits and tubers'),
        (business_id_val, 'Baking Supplies', 'Flour, sugar and baking ingredients'),
        (business_id_val, 'Household', 'Non-food household items');

    -- Insert locations
    INSERT INTO location (business_id, location_name, location_code, description, capacity_rsu, image_url)
    VALUES
        (business_id_val, 'Main Shopfloor', 'SF-MAIN', 'Front of store main display area', 500, '/uploads/locations/shopfloor.jpg'),
        (business_id_val, 'Front Window', 'SF-WINDOW', 'Window display area', 50, '/uploads/locations/window.jpg'),
        (business_id_val, 'Cold Section', 'SF-COLD', 'Refrigerated display cases', 150, '/uploads/locations/cold.jpg'),
        (business_id_val, 'Checkout Area', 'SF-CHECKOUT', 'Items near registers for impulse buys', 30, '/uploads/locations/checkout.jpg'),
        (business_id_val, 'Main Warehouse', 'WH-MAIN', 'Primary storage area', 2000, '/uploads/locations/warehouse.jpg'),
        (business_id_val, 'Cold Storage', 'WH-COLD', 'Cold storage room', 300, '/uploads/locations/coldstorage.jpg'),
        (business_id_val, 'Back Office', 'OFFICE', 'Office with excess storage', 100, '/uploads/locations/office.jpg'),
        (business_id_val, 'High Value Cabinet', 'SF-SECURE', 'Locked cabinet for high-value items', 40, '/uploads/locations/cabinet.jpg'),
        (business_id_val, 'Seasonal Area', 'SF-SEASON', 'Display for seasonal items', 120, '/uploads/locations/seasonal.jpg'),
        (business_id_val, 'Overflow Storage', 'WH-OVER', 'Additional warehouse space for peak season', 800, '/uploads/locations/overflow.jpg');
    
    -- Insert product catalog items
    INSERT INTO product_catalog (name, description, barcode, pack_size)
    VALUES
        ('Jollof Rice Mix', 'Pre-mixed spice for making Jollof Rice', '5060123450001', 1),
        ('Palm Oil 1L', 'Pure Red Palm Oil', '5060123450002', 1),
        ('Plantain Chips 150g', 'Crispy fried plantain chips', '5060123450003', 1),
        ('Yam Flour 1kg', 'Premium ground yam flour for fufu', '5060123450004', 1),
        ('Scotch Bonnet Peppers 200g', 'Fresh hot peppers', '5060123450005', 1),
        ('Dried Fish 500g', 'Smoked and dried fish', '5060123450006', 1),
        ('Egusi Seeds 500g', 'Melon seeds for soup', '5060123450007', 1),
        ('Fufu Flour 1kg', 'Plantain-based fufu flour', '5060123450008', 1),
        ('African Honey 250ml', 'Pure wild honey', '5060123450009', 1),
        ('Chin Chin 300g', 'Sweet fried snack', '5060123450010', 1);
END $$;

-- Insert business items and connect to locations in a single transaction
WITH 
business_id_val AS (SELECT business_id FROM business WHERE business_name = 'African Foods Ltd'),
categories AS (
    SELECT category_id, category_name FROM category 
    WHERE business_id = (SELECT * FROM business_id_val)
),
locations AS (
    SELECT location_id, location_name FROM location 
    WHERE business_id = (SELECT * FROM business_id_val)
),
catalog_items AS (
    SELECT catalog_id, name FROM product_catalog
),
-- Insert business items and return their IDs
inserted_items AS (
    INSERT INTO business_item (
        business_id, catalog_id, category_id, item_name, 
        sku, unit_price, cost_price, quantity_in_stock, 
        rsu_value, min_stock_level, image_url
    )
    VALUES
        (
            (SELECT * FROM business_id_val), 
            (SELECT catalog_id FROM catalog_items WHERE name = 'Jollof Rice Mix'),
            (SELECT category_id FROM categories WHERE category_name = 'Spices'),
            'Jollof Rice Seasoning Mix',
            'JLF-001', 3.99, 1.50, 0, 0.5, 10,
            '/uploads/items/jollof-mix.jpg'
        ),
        (
            (SELECT * FROM business_id_val), 
            (SELECT catalog_id FROM catalog_items WHERE name = 'Palm Oil 1L'),
            (SELECT category_id FROM categories WHERE category_name = 'Oils & Sauces'),
            'Traditional Red Palm Oil 1L',
            'OIL-101', 8.99, 4.25, 0, 1.0, 5,
            '/uploads/items/palm-oil.jpg'
        ),
        (
            (SELECT * FROM business_id_val), 
            (SELECT catalog_id FROM catalog_items WHERE name = 'Plantain Chips 150g'),
            (SELECT category_id FROM categories WHERE category_name = 'Snacks'),
            'Sweet Plantain Chips',
            'SNK-201', 1.99, 0.75, 0, 0.5, 15,
            '/uploads/items/plantain-chips.jpg'
        ),
        (
            (SELECT * FROM business_id_val), 
            (SELECT catalog_id FROM catalog_items WHERE name = 'Yam Flour 1kg'),
            (SELECT category_id FROM categories WHERE category_name = 'Baking Supplies'),
            'Premium Yam Flour',
            'FLR-301', 7.50, 3.25, 0, 1.5, 8,
            '/uploads/items/yam-flour.jpg'
        ),
        (
            (SELECT * FROM business_id_val), 
            (SELECT catalog_id FROM catalog_items WHERE name = 'Scotch Bonnet Peppers 200g'),
            (SELECT category_id FROM categories WHERE category_name = 'Fresh Produce'),
            'Fresh Scotch Bonnet Peppers',
            'VEG-101', 2.99, 1.20, 0, 0.5, 5,
            '/uploads/items/scotch-bonnet.jpg'
        ),
        (
            (SELECT * FROM business_id_val), 
            (SELECT catalog_id FROM catalog_items WHERE name = 'Dried Fish 500g'),
            (SELECT category_id FROM categories WHERE category_name = 'Meat & Fish'),
            'Smoked Dried Fish',
            'FSH-001', 12.99, 6.50, 0, 1.0, 3,
            '/uploads/items/dried-fish.jpg'
        ),
        (
            (SELECT * FROM business_id_val), 
            (SELECT catalog_id FROM catalog_items WHERE name = 'Egusi Seeds 500g'),
            (SELECT category_id FROM categories WHERE category_name = 'Grains & Rice'),
            'Premium Egusi Seeds',
            'EGS-001', 4.99, 2.25, 0, 1.0, 7,
            '/uploads/items/egusi.jpg'
        ),
        (
            (SELECT * FROM business_id_val), 
            (SELECT catalog_id FROM catalog_items WHERE name = 'Fufu Flour 1kg'),
            (SELECT category_id FROM categories WHERE category_name = 'Grains & Rice'),
            'Ready-mix Fufu Flour',
            'FFU-001', 6.99, 3.00, 0, 1.5, 6,
            '/uploads/items/fufu-flour.jpg'
        ),
        (
            (SELECT * FROM business_id_val), 
            (SELECT catalog_id FROM catalog_items WHERE name = 'African Honey 250ml'),
            (SELECT category_id FROM categories WHERE category_name = 'Canned Goods'),
            'Pure Wild Honey',
            'HNY-201', 9.99, 4.75, 0, 0.5, 4,
            '/uploads/items/honey.jpg'
        ),
        (
            (SELECT * FROM business_id_val), 
            (SELECT catalog_id FROM catalog_items WHERE name = 'Chin Chin 300g'),
            (SELECT category_id FROM categories WHERE category_name = 'Snacks'),
            'Sweet Chin Chin',
            'SNK-405', 3.49, 1.25, 0, 0.5, 12,
            '/uploads/items/chin-chin.jpg'
        )
    RETURNING item_id, item_name
)
-- Now insert item-location relationships with quantities
INSERT INTO item_location (item_id, location_id, quantity)
VALUES
    -- Jollof Rice Mix in two locations
    (
        (SELECT item_id FROM inserted_items WHERE item_name = 'Jollof Rice Seasoning Mix'),
        (SELECT location_id FROM locations WHERE location_name = 'Main Shopfloor'),
        8
    ),
    (
        (SELECT item_id FROM inserted_items WHERE item_name = 'Jollof Rice Seasoning Mix'),
        (SELECT location_id FROM locations WHERE location_name = 'Main Warehouse'),
        25
    ),
    
    -- Palm Oil in two locations
    (
        (SELECT item_id FROM inserted_items WHERE item_name = 'Traditional Red Palm Oil 1L'),
        (SELECT location_id FROM locations WHERE location_name = 'Main Shopfloor'),
        4
    ),
    (
        (SELECT item_id FROM inserted_items WHERE item_name = 'Traditional Red Palm Oil 1L'),
        (SELECT location_id FROM locations WHERE location_name = 'Main Warehouse'),
        12
    ),
    
    -- Plantain Chips in two locations
    (
        (SELECT item_id FROM inserted_items WHERE item_name = 'Sweet Plantain Chips'),
        (SELECT location_id FROM locations WHERE location_name = 'Checkout Area'),
        20
    ),
    (
        (SELECT item_id FROM inserted_items WHERE item_name = 'Sweet Plantain Chips'),
        (SELECT location_id FROM locations WHERE location_name = 'Main Warehouse'),
        45
    ),
    
    -- Yam Flour in two locations
    (
        (SELECT item_id FROM inserted_items WHERE item_name = 'Premium Yam Flour'),
        (SELECT location_id FROM locations WHERE location_name = 'Main Shopfloor'),
        6
    ),
    (
        (SELECT item_id FROM inserted_items WHERE item_name = 'Premium Yam Flour'),
        (SELECT location_id FROM locations WHERE location_name = 'Overflow Storage'),
        15
    ),
    
    -- Scotch Bonnet Peppers in two locations
    (
        (SELECT item_id FROM inserted_items WHERE item_name = 'Fresh Scotch Bonnet Peppers'),
        (SELECT location_id FROM locations WHERE location_name = 'Cold Section'),
        3
    ),
    (
        (SELECT item_id FROM inserted_items WHERE item_name = 'Fresh Scotch Bonnet Peppers'),
        (SELECT location_id FROM locations WHERE location_name = 'Cold Storage'),
        8
    ),
    
    -- Dried Fish in two locations - Low stock item (below min_stock_level)
    (
        (SELECT item_id FROM inserted_items WHERE item_name = 'Smoked Dried Fish'),
        (SELECT location_id FROM locations WHERE location_name = 'Main Shopfloor'),
        2
    ),
    (
        (SELECT item_id FROM inserted_items WHERE item_name = 'Smoked Dried Fish'),
        (SELECT location_id FROM locations WHERE location_name = 'Main Warehouse'),
        0
    ),
    
    -- Egusi Seeds in two locations
    (
        (SELECT item_id FROM inserted_items WHERE item_name = 'Premium Egusi Seeds'),
        (SELECT location_id FROM locations WHERE location_name = 'Main Shopfloor'),
        5
    ),
    (
        (SELECT item_id FROM inserted_items WHERE item_name = 'Premium Egusi Seeds'),
        (SELECT location_id FROM locations WHERE location_name = 'Main Warehouse'),
        18
    ),
    
    -- Fufu Flour in two locations
    (
        (SELECT item_id FROM inserted_items WHERE item_name = 'Ready-mix Fufu Flour'),
        (SELECT location_id FROM locations WHERE location_name = 'Main Shopfloor'),
        4
    ),
    (
        (SELECT item_id FROM inserted_items WHERE item_name = 'Ready-mix Fufu Flour'),
        (SELECT location_id FROM locations WHERE location_name = 'Overflow Storage'),
        10
    ),
    
    -- African Honey in two locations - Another low stock item
    (
        (SELECT item_id FROM inserted_items WHERE item_name = 'Pure Wild Honey'),
        (SELECT location_id FROM locations WHERE location_name = 'High Value Cabinet'),
        2
    ),
    (
        (SELECT item_id FROM inserted_items WHERE item_name = 'Pure Wild Honey'),
        (SELECT location_id FROM locations WHERE location_name = 'Main Warehouse'),
        1
    ),
    
    -- Chin Chin in two locations
    (
        (SELECT item_id FROM inserted_items WHERE item_name = 'Sweet Chin Chin'),
        (SELECT location_id FROM locations WHERE location_name = 'Checkout Area'),
        5
    ),
    (
        (SELECT item_id FROM inserted_items WHERE item_name = 'Sweet Chin Chin'),
        (SELECT location_id FROM locations WHERE location_name = 'Main Warehouse'),
        20
    );
