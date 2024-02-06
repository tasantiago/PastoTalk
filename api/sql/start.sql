CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS "users" (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255),
    username VARCHAR(80) UNIQUE NOT NULL,
    password VARCHAR(128) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS location (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    dairy_cattle BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE 
);

CREATE TABLE IF NOT EXISTS user_location_association (
    user_id UUID,
    location_id INTEGER,
    PRIMARY KEY (user_id, location_id),
    CONSTRAINT fk_user
        FOREIGN KEY (user_id) 
        REFERENCES "users" (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_location
        FOREIGN KEY (location_id) 
        REFERENCES location (id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS animal (
    id SERIAL PRIMARY KEY,
    birth_date DATE NOT NULL,
    gender VARCHAR NOT NULL,
    entry_date DATE NOT NULL,
    death_date DATE,
    date_sale DATE,
    location_id INTEGER NOT NULL,
    CONSTRAINT fk_animal_location
        FOREIGN KEY (location_id) 
        REFERENCES location (id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS animal_photo (
    id SERIAL PRIMARY KEY,
    animal_id INTEGER NOT NULL,
    photo_url VARCHAR(255) NOT NULL,
    CONSTRAINT fk_animal_photo_animal
        FOREIGN KEY (animal_id) 
        REFERENCES animal (id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS expense (
    id SERIAL PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    value FLOAT NOT NULL,
    date DATE NOT NULL,
    paid BOOLEAN NOT NULL DEFAULT FALSE,
    installments INTEGER,
    location_id INTEGER NOT NULL,
    CONSTRAINT fk_expense_location
        FOREIGN KEY (location_id) 
        REFERENCES location (id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS income (
    id SERIAL PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    value FLOAT NOT NULL,
    date DATE NOT NULL,
    received BOOLEAN NOT NULL DEFAULT FALSE,
    location_id INTEGER NOT NULL,
    CONSTRAINT fk_income_location
        FOREIGN KEY (location_id) 
        REFERENCES location (id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS milk_price (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    price FLOAT NOT NULL,
    location_id INTEGER NOT NULL,
    CONSTRAINT fk_milk_price_location
        FOREIGN KEY (location_id) 
        REFERENCES location (id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS milk_production (
    id SERIAL PRIMARY KEY,
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    quantity FLOAT NOT NULL,
    location_id INTEGER NOT NULL,
    CONSTRAINT fk_milk_production_location
        FOREIGN KEY (location_id) 
        REFERENCES location (id)
        ON DELETE CASCADE
);