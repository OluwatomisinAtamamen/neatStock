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
    default_category VARCHAR(100),
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_sku_per_business UNIQUE(business_id, sku)
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



-- Insert sample data into product_catalog
INSERT INTO product_catalog (name, description, barcode, default_category, pack_size) VALUES
('Indomie Instant Noodles', 'Chicken flavour, 75g pack', '5018821000016', 'Dry Goods', 5),
('Golden Penny Semolina', '1kg pack', '0701470530214', 'Grains & Staples', 10),
('Gino Spaghetti', '500g pack', '6192234000152', 'Pasta & Noodles', 8),
('Chakalaka Spice Mix', 'South African vegetable relish spice', '6009612410011', 'Spices & Seasonings', 12),
('Peak Milk Powder', 'Full cream, 400g tin', '0760056830127', 'Dairy Alternatives', 6),
('Unguard Cooking Oil', 'Vegetable oil, 2L bottle', '6009800001001', 'Oils & Fats', 4),
('Mama’s Choice Rice', 'Parboiled long grain, 5kg sack', '5000187171536', 'Grains & Staples', 2),
('National Sugar', 'White granulated sugar, 2kg pack', '6898240012345', 'Baking & Sweeteners', 6),
('Tropicana Waves Juice', 'Mango flavour, 1L carton', '6178493001105', 'Beverages', 8),
('Sardine King Tinned Sardines', 'In tomato sauce, 125g tin', '6004311630012', 'Canned Goods', 12),
('Brookside Dark Chocolate', 'Mixed berries, 90g bar', '7164012010018', 'Snacks & Sweets', 10),
('Tusker Lager', '330ml bottle', '6009600002007', 'Alcoholic Beverages', 24),
('Eko Nigerian Yams', 'Pre-peeled yam chunks, 1kg pack', '0701470520207', 'Fresh Produce', 5),
('Big B Banana Chips', 'Salted, 150g bag', '6291101800156', 'Snacks & Sweets', 12),
('Zainab’s Groundnuts', 'Roasted peanuts, 200g pack', '8106580200016', 'Snacks & Nuts', 10),
('Blue Band Margarine', '500g tub', '8711617060015', 'Spreads & Butters', 8),
('Garden Tomato Paste', '200g tube', '6004830030015', 'Condiments', 12),
('Egusi Melon Seeds', '500g pack', '0701470530313', 'Grains & Staples', 6),
('Lipton Yellow Label Tea', '100 tea bags', '8901030870012', 'Beverages', 4),
('Dano Full Cream Milk', '500g tin', '8906001510010', 'Dairy Alternatives', 8);
