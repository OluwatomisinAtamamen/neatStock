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

-- Create trigger function to update location RSU usage
CREATE OR REPLACE FUNCTION update_location_rsu_usage()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE location
    SET current_rsu_usage = (
        SELECT COALESCE(SUM(il.quantity * bi.rsu_value), 0)
        FROM item_location il
        JOIN business_item bi ON il.item_id = bi.item_id
        WHERE il.location_id = NEW.location_id
    )
    WHERE location_id = NEW.location_id;
    
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



INSERT INTO product_catalog (name, description, barcode, pack_size) VALUES
('Standard Can of Beans', '400g tin of baked beans', '0123456789012', 1),
('Family Pack Rice', '5 kg bag of long grain rice', '0123456789013', 1),
('Small Spice Packet', '50 g mixed spice blend', '0123456789014', 1),
('Mineral Water Bottle', '1.5 L bottle of still water', '0123456789015', 1),
('Soda Can', '330 ml can of cola', '0123456789016', 1),
('Loaf of Bread', '800 g sliced wholemeal loaf', '0123456789017', 1),
('Egg Carton', '6 free-range eggs', '0123456789018', 1),
('Milk Carton', '2 L semi-skimmed milk', '0123456789019', 1),
('Chocolate Bar', '100 g milk chocolate', '0123456789020', 1),
('Pack of Noodles', '5 × 70 g instant noodles', '0123456789021', 5),
('Frozen Peas', '1 kg bag of frozen garden peas', '0123456789022', 1),
('Cooking Oil Bottle', '1 L sunflower oil', '0123456789023', 1),
('Toilet Roll Pack', '4 rolls of toilet paper', '0123456789024', 4),
('Laundry Detergent', '2 L liquid detergent', '0123456789025', 1),
('Dishwashing Tablets', '30-pack dishwasher tablets', '0123456789026', 30),
('Cereal Box', '750 g cornflakes cereal', '0123456789027', 1),
('Tea Bags', '80 tea bags, English Breakfast', '0123456789028', 80),
('Paper Towels', '2 rolls of kitchen paper towels', '0123456789029', 2),
('Butter Block', '250 g unsalted butter', '0123456789030', 1),
('Tomato Ketchup', '500 g bottle of ketchup', '0123456789031', 1);
