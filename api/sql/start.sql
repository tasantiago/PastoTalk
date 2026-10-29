-- Schema for new databases; existing databases: apply migrations in order.
CREATE TABLE IF NOT EXISTS users (
 id UUID PRIMARY KEY, name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL,
 username VARCHAR(80) UNIQUE NOT NULL, password VARCHAR(128) NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, is_active BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE TABLE IF NOT EXISTS location (
 id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL, address VARCHAR(255) NOT NULL,
 dairy_cattle BOOLEAN NOT NULL DEFAULT FALSE, is_active BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE TABLE IF NOT EXISTS user_location_association (
 user_id UUID REFERENCES users(id) ON DELETE CASCADE,
 location_id INTEGER REFERENCES location(id) ON DELETE CASCADE,
 role VARCHAR(10) NOT NULL DEFAULT 'viewer' CONSTRAINT membership_role CHECK(role IN('admin','editor','viewer')),
 PRIMARY KEY(user_id,location_id)
);
CREATE TABLE IF NOT EXISTS animal (
 id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL, birth_date DATE NOT NULL,
 gender VARCHAR(10) NOT NULL CHECK(gender IN('female','male')),
 entry_date DATE NOT NULL CHECK(entry_date>=birth_date), death_date DATE, sale_date DATE,
 photo_url VARCHAR(2048) NOT NULL DEFAULT '', location_id INTEGER NOT NULL REFERENCES location(id) ON DELETE CASCADE,
 CHECK(death_date IS NULL OR death_date>=entry_date), CHECK(sale_date IS NULL OR sale_date>=entry_date),
 CHECK(death_date IS NULL OR sale_date IS NULL)
);
CREATE TABLE IF NOT EXISTS animal_photo (
 id SERIAL PRIMARY KEY, animal_id INTEGER NOT NULL REFERENCES animal(id) ON DELETE CASCADE, photo_url VARCHAR(2048) NOT NULL
);
CREATE TABLE IF NOT EXISTS expense (
 id SERIAL PRIMARY KEY, description VARCHAR(255) NOT NULL, value NUMERIC(14,2) NOT NULL CHECK(value>0),
 date DATE NOT NULL, paid BOOLEAN NOT NULL DEFAULT FALSE,
 installments INTEGER NOT NULL DEFAULT 1 CHECK(installments BETWEEN 1 AND 360),
 location_id INTEGER NOT NULL REFERENCES location(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS income (
 id SERIAL PRIMARY KEY, description VARCHAR(255) NOT NULL, value NUMERIC(14,2) NOT NULL CHECK(value>0),
 date DATE NOT NULL, received BOOLEAN NOT NULL DEFAULT FALSE,
 location_id INTEGER NOT NULL REFERENCES location(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS milk_price (
 id SERIAL PRIMARY KEY, date DATE NOT NULL, price NUMERIC(14,4) NOT NULL CHECK(price>0),
 location_id INTEGER NOT NULL REFERENCES location(id) ON DELETE CASCADE, UNIQUE(location_id,date)
);
CREATE TABLE IF NOT EXISTS milk_production (
 id SERIAL PRIMARY KEY, date DATE NOT NULL DEFAULT CURRENT_DATE, quantity NUMERIC(14,3) NOT NULL CHECK(quantity>0),
 location_id INTEGER NOT NULL REFERENCES location(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS animal_location_idx ON animal(location_id);
CREATE INDEX IF NOT EXISTS expense_location_date_idx ON expense(location_id,date);
CREATE INDEX IF NOT EXISTS income_location_date_idx ON income(location_id,date);
CREATE INDEX IF NOT EXISTS milk_production_location_date_idx ON milk_production(location_id,date);
CREATE INDEX IF NOT EXISTS association_location_idx ON user_location_association(location_id);
